import { rectanglePool, withPooledObject } from '../performance/objectPool';
import { performanceMonitor } from '../performance/performanceMonitor';

export interface VirtualObject {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  zIndex?: number;
  visible?: boolean;
  culled?: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface SpatialNode<T extends VirtualObject> {
  bounds: { x: number; y: number; width: number; height: number };
  objects: T[];
  children?: SpatialNode<T>[];
}

export class QuadTree<T extends VirtualObject> {
  private root: SpatialNode<T>;
  private maxObjects = 10;
  private maxLevels = 5;
  private nodePool: SpatialNode<T>[] = [];

  constructor(bounds: { x: number; y: number; width: number; height: number }) {
    this.root = this.createNode(bounds);
  }

  private createNode(bounds: { x: number; y: number; width: number; height: number }): SpatialNode<T> {
    const node = this.nodePool.pop() || {
      bounds: { ...bounds },
      objects: [],
      children: undefined
    };
    
    node.bounds = { ...bounds };
    node.objects = [];
    node.children = undefined;
    
    return node;
  }

  private releaseNode(node: SpatialNode<T>): void {
    node.objects = [];
    node.children = undefined;
    if (this.nodePool.length < 100) {
      this.nodePool.push(node);
    }
  }

  insert(object: T, node: SpatialNode<T> = this.root, level = 0): void {
    if (node.children) {
      const index = this.getIndex(object.bounds, node.bounds);
      if (index !== -1) {
        this.insert(object, node.children[index], level + 1);
        return;
      }
    }

    node.objects.push(object);

    if (node.objects.length > this.maxObjects && level < this.maxLevels && !node.children) {
      this.subdivide(node);
      
      let i = node.objects.length;
      while (i--) {
        const obj = node.objects[i];
        const index = this.getIndex(obj.bounds, node.bounds);
        if (index !== -1) {
          node.objects.splice(i, 1);
          this.insert(obj, node.children![index], level + 1);
        }
      }
    }
  }

  private subdivide(node: SpatialNode<T>): void {
    const { x, y, width, height } = node.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    node.children = [
      this.createNode({ x: x + halfWidth, y, width: halfWidth, height: halfHeight }), // NE
      this.createNode({ x, y, width: halfWidth, height: halfHeight }), // NW
      this.createNode({ x, y: y + halfHeight, width: halfWidth, height: halfHeight }), // SW
      this.createNode({ x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }) // SE
    ];
  }

  private getIndex(bounds: { x: number; y: number; width: number; height: number }, nodeBounds: { x: number; y: number; width: number; height: number }): number {
    const midX = nodeBounds.x + nodeBounds.width / 2;
    const midY = nodeBounds.y + nodeBounds.height / 2;

    const inTop = bounds.y + bounds.height < midY;
    const inBottom = bounds.y > midY;
    const inLeft = bounds.x + bounds.width < midX;
    const inRight = bounds.x > midX;

    if (inTop) {
      if (inRight) return 0; // NE
      if (inLeft) return 1; // NW
    } else if (inBottom) {
      if (inLeft) return 2; // SW
      if (inRight) return 3; // SE
    }

    return -1; // Object spans multiple quadrants
  }

  query(bounds: { x: number; y: number; width: number; height: number }, node: SpatialNode<T> = this.root): T[] {
    const results: T[] = [];

    if (!this.intersects(bounds, node.bounds)) {
      return results;
    }

    for (const object of node.objects) {
      if (this.intersects(bounds, object.bounds)) {
        results.push(object);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        results.push(...this.query(bounds, child));
      }
    }

    return results;
  }

