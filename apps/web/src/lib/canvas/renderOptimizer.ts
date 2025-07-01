import { rectanglePool, withPooledObject, withPooledObjects } from '../performance/objectPool';
import { performanceMonitor } from '../performance/performanceMonitor';

interface DirtyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp: number;
}

interface RenderStats {
  fullRedraws: number;
  partialRedraws: number;
  skippedFrames: number;
  dirtyRegions: number;
  lastRenderTime: number;
}

export interface RenderOptimizerConfig {
  enableDirtyRects: boolean;
  minDirtyRectSize: number;
  maxDirtyRects: number;
  mergeThreshold: number;
  frameRateTarget: number;
  adaptiveQuality: boolean;
  debugMode: boolean;
}

export class CanvasRenderOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderFn: (ctx: CanvasRenderingContext2D, region?: DirtyRegion) => void;
  private config: RenderOptimizerConfig;
  private dirtyRegions: DirtyRegion[] = [];
  private stats: RenderStats;
  private lastFrameTime = 0;
  private frameSkipCount = 0;
  private qualityLevel = 1;
  private renderRequested = false;
  private offscreenCanvas?: HTMLCanvasElement;
  private offscreenCtx?: CanvasRenderingContext2D;

  constructor(
    canvas: HTMLCanvasElement,
    renderFn: (ctx: CanvasRenderingContext2D, region?: DirtyRegion) => void,
    config: Partial<RenderOptimizerConfig> = {}
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
    
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    this.renderFn = renderFn;

    this.config = {
      enableDirtyRects: true,
      minDirtyRectSize: 20,
      maxDirtyRects: 10,
      mergeThreshold: 100,
      frameRateTarget: 60,
      adaptiveQuality: true,
      debugMode: false,
      ...config
    };

    this.stats = {
      fullRedraws: 0,
      partialRedraws: 0,
      skippedFrames: 0,
      dirtyRegions: 0,
      lastRenderTime: 0
    };

    this.setupOffscreenCanvas();
  }

  private setupOffscreenCanvas(): void {
    if ('OffscreenCanvas' in window) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
        alpha: false,
        desynchronized: true
      }) || undefined;
    }
  }

  markDirty(x: number, y: number, width: number, height: number): void {
    if (!this.config.enableDirtyRects) {
      this.forceFullRedraw();
      return;
    }

    // Clamp to canvas bounds
    x = Math.max(0, Math.min(x, this.canvas.width - 1));
    y = Math.max(0, Math.min(y, this.canvas.height - 1));
    width = Math.min(width, this.canvas.width - x);
    height = Math.min(height, this.canvas.height - y);

    if (width < this.config.minDirtyRectSize || height < this.config.minDirtyRectSize) {
      return;
    }

    this.dirtyRegions.push({
      x, y, width, height,
      timestamp: performance.now()
    });

    this.optimizeDirtyRegions();
    this.requestRender();
  }

  private optimizeDirtyRegions(): void {
    if (this.dirtyRegions.length <= 1) return;

    // Merge overlapping or nearby regions
    const merged: DirtyRegion[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < this.dirtyRegions.length; i++) {
      if (processed.has(i)) continue;

      const region = this.dirtyRegions[i];
      let mergedRegion = { ...region };
      processed.add(i);

      for (let j = i + 1; j < this.dirtyRegions.length; j++) {
        if (processed.has(j)) continue;

        const other = this.dirtyRegions[j];
        
        if (this.shouldMergeRegions(mergedRegion, other)) {
          mergedRegion = this.mergeRegions(mergedRegion, other);
          processed.add(j);
        }
      }

      merged.push(mergedRegion);
    }

    this.dirtyRegions = merged;

    // If too many regions, switch to full redraw
    if (this.dirtyRegions.length > this.config.maxDirtyRects) {
      this.forceFullRedraw();
    }
  }

  private shouldMergeRegions(a: DirtyRegion, b: DirtyRegion): boolean {
    // Check if regions overlap
    const overlaps = !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );

    if (overlaps) return true;

    // Check if regions are close enough
    const distance = Math.min(
      Math.abs(a.x - (b.x + b.width)),
      Math.abs(b.x - (a.x + a.width)),
      Math.abs(a.y - (b.y + b.height)),
      Math.abs(b.y - (a.y + a.height))
    );

    return distance < this.config.mergeThreshold;
  }

  private mergeRegions(a: DirtyRegion, b: DirtyRegion): DirtyRegion {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);

    return {
      x, y,
      width: right - x,
      height: bottom - y,
      timestamp: Math.max(a.timestamp, b.timestamp)
    };
  }

  forceFullRedraw(): void {
    this.dirtyRegions = [{
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height,
      timestamp: performance.now()
    }];
    this.requestRender();
  }

  private requestRender(): void {
    if (!this.renderRequested) {
      this.renderRequested = true;
      requestAnimationFrame(() => this.render());
    }
  }

  render(): void {
    this.renderRequested = false;

    if (this.dirtyRegions.length === 0) return;

    const renderStart = performanceMonitor.startRender();
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Adaptive quality based on frame rate
    if (this.config.adaptiveQuality) {
      this.updateQualityLevel(deltaTime);
    }

    // Frame skip if falling behind
    if (deltaTime < 1000 / this.config.frameRateTarget * 0.8) {
      this.stats.skippedFrames++;
      this.lastFrameTime = currentTime;
      performanceMonitor.endRender(renderStart);
      return;
    }

    this.lastFrameTime = currentTime;

    // Save context state
    this.ctx.save();

    try {
      if (this.dirtyRegions.length === 1 && 
          this.dirtyRegions[0].width === this.canvas.width && 
          this.dirtyRegions[0].height === this.canvas.height) {
        // Full redraw
        this.performFullRedraw();
        this.stats.fullRedraws++;
      } else {
        // Partial redraws
        this.performPartialRedraws();
        this.stats.partialRedraws += this.dirtyRegions.length;
      }

      this.stats.dirtyRegions = this.dirtyRegions.length;
      this.stats.lastRenderTime = performance.now() - currentTime;
    } finally {
      this.ctx.restore();
      this.dirtyRegions = [];
      performanceMonitor.endRender(renderStart);
    }

    // Debug mode - show dirty regions
    if (this.config.debugMode) {
      this.drawDebugInfo();
    }
  }

  private performFullRedraw(): void {
    // Apply quality settings
    this.applyQualitySettings();

    // Clear and render
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderFn(this.ctx);
  }

  private performPartialRedraws(): void {
    // Apply quality settings
    this.applyQualitySettings();

    // Use offscreen canvas if available
    const targetCtx = this.offscreenCtx || this.ctx;
    const targetCanvas = this.offscreenCanvas || this.canvas;

    // Render each dirty region
    for (const region of this.dirtyRegions) {
      targetCtx.save();
      
      // Set clipping region
      targetCtx.beginPath();
      targetCtx.rect(region.x, region.y, region.width, region.height);
      targetCtx.clip();

      // Clear the region
      targetCtx.clearRect(region.x, region.y, region.width, region.height);

      // Render the region
      this.renderFn(targetCtx, region);

      targetCtx.restore();
    }

    // Copy from offscreen to main canvas if needed
    if (this.offscreenCtx && this.offscreenCanvas) {
      for (const region of this.dirtyRegions) {
        this.ctx.drawImage(
          this.offscreenCanvas,
          region.x, region.y, region.width, region.height,
          region.x, region.y, region.width, region.height
        );
      }
    }
  }

  private updateQualityLevel(deltaTime: number): void {
    const targetFrameTime = 1000 / this.config.frameRateTarget;
    
    if (deltaTime > targetFrameTime * 1.5) {
      // Reduce quality
      this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.1);
    } else if (deltaTime < targetFrameTime * 0.8) {
      // Increase quality
      this.qualityLevel = Math.min(1, this.qualityLevel + 0.05);
    }
  }

  private applyQualitySettings(): void {
    if (this.qualityLevel < 1) {
      this.ctx.imageSmoothingEnabled = this.qualityLevel > 0.7;
      this.ctx.imageSmoothingQuality = this.qualityLevel > 0.8 ? 'high' : 'low';
      
      // Reduce shadow quality
      if (this.qualityLevel < 0.8) {
        this.ctx.shadowBlur = 0;
      }
    }
  }

  private drawDebugInfo(): void {
    this.ctx.save();
    
    // Draw dirty regions
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    for (const region of this.dirtyRegions) {
      this.ctx.strokeRect(region.x, region.y, region.width, region.height);
    }

    // Draw stats
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(10, 10, 200, 100);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`Quality: ${(this.qualityLevel * 100).toFixed(0)}%`, 20, 30);
    this.ctx.fillText(`Full redraws: ${this.stats.fullRedraws}`, 20, 45);
    this.ctx.fillText(`Partial redraws: ${this.stats.partialRedraws}`, 20, 60);
    this.ctx.fillText(`Skipped frames: ${this.stats.skippedFrames}`, 20, 75);
    this.ctx.fillText(`Render time: ${this.stats.lastRenderTime.toFixed(1)}ms`, 20, 90);

    this.ctx.restore();
  }

  setQualityLevel(level: number): void {
    this.qualityLevel = Math.max(0, Math.min(1, level));
  }

  getStats(): RenderStats {
    return { ...this.stats };
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;

    if (this.offscreenCanvas && this.offscreenCtx) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }

    this.forceFullRedraw();
  }

  destroy(): void {
    this.dirtyRegions = [];
    this.offscreenCanvas = undefined;
    this.offscreenCtx = undefined;
  }
}

