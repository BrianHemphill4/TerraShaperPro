"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerMetrics = exports.WorkerMetrics = void 0;
const Sentry = __importStar(require("@sentry/node"));
class WorkerMetrics {
    constructor() {
        this.metricsBuffer = [];
        // Flush metrics every 30 seconds
        this.flushInterval = setInterval(() => {
            this.flushMetrics();
        }, 30000);
    }
    static getInstance() {
        if (!WorkerMetrics.instance) {
            WorkerMetrics.instance = new WorkerMetrics();
        }
        return WorkerMetrics.instance;
    }
    recordJobStart(jobId, jobType) {
        Sentry.addBreadcrumb({
            message: `Job started: ${jobType}`,
            category: 'job',
            level: 'info',
            data: { jobId, jobType },
        });
    }
    recordJobComplete(metrics) {
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
                data: Object.assign({ jobId: metrics.jobId, duration: metrics.duration }, metrics.metadata),
            });
        }
        else {
            Sentry.captureMessage(`Job failed: ${metrics.jobType}`, {
                level: 'error',
                tags: {
                    jobId: metrics.jobId,
                    jobType: metrics.jobType,
                },
                extra: Object.assign({ error: metrics.error, duration: metrics.duration }, metrics.metadata),
            });
        }
        // Check for performance issues
        this.checkPerformance(metrics);
    }
    checkPerformance(metrics) {
        const performanceThresholds = {
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
                extra: Object.assign({ jobId: metrics.jobId, exceeded: metrics.duration - threshold, percentage: `${((metrics.duration / threshold) * 100).toFixed(2)}%` }, metrics.metadata),
            });
        }
    }
    recordQueueMetrics(queueName, size, waiting, active) {
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
    recordMemoryUsage() {
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
    recordCpuUsage() {
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
    flushMetrics() {
        if (this.metricsBuffer.length === 0) {
            return;
        }
        // Aggregate metrics by job type
        const aggregated = new Map();
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
            }
            else {
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
    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushMetrics(); // Final flush
        }
    }
}
exports.WorkerMetrics = WorkerMetrics;
// Export singleton
exports.workerMetrics = WorkerMetrics.getInstance();
// Cleanup on exit
process.on('exit', () => {
    exports.workerMetrics.destroy();
});
process.on('SIGINT', () => {
    exports.workerMetrics.destroy();
    process.exit(0);
});
process.on('SIGTERM', () => {
    exports.workerMetrics.destroy();
    process.exit(0);
});
