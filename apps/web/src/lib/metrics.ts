// import * as Sentry from '@sentry/nextjs';
import { PerformanceMonitor } from './performance';

// Mock Sentry functions when disabled
const Sentry = {
  captureMessage: () => {},
  getActiveSpan: () => null,
  startSpan: (options: any, callback: any) => callback({}),
};

export interface Metric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export interface PerformanceBudget {
  metric: string;
  budget: number;
  unit: string;
}

export class MetricsService {
  private static instance: MetricsService;
  private performanceMonitor = PerformanceMonitor.getInstance();
  private budgets: Map<string, PerformanceBudget> = new Map();

  private constructor() {
    this.initializeDefaultBudgets();
  }

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private initializeDefaultBudgets(): void {
    // Page load budgets
    this.setBudget('page.load', 3000, 'ms');
    this.setBudget('page.interactive', 5000, 'ms');
    this.setBudget('page.firstPaint', 1500, 'ms');
    
    // API response budgets
    this.setBudget('api.response', 200, 'ms');
    this.setBudget('api.render.create', 500, 'ms');
    this.setBudget('api.plant.search', 100, 'ms');
    
    // Resource budgets
    this.setBudget('bundle.size.main', 300, 'kb');
    this.setBudget('bundle.size.vendor', 500, 'kb');
    this.setBudget('image.size.max', 200, 'kb');
    
    // Canvas performance budgets
    this.setBudget('canvas.render', 16, 'ms'); // 60fps
    this.setBudget('canvas.interaction', 50, 'ms');
  }

  setBudget(metric: string, budget: number, unit: string): void {
    this.budgets.set(metric, { metric, budget, unit });
  }

  getBudget(metric: string): PerformanceBudget | undefined {
    return this.budgets.get(metric);
  }

  recordMetric(metric: Metric): void {
    // Record in Sentry
    const span = Sentry.getActiveSpan();
    if (span) {
      span.setAttribute(metric.name, metric.value);
      
      // Add tags
      if (metric.tags) {
        Object.entries(metric.tags).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
    }

    // Check against budget
    const budget = this.budgets.get(metric.name);
    if (budget && metric.value > budget.budget) {
      this.recordBudgetViolation(metric, budget);
    }

    // Record in performance monitor
    this.performanceMonitor.recordMetric(metric.name, metric.value);
  }

  private recordBudgetViolation(metric: Metric, budget: PerformanceBudget): void {
    const violation = {
      metric: metric.name,
      value: metric.value,
      budget: budget.budget,
      unit: budget.unit,
      exceeded: metric.value - budget.budget,
      percentage: ((metric.value / budget.budget) * 100).toFixed(2),
    };

    // Log to Sentry
    Sentry.captureMessage(`Performance budget exceeded: ${metric.name}`, {
      level: 'warning',
      tags: {
        metric: metric.name,
        ...metric.tags,
      },
      contexts: {
        performanceBudget: violation,
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Performance budget exceeded:', violation);
    }
  }

  recordWebVitals(metric: { name: string; value: number; id: string }): void {
    const webVitalMap: Record<string, string> = {
      'FCP': 'first-contentful-paint',
      'LCP': 'largest-contentful-paint',
      'CLS': 'cumulative-layout-shift',
      'FID': 'first-input-delay',
      'TTFB': 'time-to-first-byte',
      'INP': 'interaction-to-next-paint',
    };

    const metricName = webVitalMap[metric.name] || metric.name.toLowerCase();
    
    this.recordMetric({
      name: `webvital.${metricName}`,
      value: metric.value,
      unit: metric.name === 'CLS' ? 'score' : 'ms',
      tags: {
        vital: metric.name,
        id: metric.id,
      },
    });
  }

  recordApiCall(endpoint: string, duration: number, status: number): void {
    this.recordMetric({
      name: `api.${endpoint.replace(/\//g, '.')}`,
      value: duration,
      unit: 'ms',
      tags: {
        endpoint,
        status: status.toString(),
        success: (status >= 200 && status < 300).toString(),
      },
    });
  }

  recordCanvasMetric(operation: string, duration: number): void {
    this.recordMetric({
      name: `canvas.${operation}`,
      value: duration,
      unit: 'ms',
      tags: {
        operation,
      },
    });
  }

  recordRenderMetric(phase: string, duration: number, metadata?: Record<string, string>): void {
    this.recordMetric({
      name: `render.${phase}`,
      value: duration,
      unit: 'ms',
      tags: {
        phase,
        ...metadata,
      },
    });
  }

  recordCustomMetric(name: string, value: number, unit: string = 'count', tags?: Record<string, string>): void {
    this.recordMetric({
      name: `custom.${name}`,
      value,
      unit,
      tags,
    });
  }

  getPerformanceSummary(): {
    metrics: Record<string, { avg: number; min: number; max: number; p95: number; p99: number }>;
    violations: Array<{ metric: string; budget: number; current: number }>;
  } {
    const metrics = this.performanceMonitor.getAllMetrics();
    const violations: Array<{ metric: string; budget: number; current: number }> = [];

    // Check for budget violations
    Object.entries(metrics).forEach(([name, stats]) => {
      const budget = this.budgets.get(name);
      if (budget && stats.avg > budget.budget) {
        violations.push({
          metric: name,
          budget: budget.budget,
          current: stats.avg,
        });
      }
    });

    return { metrics, violations };
  }

  startTransaction(name: string, op: string = 'navigation'): any {
    return Sentry.startSpan({
      name,
      op,
      attributes: {
        source: 'custom',
      },
    }, (span) => {
      return span;
    });
  }

  finishTransaction(transaction: any): void {
    // Spans are automatically finished in the new API
  }
}

// Export singleton instance
export const metrics = MetricsService.getInstance();