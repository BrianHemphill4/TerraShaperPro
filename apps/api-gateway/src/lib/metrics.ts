import * as Sentry from '@sentry/node';

export type MetricData = {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
};

export type PerformanceBudget = {
  metric: string;
  budget: number;
  unit: string;
  threshold?: 'error' | 'warning';
};

export class ApiMetrics {
  private static instance: ApiMetrics;
  private budgets: Map<string, PerformanceBudget> = new Map();
  private metricsBuffer: MetricData[] = [];
  private flushInterval: NodeJS.Timeout;

  private constructor() {
    this.initializeDefaultBudgets();

    // Flush metrics every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, 10000);

    // Set environment tag for all events
    Sentry.setTag('environment', process.env.NODE_ENV || 'development');
  }

  static getInstance(): ApiMetrics {
    if (!ApiMetrics.instance) {
      ApiMetrics.instance = new ApiMetrics();
    }
    return ApiMetrics.instance;
  }

  private initializeDefaultBudgets(): void {
    // tRPC endpoint budgets
    this.setBudget('trpc.auth.getSession', 50, 'ms');
    this.setBudget('trpc.plant.search', 100, 'ms');
    this.setBudget('trpc.project.list', 200, 'ms');
    this.setBudget('trpc.render.create', 500, 'ms');
    this.setBudget('trpc.render.getStatus', 50, 'ms');

    // Database query budgets
    this.setBudget('db.query.select', 50, 'ms');
    this.setBudget('db.query.insert', 100, 'ms');
    this.setBudget('db.query.update', 100, 'ms');
    this.setBudget('db.query.delete', 50, 'ms');

    // External service budgets
    this.setBudget('external.openai', 5000, 'ms', 'warning');
    this.setBudget('external.gcs.upload', 2000, 'ms');
    this.setBudget('external.gcs.download', 1000, 'ms');
    this.setBudget('external.stripe', 2000, 'ms');

    // Queue operation budgets
    this.setBudget('queue.job.enqueue', 100, 'ms');
    this.setBudget('queue.job.process', 60000, 'ms', 'warning');
  }

  setBudget(
    metric: string,
    budget: number,
    unit: string,
    threshold: 'error' | 'warning' = 'error'
  ): void {
    this.budgets.set(metric, { metric, budget, unit, threshold });
  }

  recordMetric(metric: MetricData): void {
    // Add to buffer
    this.metricsBuffer.push(metric);

    // Add tags to current scope
    if (metric.tags) {
      const scope = Sentry.getCurrentScope();
      Object.entries(metric.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Check budget
    const budget = this.budgets.get(metric.name);
    if (budget && metric.value > budget.budget) {
      this.handleBudgetViolation(metric, budget);
    }

    // Flush if buffer is getting large
    if (this.metricsBuffer.length > 100) {
      this.flushMetrics();
    }
  }

  private handleBudgetViolation(metric: MetricData, budget: PerformanceBudget): void {
    const violation = {
      metric: metric.name,
      value: metric.value,
      budget: budget.budget,
      unit: budget.unit,
      exceeded: metric.value - budget.budget,
      percentage: `${((metric.value / budget.budget) * 100).toFixed(2)}%`,
    };

    const level = budget.threshold === 'warning' ? 'warning' : 'error';

    Sentry.captureMessage(`Performance budget exceeded: ${metric.name}`, {
      level: level as Sentry.SeverityLevel,
      tags: {
        metric: metric.name,
        threshold: budget.threshold,
        ...metric.tags,
      },
      contexts: {
        performanceBudget: violation,
      },
    });
  }

  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) return;

    // Aggregate metrics by name
    const aggregated = new Map<
      string,
      {
        count: number;
        sum: number;
        min: number;
        max: number;
        unit: string;
        tags?: Record<string, string>;
      }
    >();

    this.metricsBuffer.forEach((metric) => {
      const key = metric.name;
      const existing = aggregated.get(key);

      if (existing) {
        existing.count++;
        existing.sum += metric.value;
        existing.min = Math.min(existing.min, metric.value);
        existing.max = Math.max(existing.max, metric.value);
      } else {
        aggregated.set(key, {
          count: 1,
          sum: metric.value,
          min: metric.value,
          max: metric.value,
          unit: metric.unit,
          tags: metric.tags,
        });
      }
    });

    // Send aggregated metrics to Sentry
    aggregated.forEach((data, name) => {
      const avg = data.sum / data.count;

      // Send custom event with metrics data
      Sentry.captureEvent({
        message: `Metrics: ${name}`,
        level: 'info',
        tags: {
          metric_name: name,
          ...data.tags,
        },
        extra: {
          avg,
          count: data.count,
          min: data.min,
          max: data.max,
          unit: data.unit,
        },
      });
    });

    // Clear buffer
    this.metricsBuffer = [];
  }

  recordTrpcCall(
    procedure: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, string>
  ): void {
    this.recordMetric({
      name: `trpc.${procedure}`,
      value: duration,
      unit: 'ms',
      tags: {
        procedure,
        success: success.toString(),
        ...metadata,
      },
    });
  }

  recordDatabaseQuery(operation: string, table: string, duration: number, rowCount?: number): void {
    this.recordMetric({
      name: `db.query.${operation}`,
      value: duration,
      unit: 'ms',
      tags: {
        operation,
        table,
        rows: rowCount?.toString() || '0',
      },
    });
  }

  recordExternalCall(service: string, operation: string, duration: number, success: boolean): void {
    this.recordMetric({
      name: `external.${service}`,
      value: duration,
      unit: 'ms',
      tags: {
        service,
        operation,
        success: success.toString(),
      },
    });
  }

  recordQueueOperation(
    operation: string,
    queue: string,
    duration: number,
    metadata?: Record<string, string>
  ): void {
    this.recordMetric({
      name: `queue.${operation}`,
      value: duration,
      unit: 'ms',
      tags: {
        queue,
        operation,
        ...metadata,
      },
    });
  }

  recordCustom(
    name: string,
    value: number,
    unit: string = 'count',
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name: `custom.${name}`,
      value,
      unit,
      tags,
    });
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushMetrics(); // Final flush
    }
  }
}

// Export singleton
export const apiMetrics = ApiMetrics.getInstance();

// Ensure cleanup on process exit
process.on('exit', () => {
  apiMetrics.destroy();
});

process.on('SIGINT', () => {
  apiMetrics.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  apiMetrics.destroy();
  process.exit(0);
});