  private intersects(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  clear(node: SpatialNode<T> = this.root): void {
    node.objects = [];
    
    if (node.children) {
      for (const child of node.children) {
        this.clear(child);
        this.releaseNode(child);
      }
      node.children = undefined;
    }
  }

  remove(object: T, node: SpatialNode<T> = this.root): boolean {
    const index = node.objects.indexOf(object);
    
    if (index !== -1) {
      node.objects.splice(index, 1);
      return true;
    }

    if (node.children) {
      for (const child of node.children) {
        if (this.remove(object, child)) {
          return true;
        }
      }
    }

    return false;
  }

  update(object: T): void {
    this.remove(object);
    this.insert(object);
  }
}

export class VirtualizedCanvas<T extends VirtualObject> {
  private objects = new Map<string, T>();
  private spatialIndex: QuadTree<T>;
  private viewport: Viewport;
  private cullPadding: number;
  private visibleObjects = new Set<string>();
  private lastCullBounds?: { x: number; y: number; width: number; height: number };
  private cullCache = new Map<string, boolean>();
  private cullCacheGeneration = 0;

  constructor(
    canvasBounds: { width: number; height: number },
    viewport: Viewport,
    cullPadding = 100
  ) {
    this.spatialIndex = new QuadTree<T>({
      x: -canvasBounds.width,
      y: -canvasBounds.height,
      width: canvasBounds.width * 3,
      height: canvasBounds.height * 3
    });
    this.viewport = viewport;
    this.cullPadding = cullPadding;
  }

  addObject(object: T): void {
    this.objects.set(object.id, object);
    this.spatialIndex.insert(object);
    this.invalidateCullCache();
  }

  removeObject(id: string): void {
    const object = this.objects.get(id);
    if (object) {
      this.objects.delete(id);
      this.spatialIndex.remove(object);
      this.visibleObjects.delete(id);
      this.invalidateCullCache();
    }
  }

  updateObject(id: string, updates: Partial<T>): void {
    const object = this.objects.get(id);
    if (object) {
      const boundsChanged = updates.bounds && (
        updates.bounds.x !== object.bounds.x ||
        updates.bounds.y !== object.bounds.y ||
        updates.bounds.width !== object.bounds.width ||
        updates.bounds.height !== object.bounds.height
      );

      Object.assign(object, updates);

      if (boundsChanged) {
        this.spatialIndex.update(object);
        this.invalidateCullCache();
      }
    }
  }

  updateViewport(viewport: Partial<Viewport>): void {
    const viewportChanged = 
      viewport.x !== this.viewport.x ||
      viewport.y !== this.viewport.y ||
      viewport.width !== this.viewport.width ||
      viewport.height !== this.viewport.height ||
      viewport.scale !== this.viewport.scale;

    Object.assign(this.viewport, viewport);

    if (viewportChanged) {
      this.invalidateCullCache();
    }
  }

  private invalidateCullCache(): void {
    this.cullCacheGeneration++;
    if (this.cullCacheGeneration % 100 === 0) {
      this.cullCache.clear();
    }
  }

  getVisibleObjects(): T[] {
    const startCull = performanceMonitor.startRender();

    const cullBounds = withPooledObject(rectanglePool, rect => {
      const scale = this.viewport.scale;
      rect.set(
        this.viewport.x - this.cullPadding / scale,
        this.viewport.y - this.cullPadding / scale,
        (this.viewport.width + this.cullPadding * 2) / scale,
        (this.viewport.height + this.cullPadding * 2) / scale
      );
      return { ...rect };
    });

    // Check if viewport hasn't changed significantly
    if (this.lastCullBounds && this.boundsEqual(cullBounds, this.lastCullBounds, 10)) {
      performanceMonitor.endRender(startCull);
      return Array.from(this.visibleObjects).map(id => this.objects.get(id)!).filter(Boolean);
    }

    this.lastCullBounds = cullBounds;

    // Query spatial index
    const candidates = this.spatialIndex.query(cullBounds);
    
    // Update visible set
    this.visibleObjects.clear();
    const visible: T[] = [];

    for (const object of candidates) {
      if (object.visible === false || object.culled === true) continue;

      const cacheKey = `${object.id}-${this.cullCacheGeneration}`;
      let isVisible = this.cullCache.get(cacheKey);

      if (isVisible === undefined) {
        isVisible = this.isObjectVisible(object, cullBounds);
        this.cullCache.set(cacheKey, isVisible);
      }

      if (isVisible) {
        this.visibleObjects.add(object.id);
        visible.push(object);
      }
    }

    // Sort by z-index
    visible.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    performanceMonitor.endRender(startCull);
    performanceMonitor.updateObjectCounts(this.objects.size, visible.length);

    return visible;
  }

