/**
 * Level of Detail (LOD) Manager
 * Renders objects with different complexity based on zoom level and performance
 */

export interface LODObject {
  id: string;
  renderHighDetail: (ctx: CanvasRenderingContext2D) => void;
  renderMediumDetail: (ctx: CanvasRenderingContext2D) => void;
  renderLowDetail: (ctx: CanvasRenderingContext2D) => void;
  getBounds(): { x: number; y: number; width: number; height: number };
}

export enum DetailLevel {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Hidden = 'hidden'
}

export interface LODConfig {
  highDetailThreshold: number;    // Zoom level above which to use high detail
  mediumDetailThreshold: number;  // Zoom level above which to use medium detail
  lowDetailThreshold: number;     // Zoom level below which objects are hidden
  pixelSizeThreshold: number;     // Min pixel size to render object
  performanceMode: boolean;       // Force lower detail for performance
}

export class LODManager {
  private objects: Map<string, LODObject> = new Map();
  private objectLevels: Map<string, DetailLevel> = new Map();
  private config: LODConfig;
  private currentZoom: number = 1;
  private viewportWidth: number;
  private viewportHeight: number;
  private performanceMetrics: PerformanceMetrics;

  constructor(
    viewportWidth: number,
    viewportHeight: number,
    config?: Partial<LODConfig>
  ) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.config = {
      highDetailThreshold: 1.5,
      mediumDetailThreshold: 0.5,
      lowDetailThreshold: 0.1,
      pixelSizeThreshold: 10,
      performanceMode: false,
      ...config
    };
    this.performanceMetrics = new PerformanceMetrics();
  }

  addObject(object: LODObject): void {
    this.objects.set(object.id, object);
    this.updateObjectLOD(object);
  }

  removeObject(objectId: string): void {
    this.objects.delete(objectId);
    this.objectLevels.delete(objectId);
  }

  updateZoom(zoom: number): void {
    this.currentZoom = zoom;
    this.updateAllObjectLODs();
  }

  updateViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.updateAllObjectLODs();
  }

  setPerformanceMode(enabled: boolean): void {
    this.config.performanceMode = enabled;
    this.updateAllObjectLODs();
  }

  renderObject(objectId: string, ctx: CanvasRenderingContext2D): void {
    const object = this.objects.get(objectId);
    if (!object) return;

    const level = this.objectLevels.get(objectId) || DetailLevel.Hidden;
    
    this.performanceMetrics.startRender(objectId, level);

    switch (level) {
      case DetailLevel.High:
        object.renderHighDetail(ctx);
        break;
      case DetailLevel.Medium:
        object.renderMediumDetail(ctx);
        break;
      case DetailLevel.Low:
        object.renderLowDetail(ctx);
        break;
      case DetailLevel.Hidden:
        // Don't render
        break;
    }

    this.performanceMetrics.endRender(objectId);
  }

  getObjectDetailLevel(objectId: string): DetailLevel {
    return this.objectLevels.get(objectId) || DetailLevel.Hidden;
  }

  private updateObjectLOD(object: LODObject): void {
    const bounds = object.getBounds();
    const screenSize = this.calculateScreenSize(bounds);
    
    let level: DetailLevel;

    // Check if object is too small to render
    if (screenSize < this.config.pixelSizeThreshold) {
      level = DetailLevel.Hidden;
    } else if (this.config.performanceMode) {
      // In performance mode, use lower detail levels
      if (this.currentZoom >= this.config.highDetailThreshold) {
        level = DetailLevel.Medium;
      } else if (this.currentZoom >= this.config.mediumDetailThreshold) {
        level = DetailLevel.Low;
      } else {
        level = DetailLevel.Hidden;
      }
    } else {
      // Normal mode
      if (this.currentZoom >= this.config.highDetailThreshold) {
        level = DetailLevel.High;
      } else if (this.currentZoom >= this.config.mediumDetailThreshold) {
        level = DetailLevel.Medium;
      } else if (this.currentZoom >= this.config.lowDetailThreshold) {
        level = DetailLevel.Low;
      } else {
        level = DetailLevel.Hidden;
      }
    }

    // Adjust based on performance metrics
    const avgRenderTime = this.performanceMetrics.getAverageRenderTime(object.id);
    if (avgRenderTime > 16 && level === DetailLevel.High) {
      // Downgrade if taking too long to render
      level = DetailLevel.Medium;
    }

    this.objectLevels.set(object.id, level);
  }

  private updateAllObjectLODs(): void {
    this.objects.forEach(object => {
      this.updateObjectLOD(object);
    });
  }

  private calculateScreenSize(bounds: { width: number; height: number }): number {
    // Calculate the diagonal size in screen pixels
    const screenWidth = bounds.width * this.currentZoom;
    const screenHeight = bounds.height * this.currentZoom;
    return Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
  }

  getStats(): {
    totalObjects: number;
    levelCounts: Record<DetailLevel, number>;
    performanceMetrics: {
      avgRenderTime: number;
      slowObjects: string[];
    };
  } {
    const levelCounts: Record<DetailLevel, number> = {
      [DetailLevel.High]: 0,
      [DetailLevel.Medium]: 0,
      [DetailLevel.Low]: 0,
      [DetailLevel.Hidden]: 0
    };

    this.objectLevels.forEach(level => {
      levelCounts[level]++;
    });

    return {
      totalObjects: this.objects.size,
      levelCounts,
      performanceMetrics: this.performanceMetrics.getStats()
    };
  }

  clear(): void {
    this.objects.clear();
    this.objectLevels.clear();
    this.performanceMetrics.clear();
  }
}

