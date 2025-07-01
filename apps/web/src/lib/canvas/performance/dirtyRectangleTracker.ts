/**
 * Dirty Rectangle Tracking System
 * Optimizes canvas redraws by only updating changed regions
 */

import { Rectangle, rectanglePool } from './objectPool';

export interface DirtyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp: number;
}

export class DirtyRectangleTracker {
  private dirtyRegions: Rectangle[] = [];
  private mergedRegion: Rectangle | null = null;
  private lastCleanTime: number = Date.now();
  private mergeThreshold: number;
  private maxRegions: number;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    options?: {
      mergeThreshold?: number;
      maxRegions?: number;
    }
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.mergeThreshold = options?.mergeThreshold ?? 0.3; // Merge if overlap is > 30%
    this.maxRegions = options?.maxRegions ?? 10;
  }

  markDirty(x: number, y: number, width: number, height: number): void {
    // Clamp to canvas bounds
    x = Math.max(0, x);
    y = Math.max(0, y);
    width = Math.min(width, this.canvasWidth - x);
    height = Math.min(height, this.canvasHeight - y);

    if (width <= 0 || height <= 0) return;

    const newRegion = rectanglePool.acquire();
    newRegion.set(x, y, width, height);

    // Try to merge with existing regions
    let merged = false;
    for (let i = this.dirtyRegions.length - 1; i >= 0; i--) {
      const existing = this.dirtyRegions[i];
      if (this.shouldMerge(newRegion, existing)) {
        this.mergeRegions(existing, newRegion);
        rectanglePool.release(newRegion);
        merged = true;
        break;
      }
    }

    if (!merged) {
      this.dirtyRegions.push(newRegion);
    }

    // Consolidate if we have too many regions
    if (this.dirtyRegions.length > this.maxRegions) {
      this.consolidateRegions();
    }

    // Reset merged region cache
    this.mergedRegion = null;
  }

  markEntireCanvasDirty(): void {
    this.clear();
    const fullRegion = rectanglePool.acquire();
    fullRegion.set(0, 0, this.canvasWidth, this.canvasHeight);
    this.dirtyRegions.push(fullRegion);
    this.mergedRegion = null;
  }

  getDirtyRegions(): Rectangle[] {
    return this.dirtyRegions;
  }

  getMergedDirtyRegion(): Rectangle | null {
    if (this.dirtyRegions.length === 0) return null;
    
    if (!this.mergedRegion) {
      this.mergedRegion = rectanglePool.acquire();
      
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const region of this.dirtyRegions) {
        minX = Math.min(minX, region.x);
        minY = Math.min(minY, region.y);
        maxX = Math.max(maxX, region.x + region.width);
        maxY = Math.max(maxY, region.y + region.height);
      }

      this.mergedRegion.set(minX, minY, maxX - minX, maxY - minY);
    }

    return this.mergedRegion;
  }

  isDirty(): boolean {
    return this.dirtyRegions.length > 0;
  }

  clear(): void {
    // Release all rectangles back to pool
    for (const region of this.dirtyRegions) {
      rectanglePool.release(region);
    }
    
    if (this.mergedRegion) {
      rectanglePool.release(this.mergedRegion);
      this.mergedRegion = null;
    }

    this.dirtyRegions = [];
    this.lastCleanTime = Date.now();
  }

  private shouldMerge(r1: Rectangle, r2: Rectangle): boolean {
    if (!r1.intersects(r2)) return false;

    // Calculate intersection area
    const intersectX = Math.max(r1.x, r2.x);
    const intersectY = Math.max(r1.y, r2.y);
    const intersectRight = Math.min(r1.x + r1.width, r2.x + r2.width);
    const intersectBottom = Math.min(r1.y + r1.height, r2.y + r2.height);
    
    const intersectArea = (intersectRight - intersectX) * (intersectBottom - intersectY);
    const r1Area = r1.width * r1.height;
    const r2Area = r2.width * r2.height;
    const minArea = Math.min(r1Area, r2Area);

    // Merge if intersection is significant relative to smaller region
    return intersectArea / minArea > this.mergeThreshold;
  }

  private mergeRegions(target: Rectangle, source: Rectangle): void {
    const minX = Math.min(target.x, source.x);
    const minY = Math.min(target.y, source.y);
    const maxX = Math.max(target.x + target.width, source.x + source.width);
    const maxY = Math.max(target.y + target.height, source.y + source.height);
    
    target.set(minX, minY, maxX - minX, maxY - minY);
  }

  private consolidateRegions(): void {
    if (this.dirtyRegions.length <= 1) return;

    // Sort regions by area (largest first)
    this.dirtyRegions.sort((a, b) => {
      const areaA = a.width * a.height;
      const areaB = b.width * b.height;
      return areaB - areaA;
    });

    const consolidated: Rectangle[] = [];
    const used = new Set<number>();

    for (let i = 0; i < this.dirtyRegions.length; i++) {
      if (used.has(i)) continue;

      const current = this.dirtyRegions[i];
      
      // Try to merge with other regions
      for (let j = i + 1; j < this.dirtyRegions.length; j++) {
        if (used.has(j)) continue;

        const other = this.dirtyRegions[j];
        if (this.shouldMerge(current, other)) {
          this.mergeRegions(current, other);
          rectanglePool.release(other);
          used.add(j);
        }
      }

      consolidated.push(current);
    }

    this.dirtyRegions = consolidated;
  }

  updateCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    
    // Clamp existing dirty regions to new canvas size
    for (const region of this.dirtyRegions) {
      region.width = Math.min(region.width, this.canvasWidth - region.x);
      region.height = Math.min(region.height, this.canvasHeight - region.y);
    }
  }

  getStats(): {
    regionCount: number;
    totalDirtyArea: number;
    canvasArea: number;
    dirtyPercentage: number;
  } {
    let totalArea = 0;
    for (const region of this.dirtyRegions) {
      totalArea += region.width * region.height;
    }

    const canvasArea = this.canvasWidth * this.canvasHeight;
    
    return {
      regionCount: this.dirtyRegions.length,
      totalDirtyArea: totalArea,
      canvasArea,
      dirtyPercentage: canvasArea > 0 ? (totalArea / canvasArea) * 100 : 0
    };
  }
}

