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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("@terrashaper/queue");
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("./config/redis");
const logger_1 = require("./lib/logger");
const metrics_1 = require("./lib/metrics");
const sentry_1 = require("./lib/sentry");
const failureMonitor_1 = require("./processors/failureMonitor");
const renderProcessor_1 = require("./processors/renderProcessor");
dotenv_1.default.config();
// Initialize Sentry before anything else
(0, sentry_1.initSentry)();
const concurrency = Number.parseInt(process.env.WORKER_CONCURRENCY || '5');
const worker = (0, queue_1.createRenderWorker)(renderProcessor_1.processRenderJob, redis_1.connection, concurrency);
worker.on('completed', (job, result) => {
    logger_1.logger.info(`✓ Render ${job.id} completed in ${result.processingTime}ms`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`✗ Render ${job === null || job === void 0 ? void 0 : job.id} failed:`, err, {
        jobId: job === null || job === void 0 ? void 0 : job.id,
        jobData: job === null || job === void 0 ? void 0 : job.data,
    });
    (0, sentry_1.captureException)(err, {
        jobId: job === null || job === void 0 ? void 0 : job.id,
        jobData: job === null || job === void 0 ? void 0 : job.data,
    });
});
worker.on('progress', (job, progress) => {
    const progressValue = typeof progress === 'object' ? progress.percent || 0 : progress;
    logger_1.logger.debug(`◊ Render ${job.id} progress: ${progressValue}%`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, closing worker...');
    await worker.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, closing worker...');
    await worker.close();
    process.exit(0);
});
logger_1.logger.info(`🚀 Render Worker started with concurrency: ${concurrency}`);
// Start failure monitoring
(0, failureMonitor_1.startFailureMonitor)();
// Start periodic queue metrics collection
setInterval(async () => {
    try {
        // Use the metrics function from the queue module instead of accessing worker.queue
        const { getRenderQueue } = await Promise.resolve().then(() => __importStar(require('@terrashaper/queue')));
        const queue = getRenderQueue(redis_1.connection);
        const waiting = await queue.getWaitingCount();
        const active = await queue.getActiveCount();
        const completed = await queue.getCompletedCount();
        const failed = await queue.getFailedCount();
        metrics_1.workerMetrics.recordQueueMetrics('render', waiting + active, waiting, active);
        logger_1.logger.debug(`Queue metrics: waiting=${waiting}, active=${active}, completed=${completed}, failed=${failed}`);
    }
    catch (error) {
        logger_1.logger.error('Failed to collect queue metrics', error);
    }
}, 30000); // Every 30 seconds
