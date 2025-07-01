interface PerformanceMark {
  name: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  action?: (metric: PerformanceMetric) => void;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private marks: Map<string, PerformanceMark> = new Map();
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private metricsBuffer: PerformanceMetric[] = [];
  private flushInterval?: NodeJS.Timeout;

  static getInstance(): PerformanceTracker {
    if (!this.instance) {
      this.instance = new PerformanceTracker();
    }
    return this.instance;
  }

  constructor() {
    this.setupPerformanceObservers();
    this.startMetricsFlush();
  }

  // Mark the start of a performance measurement
  startMark(name: string, metadata?: Record<string, any>): void {
    this.marks.set(name, {
      name,
      timestamp: performance.now(),
      metadata
    });
  }

  // End a mark and record the duration
  endMark(name: string, tags?: Record<string, string>): number {
    const startMark = this.marks.get(name);
    
    if (!startMark) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startMark.timestamp;
    
    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        ...tags,
        ...startMark.metadata
      }
    });

    this.marks.delete(name);
    return duration;
  }

  // Record a custom metric
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.metricsBuffer.push(metric);

    // Check thresholds
    this.checkThresholds(metric);

    // Keep only recent metrics in memory (last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Measure async operation performance
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.startMark(name);
    
    try {
      const result = await operation();
      this.endMark(name, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.endMark(name, { ...tags, status: 'error' });
      throw error;
    }
  }

  // Measure sync operation performance
  measure<T>(
    name: string,
    operation: () => T,
    tags?: Record<string, string>
  ): T {
    this.startMark(name);
    
    try {
      const result = operation();
      this.endMark(name, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.endMark(name, { ...tags, status: 'error' });
      throw error;
    }
  }

  // Set performance thresholds
  setThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.set(threshold.metric, threshold);
  }

  // Check if metric exceeds thresholds
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      console.error(`Critical performance threshold exceeded for ${metric.name}: ${metric.value}${metric.unit}`);
      threshold.action?.(metric);
    } else if (metric.value >= threshold.warning) {
      console.warn(`Performance warning for ${metric.name}: ${metric.value}${metric.unit}`);
    }
  }

  // Get metrics summary
  getMetricsSummary(name?: string): Record<string, any> {
    const relevantMetrics = name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return {};
    }

    const values = relevantMetrics.map(m => m.value);
    const sorted = values.sort((a, b) => a - b);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  // Setup performance observers
  private setupPerformanceObservers(): void {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'long-task',
              value: entry.duration,
              unit: 'ms',
              timestamp: new Date(),
              tags: {
                type: entry.name,
                startTime: entry.startTime.toString()
              }
            });
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported');
      }

      // Observe paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: `paint-${entry.name}`,
              value: entry.startTime,
              unit: 'ms',
              timestamp: new Date()
            });
          }
        });

        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.warn('Paint observer not supported');
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.recordMetric({
            name: 'largest-contentful-paint',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: new Date()
          });
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported');
      }
    }
  }

  // Track memory usage
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.recordMetric({
        name: 'memory-used',
        value: memory.usedJSHeapSize / 1048576, // Convert to MB
        unit: 'MB',
        timestamp: new Date()
      });

      this.recordMetric({
        name: 'memory-total',
        value: memory.totalJSHeapSize / 1048576,
        unit: 'MB',
        timestamp: new Date()
      });

      this.recordMetric({
        name: 'memory-limit',
        value: memory.jsHeapSizeLimit / 1048576,
        unit: 'MB',
        timestamp: new Date()
      });
    }
  }

  // Track FPS
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsUpdateTime = 0;

  trackFPS(): void {
    const now = performance.now();
    
    if (this.lastFrameTime) {
      this.frameCount++;
      
      if (now - this.fpsUpdateTime >= 1000) {
        const fps = (this.frameCount * 1000) / (now - this.fpsUpdateTime);
        
        this.recordMetric({
          name: 'fps',
          value: Math.round(fps),
          unit: 'fps',
          timestamp: new Date()
        });

        this.frameCount = 0;
        this.fpsUpdateTime = now;
      }
    } else {
      this.fpsUpdateTime = now;
    }

    this.lastFrameTime = now;
    requestAnimationFrame(() => this.trackFPS());
  }

  // Start automatic metrics flush
  private startMetricsFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, 30000); // Flush every 30 seconds
  }

  // Flush metrics to backend
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToSend = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // In production, send to metrics endpoint
      if (process.env.NODE_ENV === 'production') {
        // await fetch('/api/metrics', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ metrics: metricsToSend })
        // });
      } else {
        console.log('Performance metrics:', metricsToSend);
      }
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-add metrics to buffer
      this.metricsBuffer.unshift(...metricsToSend);
    }
  }

  // Get current performance report
  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {
      timestamp: new Date(),
      metrics: {}
    };

    // Group metrics by name
    const groupedMetrics = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    // Calculate summaries for each metric
    for (const [name, metrics] of Object.entries(groupedMetrics)) {
      report.metrics[name] = this.getMetricsSummary(name);
    }

    // Add memory info
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      report.memory = {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        unit: 'MB'
      };
    }

    // Add navigation timing
    if (performance.timing) {
      const timing = performance.timing;
      report.pageLoad = {
        total: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        unit: 'ms'
      };
    }

    return report;
  }

  // Cleanup
  destroy(): void {
    // Clear observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();

    // Clear flush interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    // Flush remaining metrics
    this.flushMetrics();
  }
}

// Export singleton instance
export const performanceTracker = PerformanceTracker.getInstance();

// Convenience functions
export function trackPerformance<T>(
  name: string,
  operation: () => T,
  tags?: Record<string, string>
): T {
  return performanceTracker.measure(name, operation, tags);
}

export async function trackAsyncPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  return performanceTracker.measureAsync(name, operation, tags);
}