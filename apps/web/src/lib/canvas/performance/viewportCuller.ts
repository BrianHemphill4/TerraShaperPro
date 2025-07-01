/**
 * Viewport Culling System - Only renders objects visible in the current viewport
 * Significantly improves performance for large canvases with many objects
 */

import { Rectangle, rectanglePool, withPooledObject } from './objectPool';

export interface Cullable {
  id: string;
  getBounds(): { x: number; y: number; width: number; height: number };
  isVisible: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export class ViewportCuller {
  private viewport: Viewport;
  private objects: Map<string, Cullable> = new Map();
  private visibleObjects: Set<string> = new Set();
  private spatialIndex: SpatialIndex;
  private cullPadding: number;

  constructor(viewport: Viewport, cullPadding: number = 50) {
    this.viewport = viewport;
    this.cullPadding = cullPadding;
    this.spatialIndex = new SpatialIndex();
  }

  updateViewport(viewport: Partial<Viewport>): void {
    this.viewport = { ...this.viewport, ...viewport };
    this.performCulling();
  }

  addObject(object: Cullable): void {
    this.objects.set(object.id, object);
    this.spatialIndex.insert(object);
    this.checkObjectVisibility(object);
  }

  removeObject(objectId: string): void {
    const object = this.objects.get(objectId);
    if (object) {
      this.objects.delete(objectId);
      this.visibleObjects.delete(objectId);
      this.spatialIndex.remove(object);
      object.isVisible = false;
    }
  }

  updateObject(object: Cullable): void {
    this.spatialIndex.update(object);
    this.checkObjectVisibility(object);
  }

  performCulling(): void {
    const expandedViewport = this.getExpandedViewport();
    const potentiallyVisible = this.spatialIndex.query(expandedViewport);

    // Hide previously visible objects that are now out of view
    this.visibleObjects.forEach(id => {
      if (!potentiallyVisible.has(id)) {
        const object = this.objects.get(id);
        if (object) {
          object.isVisible = false;
          this.visibleObjects.delete(id);
        }
      }
    });

    // Show objects that are now in view
    potentiallyVisible.forEach(id => {
      const object = this.objects.get(id);
      if (object && !this.visibleObjects.has(id)) {
        object.isVisible = true;
        this.visibleObjects.add(id);
      }
    });
  }

  private checkObjectVisibility(object: Cullable): void {
    const expandedViewport = this.getExpandedViewport();
    const bounds = object.getBounds();

    const isVisible = withPooledObject(rectanglePool, rect => {
      rect.set(bounds.x, bounds.y, bounds.width, bounds.height);
      return rect.intersects(expandedViewport);
    });

    object.isVisible = isVisible;
    if (isVisible) {
      this.visibleObjects.add(object.id);
    } else {
      this.visibleObjects.delete(object.id);
    }
  }

  private getExpandedViewport(): Rectangle {
    const rect = rectanglePool.acquire();
    const padding = this.cullPadding / this.viewport.scale;
    
    rect.set(
      this.viewport.x - padding,
      this.viewport.y - padding,
      this.viewport.width / this.viewport.scale + padding * 2,
      this.viewport.height / this.viewport.scale + padding * 2
    );
    
    return rect;
  }

  getVisibleObjects(): Cullable[] {
    return Array.from(this.visibleObjects).map(id => this.objects.get(id)!).filter(Boolean);
  }

  getVisibilityStats(): { total: number; visible: number; culled: number } {
    return {
      total: this.objects.size,
      visible: this.visibleObjects.size,
      culled: this.objects.size - this.visibleObjects.size
    };
  }

  clear(): void {
    this.objects.clear();
    this.visibleObjects.clear();
    this.spatialIndex.clear();
  }
}

/**
 * Spatial Index for efficient spatial queries
 * Uses a simple grid-based approach for performance
 */
class SpatialIndex {
  private cellSize: number;
  private grid: Map<string, Set<string>> = new Map();
  private objectCells: Map<string, Set<string>> = new Map();

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }

  insert(object: Cullable): void {
    const cells = this.getCellsForObject(object);
    this.objectCells.set(object.id, cells);

    cells.forEach(cellKey => {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, new Set());
      }
      this.grid.get(cellKey)!.add(object.id);
    });
  }

  remove(object: Cullable): void {
    const cells = this.objectCells.get(object.id);
    if (cells) {
      cells.forEach(cellKey => {
        const cell = this.grid.get(cellKey);
        if (cell) {
          cell.delete(object.id);
          if (cell.size === 0) {
            this.grid.delete(cellKey);
          }
        }
      });
      this.objectCells.delete(object.id);
    }
  }

  update(object: Cullable): void {
    this.remove(object);
    this.insert(object);
  }

  query(viewport: Rectangle): Set<string> {
    const results = new Set<string>();
    const cells = this.getCellsForViewport(viewport);

    cells.forEach(cellKey => {
      const cell = this.grid.get(cellKey);
      if (cell) {
        cell.forEach(id => results.add(id));
      }
    });

    return results;
  }

  private getCellsForObject(object: Cullable): Set<string> {
    const bounds = object.getBounds();
    return this.getCellsInBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  private getCellsForViewport(viewport: Rectangle): Set<string> {
    return this.getCellsInBounds(viewport.x, viewport.y, viewport.width, viewport.height);
  }

  private getCellsInBounds(x: number, y: number, width: number, height: number): Set<string> {
    const cells = new Set<string>();
    
    const startX = Math.floor(x / this.cellSize);
    const startY = Math.floor(y / this.cellSize);
    const endX = Math.floor((x + width) / this.cellSize);
    const endY = Math.floor((y + height) / this.cellSize);

    for (let cx = startX; cx <= endX; cx++) {
      for (let cy = startY; cy <= endY; cy++) {
        cells.add(`${cx},${cy}`);
      }
    }

    return cells;
  }

  clear(): void {
    this.grid.clear();
    this.objectCells.clear();
  }
}

// Viewport culling hook for React components
export function createViewportCuller(
  initialViewport: Viewport,
  options?: { cullPadding?: number }
): ViewportCuller {
  return new ViewportCuller(initialViewport, options?.cullPadding);
}

// Performance metrics for culling
export class CullingMetrics {
  private frameCount = 0;
  private totalCullTime = 0;
  private maxCullTime = 0;
  private lastResetTime = Date.now();

  recordCullTime(time: number): void {
    this.frameCount++;
    this.totalCullTime += time;
    this.maxCullTime = Math.max(this.maxCullTime, time);
  }

  getMetrics(): {
    avgCullTime: number;
    maxCullTime: number;
    cullingFPS: number;
  } {
    const now = Date.now();
    const elapsed = (now - this.lastResetTime) / 1000;
    
    return {
      avgCullTime: this.frameCount > 0 ? this.totalCullTime / this.frameCount : 0,
      maxCullTime: this.maxCullTime,
      cullingFPS: elapsed > 0 ? this.frameCount / elapsed : 0
    };
  }

  reset(): void {
    this.frameCount = 0;
    this.totalCullTime = 0;
    this.maxCullTime = 0;
    this.lastResetTime = Date.now();
  }
}