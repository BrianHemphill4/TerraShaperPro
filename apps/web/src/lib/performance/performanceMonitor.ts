import { performanceTracker } from '../monitoring/performanceTracker';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
  drawCalls: number;
  visibleObjects: number;
  totalObjects: number;
  memoryUsed: number;
  memoryTotal: number;
  canvasOperations: number;
  networkRequests: number;
  cacheHitRate: number;
}

interface PerformanceThresholds {
  fps: { warning: number; critical: number };
  frameTime: { warning: number; critical: number };
  renderTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  drawCalls: { warning: number; critical: number };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private frameStartTime = 0;
  private frameCount = 0;
  private fpsBuffer: number[] = [];
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private rafId?: number;
  private metricsHistory: PerformanceMetrics[] = [];
  private readonly maxHistorySize = 300; // 5 seconds at 60fps

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  constructor() {
    this.metrics = this.initializeMetrics();
    this.thresholds = this.initializeThresholds();
    this.setupPerformanceTracking();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      frameTime: 0,
      renderTime: 0,
      updateTime: 0,
      drawCalls: 0,
      visibleObjects: 0,
      totalObjects: 0,
      memoryUsed: 0,
      memoryTotal: 0,
      canvasOperations: 0,
      networkRequests: 0,
      cacheHitRate: 0
    };
  }

  private initializeThresholds(): PerformanceThresholds {
    return {
      fps: { warning: 30, critical: 15 },
      frameTime: { warning: 33, critical: 67 }, // 30fps and 15fps
      renderTime: { warning: 16, critical: 33 },
      memoryUsage: { warning: 0.75, critical: 0.9 }, // percentage
      drawCalls: { warning: 1000, critical: 2000 }
    };
  }

  private setupPerformanceTracking(): void {
    // Set up performance thresholds in tracker
    performanceTracker.setThreshold({
      metric: 'render-time',
      warning: this.thresholds.renderTime.warning,
      critical: this.thresholds.renderTime.critical,
      action: (metric) => {
        console.warn(`Render time threshold exceeded: ${metric.value}ms`);
      }
    });

    performanceTracker.setThreshold({
      metric: 'frame-time',
      warning: this.thresholds.frameTime.warning,
      critical: this.thresholds.frameTime.critical
    });

    // Start FPS tracking
    this.startFPSTracking();
    
    // Start memory tracking
    this.startMemoryTracking();
  }

  private startFPSTracking(): void {
    let lastTime = performance.now();
    
    const trackFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update FPS
      this.fpsBuffer.push(1000 / deltaTime);
      if (this.fpsBuffer.length > 60) {
        this.fpsBuffer.shift();
      }

      const avgFps = this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length;
      this.metrics.fps = Math.round(avgFps);
      this.metrics.frameTime = deltaTime;

      // Check thresholds
      this.checkThresholds();

      // Notify listeners
      this.notifyListeners();

      // Store history
      this.addToHistory();

      this.rafId = requestAnimationFrame(trackFrame);
    };

    this.rafId = requestAnimationFrame(trackFrame);
  }

  private startMemoryTracking(): void {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsed = Math.round(memory.usedJSHeapSize / 1048576);
        this.metrics.memoryTotal = Math.round(memory.totalJSHeapSize / 1048576);
        
        performanceTracker.trackMemoryUsage();
      }
    }, 1000);
  }

  private checkThresholds(): void {
    const memoryUsageRatio = this.metrics.memoryUsed / this.metrics.memoryTotal;

    // Check FPS
    if (this.metrics.fps < this.thresholds.fps.critical) {
      this.onPerformanceIssue('fps-critical', this.metrics.fps);
    } else if (this.metrics.fps < this.thresholds.fps.warning) {
      this.onPerformanceIssue('fps-warning', this.metrics.fps);
    }

    // Check memory
    if (memoryUsageRatio > this.thresholds.memoryUsage.critical) {
      this.onPerformanceIssue('memory-critical', memoryUsageRatio);
    } else if (memoryUsageRatio > this.thresholds.memoryUsage.warning) {
      this.onPerformanceIssue('memory-warning', memoryUsageRatio);
    }

    // Check draw calls
    if (this.metrics.drawCalls > this.thresholds.drawCalls.critical) {
      this.onPerformanceIssue('drawcalls-critical', this.metrics.drawCalls);
    } else if (this.metrics.drawCalls > this.thresholds.drawCalls.warning) {
      this.onPerformanceIssue('drawcalls-warning', this.metrics.drawCalls);
    }
  }

  private onPerformanceIssue(type: string, value: number): void {
    performanceTracker.recordMetric({
      name: 'performance-issue',
      value,
      unit: type.includes('memory') ? 'ratio' : type.includes('fps') ? 'fps' : 'count',
      timestamp: new Date(),
      tags: { type }
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  private addToHistory(): void {
    this.metricsHistory.push({ ...this.metrics });
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  // Public API
  startRender(): number {
    const startTime = performance.now();
    performanceTracker.startMark('render-frame');
    return startTime;
  }

  endRender(startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.metrics.renderTime = renderTime;
    performanceTracker.endMark('render-frame');
  }

  startUpdate(): number {
    const startTime = performance.now();
    performanceTracker.startMark('update-frame');
    return startTime;
  }

  endUpdate(startTime: number): void {
    const updateTime = performance.now() - startTime;
    this.metrics.updateTime = updateTime;
    performanceTracker.endMark('update-frame');
  }

  incrementDrawCalls(): void {
    this.metrics.drawCalls++;
  }

  resetDrawCalls(): void {
    this.metrics.drawCalls = 0;
  }

  updateObjectCounts(total: number, visible: number): void {
    this.metrics.totalObjects = total;
    this.metrics.visibleObjects = visible;
  }

  incrementCanvasOperations(): void {
    this.metrics.canvasOperations++;
  }

  incrementNetworkRequests(): void {
    this.metrics.networkRequests++;
  }

  updateCacheHitRate(rate: number): void {
    this.metrics.cacheHitRate = Math.round(rate * 100);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  getAverageMetrics(windowSize = 60): PerformanceMetrics {
    const recentMetrics = this.metricsHistory.slice(-windowSize);
    if (recentMetrics.length === 0) return this.metrics;

    const avg = { ...this.initializeMetrics() };
    
    recentMetrics.forEach(metric => {
      Object.keys(avg).forEach(key => {
        avg[key as keyof PerformanceMetrics] += metric[key as keyof PerformanceMetrics];
      });
    });

    Object.keys(avg).forEach(key => {
      avg[key as keyof PerformanceMetrics] /= recentMetrics.length;
    });

    return avg;
  }

  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  getPerformanceScore(): number {
    // Calculate a 0-100 performance score
    const fpsScore = Math.min(100, (this.metrics.fps / 60) * 100);
    const renderScore = Math.min(100, Math.max(0, 100 - (this.metrics.renderTime / 16.67) * 50));
    const memoryScore = Math.min(100, (1 - this.metrics.memoryUsed / this.metrics.memoryTotal) * 100);
    const drawCallScore = Math.min(100, Math.max(0, 100 - (this.metrics.drawCalls / 1000) * 50));

    return Math.round((fpsScore + renderScore + memoryScore + drawCallScore) / 4);
  }

  generateReport(): string {
    const report = performanceTracker.getPerformanceReport();
    const score = this.getPerformanceScore();
    const avgMetrics = this.getAverageMetrics();

    return `Performance Report
=================
Score: ${score}/100

Current Metrics:
- FPS: ${this.metrics.fps} (avg: ${Math.round(avgMetrics.fps)})
- Frame Time: ${this.metrics.frameTime.toFixed(2)}ms
- Render Time: ${this.metrics.renderTime.toFixed(2)}ms
- Update Time: ${this.metrics.updateTime.toFixed(2)}ms
- Draw Calls: ${this.metrics.drawCalls}
- Objects: ${this.metrics.visibleObjects}/${this.metrics.totalObjects}
- Memory: ${this.metrics.memoryUsed}MB/${this.metrics.memoryTotal}MB
- Cache Hit Rate: ${this.metrics.cacheHitRate}%

Detailed Metrics:
${JSON.stringify(report, null, 2)}`;
  }

  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.listeners.clear();
    this.metricsHistory = [];
  }
}

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance();