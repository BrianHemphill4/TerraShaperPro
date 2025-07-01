import { performanceTracker } from './performanceTracker';
import { errorLogger } from './errorLogger';

interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'timing';
}

interface MetricAggregation {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

interface MetricsConfig {
  flushInterval?: number;
  endpoint?: string;
  apiKey?: string;
  enableAutoMetrics?: boolean;
  sampleRate?: number;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private config: MetricsConfig;
  private flushInterval?: NodeJS.Timeout;
  private customMetrics: Map<string, () => number> = new Map();

  static getInstance(): MetricsCollector {
    if (!this.instance) {
      this.instance = new MetricsCollector();
    }
    return this.instance;
  }

  constructor(config: MetricsConfig = {}) {
    this.config = {
      flushInterval: 60000, // 1 minute
      enableAutoMetrics: true,
      sampleRate: 1,
      ...config
    };

    if (this.config.enableAutoMetrics) {
      this.setupAutoMetrics();
    }

    this.startFlushInterval();
  }

  // Increment a counter
  increment(
    name: string,
    value: number = 1,
    tags?: Record<string, string>
  ): void {
    const key = this.getMetricKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);

    this.recordMetric({
      name,
      value,
      unit: 'count',
      timestamp: new Date(),
      tags,
      type: 'counter'
    });
  }

  // Decrement a counter
  decrement(
    name: string,
    value: number = 1,
    tags?: Record<string, string>
  ): void {
    this.increment(name, -value, tags);
  }

  // Set a gauge value
  gauge(
    name: string,
    value: number,
    unit: string = 'value',
    tags?: Record<string, string>
  ): void {
    const key = this.getMetricKey(name, tags);
    this.gauges.set(key, value);

    this.recordMetric({
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
      type: 'gauge'
    });
  }

  // Record a timing
  timing(
    name: string,
    duration: number,
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags,
      type: 'timing'
    });
  }

  // Record a histogram value
  histogram(
    name: string,
    value: number,
    unit: string = 'value',
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
      type: 'histogram'
    });
  }

  // Register a custom metric collector
  registerCustomMetric(
    name: string,
    collector: () => number,
    unit: string = 'value'
  ): void {
    this.customMetrics.set(name, collector);
    
    // Collect immediately
    try {
      const value = collector();
      this.gauge(name, value, unit);
    } catch (error) {
      console.error(`Failed to collect custom metric ${name}:`, error);
    }
  }

  // Time an async operation
  async timeAsync<T>(
    name: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await operation();
      this.timing(name, performance.now() - start, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.timing(name, performance.now() - start, { ...tags, status: 'error' });
      throw error;
    }
  }

  // Time a sync operation
  time<T>(
    name: string,
    operation: () => T,
    tags?: Record<string, string>
  ): T {
    const start = performance.now();
    
    try {
      const result = operation();
      this.timing(name, performance.now() - start, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.timing(name, performance.now() - start, { ...tags, status: 'error' });
      throw error;
    }
  }

  // Get metric aggregations
  getAggregations(name?: string): Record<string, MetricAggregation> {
    const aggregations: Record<string, MetricAggregation> = {};

    for (const [metricName, metrics] of this.metrics.entries()) {
      if (name && !metricName.includes(name)) continue;

      const values = metrics.map(m => m.value).sort((a, b) => a - b);
      
      if (values.length > 0) {
        aggregations[metricName] = {
          count: values.length,
          sum: values.reduce((a, b) => a + b, 0),
          min: values[0],
          max: values[values.length - 1],
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          p50: values[Math.floor(values.length * 0.5)],
          p95: values[Math.floor(values.length * 0.95)],
          p99: values[Math.floor(values.length * 0.99)]
        };
      }
    }

    return aggregations;
  }

  // Get current counter values
  getCounters(): Record<string, number> {
    const counters: Record<string, number> = {};
    
    for (const [key, value] of this.counters.entries()) {
      counters[key] = value;
    }
    
    return counters;
  }

  // Get current gauge values
  getGauges(): Record<string, number> {
    const gauges: Record<string, number> = {};
    
    for (const [key, value] of this.gauges.entries()) {
      gauges[key] = value;
    }
    
    return gauges;
  }

  // Reset all metrics
  reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.gauges.clear();
  }

  // Private methods
  private recordMetric(metric: Metric): void {
    // Check sample rate
    if (Math.random() > this.config.sampleRate!) {
      return;
    }

    const key = this.getMetricKey(metric.name, metric.tags);
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const metrics = this.metrics.get(key)!;
    metrics.push(metric);
    
    // Keep only recent metrics (last 1000)
    if (metrics.length > 1000) {
      this.metrics.set(key, metrics.slice(-1000));
    }
  }

  private getMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }
    
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    
    return `${name}{${tagStr}}`;
  }

  private setupAutoMetrics(): void {
    // Track page views
    this.increment('page_view', 1, {
      path: window.location.pathname,
      referrer: document.referrer || 'direct'
    });

    // Track session duration
    const sessionStart = Date.now();
    window.addEventListener('beforeunload', () => {
      const duration = Date.now() - sessionStart;
      this.timing('session_duration', duration);
    });

    // Track memory usage periodically
    if ('memory' in performance) {
      setInterval(() => {
        performanceTracker.trackMemoryUsage();
      }, 30000);
    }

    // Track custom metrics
    setInterval(() => {
      for (const [name, collector] of this.customMetrics.entries()) {
        try {
          const value = collector();
          this.gauge(name, value);
        } catch (error) {
          console.error(`Failed to collect custom metric ${name}:`, error);
        }
      }
    }, 60000);

    // Track error counts
    const originalLogError = errorLogger.logError.bind(errorLogger);
    errorLogger.logError = (error, context, userId) => {
      this.increment('error_count', 1, {
        type: (error as any).type || 'unknown',
        severity: (error as any).severity || 'medium'
      });
      return originalLogError(error, context, userId);
    };
  }

  private startFlushInterval(): void {
    if (this.config.flushInterval! > 0 && this.config.endpoint) {
      this.flushInterval = setInterval(() => {
        this.flush();
      }, this.config.flushInterval!);
    }
  }

  private async flush(): Promise<void> {
    if (!this.config.endpoint) return;

    const metricsToSend = {
      counters: this.getCounters(),
      gauges: this.getGauges(),
      aggregations: this.getAggregations(),
      timestamp: new Date()
    };

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey })
        },
        body: JSON.stringify(metricsToSend)
      });

      // Reset metrics after successful flush
      this.reset();
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  // Get comprehensive metrics report
  getReport(): Record<string, any> {
    return {
      timestamp: new Date(),
      counters: this.getCounters(),
      gauges: this.getGauges(),
      aggregations: this.getAggregations(),
      performance: performanceTracker.getPerformanceReport(),
      errors: errorLogger.getStatistics()
    };
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Final flush
    this.flush();
  }
}

// Export singleton instance
export const metricsCollector = MetricsCollector.getInstance();

// Convenience functions
export function increment(
  name: string,
  value: number = 1,
  tags?: Record<string, string>
): void {
  metricsCollector.increment(name, value, tags);
}

export function gauge(
  name: string,
  value: number,
  unit?: string,
  tags?: Record<string, string>
): void {
  metricsCollector.gauge(name, value, unit, tags);
}

export function timing(
  name: string,
  duration: number,
  tags?: Record<string, string>
): void {
  metricsCollector.timing(name, duration, tags);
}