/**
 * Performance tracking for LOD decisions
 */
class PerformanceMetrics {
  private renderTimes: Map<string, number[]> = new Map();
  private currentRenders: Map<string, number> = new Map();
  private maxSamples = 10;

  startRender(objectId: string, level: DetailLevel): void {
    this.currentRenders.set(objectId, performance.now());
  }

  endRender(objectId: string): void {
    const startTime = this.currentRenders.get(objectId);
    if (!startTime) return;

    const renderTime = performance.now() - startTime;
    
    if (!this.renderTimes.has(objectId)) {
      this.renderTimes.set(objectId, []);
    }

    const times = this.renderTimes.get(objectId)!;
    times.push(renderTime);

    // Keep only recent samples
    if (times.length > this.maxSamples) {
      times.shift();
    }

    this.currentRenders.delete(objectId);
  }

  getAverageRenderTime(objectId: string): number {
    const times = this.renderTimes.get(objectId);
    if (!times || times.length === 0) return 0;

    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }

  getStats(): {
    avgRenderTime: number;
    slowObjects: string[];
  } {
    let totalTime = 0;
    let totalSamples = 0;
    const slowObjects: string[] = [];

    this.renderTimes.forEach((times, objectId) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      totalTime += times.reduce((a, b) => a + b, 0);
      totalSamples += times.length;

      if (avg > 16) {
        slowObjects.push(objectId);
      }
    });

    return {
      avgRenderTime: totalSamples > 0 ? totalTime / totalSamples : 0,
      slowObjects
    };
  }

  clear(): void {
    this.renderTimes.clear();
    this.currentRenders.clear();
  }
}

/**
 * Factory for creating LOD-enabled objects
 */
export function createLODObject(
  id: string,
  bounds: { x: number; y: number; width: number; height: number },
  renderers: {
    high: (ctx: CanvasRenderingContext2D) => void;
    medium: (ctx: CanvasRenderingContext2D) => void;
    low: (ctx: CanvasRenderingContext2D) => void;
  }
): LODObject {
  return {
    id,
    getBounds: () => bounds,
    renderHighDetail: renderers.high,
    renderMediumDetail: renderers.medium,
    renderLowDetail: renderers.low
  };
}

/**
 * Simplified LOD renderer for basic shapes
 */
export class SimpleLODRenderer {
  static renderPolygon(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    level: DetailLevel,
    style: {
      fillColor?: string;
      strokeColor?: string;
      lineWidth?: number;
    }
  ): void {
    if (points.length < 3) return;

    ctx.beginPath();

    if (level === DetailLevel.High) {
      // Render all points
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
    } else if (level === DetailLevel.Medium) {
      // Skip every other point
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 2; i < points.length; i += 2) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      if (points.length % 2 === 0) {
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      }
    } else {
      // Low detail - just render bounding box
      const bounds = this.getPointsBounds(points);
      ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    ctx.closePath();

    if (style.fillColor) {
      ctx.fillStyle = style.fillColor;
      ctx.fill();
    }

    if (style.strokeColor) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.lineWidth || 1;
      ctx.stroke();
    }
  }

  private static getPointsBounds(points: { x: number; y: number }[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}