'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.apiMetrics = exports.ApiMetrics = void 0;
const Sentry = __importStar(require('@sentry/node'));
class ApiMetrics {
  static instance;
  budgets = new Map();
  metricsBuffer = [];
  flushInterval;
  constructor() {
    this.initializeDefaultBudgets();
    // Flush metrics every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, 10000);
    // Set environment tag for all events
    Sentry.setTag('environment', process.env.NODE_ENV || 'development');
  }
  static getInstance() {
    if (!ApiMetrics.instance) {
      ApiMetrics.instance = new ApiMetrics();
    }
    return ApiMetrics.instance;
  }
  initializeDefaultBudgets() {
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
  setBudget(metric, budget, unit, threshold = 'error') {
    this.budgets.set(metric, { metric, budget, unit, threshold });
  }
  recordMetric(metric) {
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
  handleBudgetViolation(metric, budget) {
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
      level: level,
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
  flushMetrics() {
    if (this.metricsBuffer.length === 0) return;
    // Aggregate metrics by name
    const aggregated = new Map();
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
  recordTrpcCall(procedure, duration, success, metadata) {
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
  recordDatabaseQuery(operation, table, duration, rowCount) {
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
  recordExternalCall(service, operation, duration, success) {
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
  recordQueueOperation(operation, queue, duration, metadata) {
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
  recordCustom(name, value, unit = 'count', tags) {
    this.recordMetric({
      name: `custom.${name}`,
      value,
      unit,
      tags,
    });
  }
  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushMetrics(); // Final flush
    }
  }
}
exports.ApiMetrics = ApiMetrics;
// Export singleton
exports.apiMetrics = ApiMetrics.getInstance();
// Ensure cleanup on process exit
process.on('exit', () => {
  exports.apiMetrics.destroy();
});
process.on('SIGINT', () => {
  exports.apiMetrics.destroy();
  process.exit(0);
});
process.on('SIGTERM', () => {
  exports.apiMetrics.destroy();
  process.exit(0);
});