  private boundsEqual(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }, tolerance = 0): boolean {
    return Math.abs(a.x - b.x) <= tolerance &&
           Math.abs(a.y - b.y) <= tolerance &&
           Math.abs(a.width - b.width) <= tolerance &&
           Math.abs(a.height - b.height) <= tolerance;
  }

  private isObjectVisible(object: T, cullBounds: { x: number; y: number; width: number; height: number }): boolean {
    return !(
      object.bounds.x + object.bounds.width < cullBounds.x ||
      object.bounds.x > cullBounds.x + cullBounds.width ||
      object.bounds.y + object.bounds.height < cullBounds.y ||
      object.bounds.y > cullBounds.y + cullBounds.height
    );
  }

  getObjectAt(x: number, y: number): T | null {
    const worldX = x / this.viewport.scale + this.viewport.x;
    const worldY = y / this.viewport.scale + this.viewport.y;

    const candidates = this.spatialIndex.query({
      x: worldX - 1,
      y: worldY - 1,
      width: 2,
      height: 2
    });

    // Check in reverse order (top to bottom)
    for (let i = candidates.length - 1; i >= 0; i--) {
      const object = candidates[i];
      if (object.visible !== false && 
          worldX >= object.bounds.x &&
          worldX <= object.bounds.x + object.bounds.width &&
          worldY >= object.bounds.y &&
          worldY <= object.bounds.y + object.bounds.height) {
        return object;
      }
    }

    return null;
  }

  getObjectsInRegion(region: { x: number; y: number; width: number; height: number }): T[] {
    return this.spatialIndex.query(region).filter(obj => obj.visible !== false);
  }

  clear(): void {
    this.objects.clear();
    this.visibleObjects.clear();
    this.spatialIndex.clear();
    this.cullCache.clear();
    this.lastCullBounds = undefined;
  }

  getStats() {
    return {
      totalObjects: this.objects.size,
      visibleObjects: this.visibleObjects.size,
      cullCacheSize: this.cullCache.size,
      viewportX: Math.round(this.viewport.x),
      viewportY: Math.round(this.viewport.y),
      viewportScale: this.viewport.scale.toFixed(2)
    };
  }
}

// LOD (Level of Detail) Manager
export class LODManager<T extends VirtualObject & { renderDetail?: (ctx: CanvasRenderingContext2D, detail: 'low' | 'medium' | 'high') => void }> {
  private detailLevels = new Map<string, 'low' | 'medium' | 'high'>();
  private zoomThresholds = {
    low: 0.5,
    medium: 1.0,
    high: 2.0
  };

  setZoomThresholds(low: number, medium: number, high: number): void {
    this.zoomThresholds = { low, medium, high };
  }

  updateObjectLOD(object: T, viewport: Viewport): 'low' | 'medium' | 'high' {
    const objectArea = object.bounds.width * object.bounds.height;
    const screenArea = (object.bounds.width * viewport.scale) * (object.bounds.height * viewport.scale);
    const screenCoverage = screenArea / (viewport.width * viewport.height);

    let detail: 'low' | 'medium' | 'high';

    if (viewport.scale < this.zoomThresholds.low || screenCoverage < 0.001) {
      detail = 'low';
    } else if (viewport.scale < this.zoomThresholds.medium || screenCoverage < 0.01) {
      detail = 'medium';
    } else {
      detail = 'high';
    }

    this.detailLevels.set(object.id, detail);
    return detail;
  }

  getObjectLOD(objectId: string): 'low' | 'medium' | 'high' {
    return this.detailLevels.get(objectId) || 'medium';
  }

  renderObject(object: T, ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    const detail = this.updateObjectLOD(object, viewport);
    
    if (object.renderDetail) {
      object.renderDetail(ctx, detail);
    }
  }

  clear(): void {
    this.detailLevels.clear();
  }
}