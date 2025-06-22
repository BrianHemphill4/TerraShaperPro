import * as Sentry from '@sentry/node';

export type JobMetrics = {
  jobId: string;
  jobType: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
};

export class WorkerMetrics {
  private static instance: WorkerMetrics;
  private metricsBuffer: JobMetrics[] = [];
  private flushInterval: NodeJS.Timeout;

  private constructor() {
    // Flush metrics every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, 30000);
  }

  static getInstance(): WorkerMetrics {
    if (!WorkerMetrics.instance) {
      WorkerMetrics.instance = new WorkerMetrics();
    }
    return WorkerMetrics.instance;
  }

  recordJobStart(jobId: string, jobType: string): void {
    Sentry.addBreadcrumb({
      message: `Job started: ${jobType}`,
      category: 'job',
      level: 'info',
      data: { jobId, jobType },
    });
  }

  recordJobComplete(metrics: JobMetrics): void {
    // Add to buffer
    this.metricsBuffer.push(metrics);

    // Record in Sentry with current span
    Sentry.withScope((scope) => {
      scope.setTag('job.type', metrics.jobType);
      scope.setTag('job.success', metrics.success.toString());

      if (metrics.metadata) {
        Object.entries(metrics.metadata).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      Sentry.setMeasurement('job.duration', metrics.duration, 'millisecond');
    });

    // Log job completion
    if (metrics.success) {
      Sentry.addBreadcrumb({
        message: `Job completed successfully: ${metrics.jobType}`,
        category: 'job',
        level: 'info',
        data: {
          jobId: metrics.jobId,
          duration: metrics.duration,
          ...metrics.metadata,
        },
      });
    } else {
      Sentry.captureMessage(`Job failed: ${metrics.jobType}`, {
        level: 'error',
        tags: {
          jobId: metrics.jobId,
          jobType: metrics.jobType,
        },
        extra: {
          error: metrics.error,
          duration: metrics.duration,
          ...metrics.metadata,
        },
      });
    }

    // Check for performance issues
    this.checkPerformance(metrics);
  }

  private checkPerformance(metrics: JobMetrics): void {
    const performanceThresholds: Record<string, number> = {
      'render.generate': 60000, // 1 minute
      'render.upscale': 30000, // 30 seconds
      'image.optimize': 5000, // 5 seconds
      'image.thumbnail': 2000, // 2 seconds
    };

    const threshold = performanceThresholds[metrics.jobType];
    if (threshold && metrics.duration > threshold) {
      Sentry.captureMessage(`Job performance threshold exceeded: ${metrics.jobType}`, {
        level: 'warning',
        tags: {
          jobType: metrics.jobType,
          threshold: threshold.toString(),
          duration: metrics.duration.toString(),
        },
        extra: {
          jobId: metrics.jobId,
          exceeded: metrics.duration - threshold,
          percentage: `${((metrics.duration / threshold) * 100).toFixed(2)}%`,
          ...metrics.metadata,
        },
      });
    }
  }

  recordQueueMetrics(queueName: string, size: number, waiting: number, active: number): void {
    // Record queue metrics as tags instead of deprecated metrics API
    Sentry.withScope((scope) => {
      scope.setTag(`queue.${queueName}.size`, size.toString());
      scope.setTag(`queue.${queueName}.waiting`, waiting.toString());
      scope.setTag(`queue.${queueName}.active`, active.toString());

      Sentry.addBreadcrumb({
        message: `Queue metrics recorded for ${queueName}`,
        category: 'metrics',
        level: 'debug',
        data: { size, waiting, active },
      });
    });
  }

  recordMemoryUsage(): void {
    const usage = process.memoryUsage();

    Sentry.withScope((scope) => {
      scope.setContext('memory', {
        heapUsed: Math.round(usage.heapUsed / 1048576),
        heapTotal: Math.round(usage.heapTotal / 1048576),
        rss: Math.round(usage.rss / 1048576),
        external: Math.round(usage.external / 1048576),
        unit: 'megabyte',
      });

      Sentry.addBreadcrumb({
        message: 'Memory usage recorded',
        category: 'performance',
        level: 'debug',
        data: {
          heapUsedMB: Math.round(usage.heapUsed / 1048576),
          heapTotalMB: Math.round(usage.heapTotal / 1048576),
          rssMB: Math.round(usage.rss / 1048576),
        },
      });
    });
  }

  recordCpuUsage(): void {
    const usage = process.cpuUsage();

    Sentry.withScope((scope) => {
      scope.setContext('cpu', {
        user: Math.round(usage.user / 1000),
        system: Math.round(usage.system / 1000),
        unit: 'millisecond',
      });

      Sentry.addBreadcrumb({
        message: 'CPU usage recorded',
        category: 'performance',
        level: 'debug',
        data: {
          userMs: Math.round(usage.user / 1000),
          systemMs: Math.round(usage.system / 1000),
        },
      });
    });
  }

  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    // Aggregate metrics by job type
    const aggregated = new Map<
      string,
      {
        count: number;
        successCount: number;
        totalDuration: number;
        minDuration: number;
        maxDuration: number;
        errors: string[];
      }
    >();

    this.metricsBuffer.forEach((metric) => {
      const existing = aggregated.get(metric.jobType);

      if (existing) {
        existing.count++;
        if (metric.success) {
          existing.successCount++;
        }
        existing.totalDuration += metric.duration;
        existing.minDuration = Math.min(existing.minDuration, metric.duration);
        existing.maxDuration = Math.max(existing.maxDuration, metric.duration);
        if (metric.error) {
          existing.errors.push(metric.error);
        }
      } else {
        aggregated.set(metric.jobType, {
          count: 1,
          successCount: metric.success ? 1 : 0,
          totalDuration: metric.duration,
          minDuration: metric.duration,
          maxDuration: metric.duration,
          errors: metric.error ? [metric.error] : [],
        });
      }
    });

    // Send aggregated metrics as context data
    aggregated.forEach((data, jobType) => {
      const avgDuration = data.totalDuration / data.count;
      const successRate = (data.successCount / data.count) * 100;

      Sentry.withScope((scope) => {
        scope.setContext(`job_metrics_${jobType}`, {
          avgDuration,
          successRate,
          count: data.count,
          successCount: data.successCount,
          failureCount: data.count - data.successCount,
          minDuration: data.minDuration,
          maxDuration: data.maxDuration,
          errors: data.errors,
        });

        Sentry.addBreadcrumb({
          message: `Aggregated metrics for ${jobType}`,
          category: 'metrics',
          level: 'info',
          data: {
            avgDuration,
            successRate: `${successRate.toFixed(2)}%`,
            count: data.count,
          },
        });
      });
    });

    // Clear buffer
    this.metricsBuffer = [];

    // Also record system metrics
    this.recordMemoryUsage();
    this.recordCpuUsage();
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushMetrics(); // Final flush
    }
  }
}

// Export singleton
export const workerMetrics = WorkerMetrics.getInstance();

// Cleanup on exit
process.on('exit', () => {
  workerMetrics.destroy();
});

process.on('SIGINT', () => {
  workerMetrics.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  workerMetrics.destroy();
  process.exit(0);
});