/**
 * Render optimizer that uses dirty rectangle tracking
 */
export class CanvasRenderOptimizer {
  private tracker: DirtyRectangleTracker;
  private ctx: CanvasRenderingContext2D;
  private renderCallback: (ctx: CanvasRenderingContext2D, region: Rectangle) => void;
  private fullRedrawThreshold: number;

  constructor(
    canvas: HTMLCanvasElement,
    renderCallback: (ctx: CanvasRenderingContext2D, region: Rectangle) => void,
    options?: {
      mergeThreshold?: number;
      maxRegions?: number;
      fullRedrawThreshold?: number;
    }
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.tracker = new DirtyRectangleTracker(canvas.width, canvas.height, options);
    this.renderCallback = renderCallback;
    this.fullRedrawThreshold = options?.fullRedrawThreshold ?? 0.8; // Redraw full canvas if 80% is dirty
  }

  markDirty(x: number, y: number, width: number, height: number): void {
    this.tracker.markDirty(x, y, width, height);
  }

  render(): void {
    if (!this.tracker.isDirty()) return;

    const stats = this.tracker.getStats();
    
    // If most of the canvas is dirty, just redraw everything
    if (stats.dirtyPercentage > this.fullRedrawThreshold * 100) {
      const fullRegion = rectanglePool.acquire();
      fullRegion.set(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      
      this.ctx.save();
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.renderCallback(this.ctx, fullRegion);
      this.ctx.restore();
      
      rectanglePool.release(fullRegion);
    } else {
      // Render only dirty regions
      const regions = this.tracker.getDirtyRegions();
      
      for (const region of regions) {
        this.ctx.save();
        
        // Clip to dirty region
        this.ctx.beginPath();
        this.ctx.rect(region.x, region.y, region.width, region.height);
        this.ctx.clip();
        
        // Clear the region
        this.ctx.clearRect(region.x, region.y, region.width, region.height);
        
        // Render the region
        this.renderCallback(this.ctx, region);
        
        this.ctx.restore();
      }
    }

    this.tracker.clear();
  }

  updateCanvasSize(width: number, height: number): void {
    this.tracker.updateCanvasSize(width, height);
  }

  forceFullRedraw(): void {
    this.tracker.markEntireCanvasDirty();
    this.render();
  }
}