// Batch render queue for multiple canvases
export class RenderQueue {
  private queue: Array<{ canvas: CanvasRenderOptimizer; priority: number }> = [];
  private rendering = false;
  private frameId?: number;

  add(canvas: CanvasRenderOptimizer, priority = 0): void {
    const existing = this.queue.findIndex(item => item.canvas === canvas);
    
    if (existing >= 0) {
      this.queue[existing].priority = Math.max(this.queue[existing].priority, priority);
    } else {
      this.queue.push({ canvas, priority });
    }

    this.queue.sort((a, b) => b.priority - a.priority);
    this.scheduleRender();
  }

  private scheduleRender(): void {
    if (!this.rendering && !this.frameId) {
      this.frameId = requestAnimationFrame(() => this.processQueue());
    }
  }

  private processQueue(): void {
    this.frameId = undefined;
    this.rendering = true;

    const startTime = performance.now();
    const frameDeadline = startTime + 16; // 16ms for 60fps

    while (this.queue.length > 0 && performance.now() < frameDeadline) {
      const item = this.queue.shift();
      if (item) {
        item.canvas.render();
      }
    }

    this.rendering = false;

    if (this.queue.length > 0) {
      this.scheduleRender();
    }
  }

  clear(): void {
    this.queue = [];
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
    }
  }
}

export const globalRenderQueue = new RenderQueue();