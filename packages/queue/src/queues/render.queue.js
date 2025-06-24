"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRenderQueue = getRenderQueue;
exports.getRenderQueueEvents = getRenderQueueEvents;
exports.addRenderJob = addRenderJob;
exports.createRenderWorker = createRenderWorker;
exports.getRenderJobCount = getRenderJobCount;
exports.canUserSubmitRender = canUserSubmitRender;
exports.getQueueMetrics = getQueueMetrics;
exports.closeRenderQueue = closeRenderQueue;
const bullmq_1 = require("bullmq");
const config_1 = require("../config");
let renderQueue = null;
let renderQueueEvents = null;
function getRenderQueue(connection) {
    if (!renderQueue) {
        renderQueue = new bullmq_1.Queue(config_1.QUEUE_NAMES.RENDER, {
            ...config_1.defaultQueueOptions,
            ...(connection && { connection }),
        });
    }
    return renderQueue;
}
function getRenderQueueEvents(connection) {
    if (!renderQueueEvents) {
        renderQueueEvents = new bullmq_1.QueueEvents(config_1.QUEUE_NAMES.RENDER, {
            connection: connection || config_1.defaultQueueOptions.connection,
        });
    }
    return renderQueueEvents;
}
async function addRenderJob(data, options) {
    const queue = getRenderQueue();
    // Set priority based on subscription tier
    const priority = options?.priority ??
        config_1.QUEUE_PRIORITIES[data.subscriptionTier.toUpperCase()];
    return queue.add('render', data, {
        priority,
        delay: options?.delay,
    });
}
function createRenderWorker(processFunction, connection, concurrency = 5) {
    return new bullmq_1.Worker(config_1.QUEUE_NAMES.RENDER, processFunction, {
        connection: connection || config_1.defaultQueueOptions.connection,
        concurrency,
        autorun: true,
    });
}
// Rate limiting helpers
async function getRenderJobCount(userId, windowMs = 60000) {
    const queue = getRenderQueue();
    const jobs = await queue.getJobs(['active', 'waiting', 'delayed']);
    const cutoff = Date.now() - windowMs;
    return jobs.filter((job) => job.data.userId === userId && (job.timestamp || 0) > cutoff).length;
}
async function canUserSubmitRender(userId, subscriptionTier) {
    const limits = {
        starter: { perMinute: 2, perHour: 20 },
        pro: { perMinute: 10, perHour: 100 },
        growth: { perMinute: 20, perHour: 300 },
    };
    const limit = limits[subscriptionTier];
    const minuteCount = await getRenderJobCount(userId, 60000);
    const hourCount = await getRenderJobCount(userId, 3600000);
    if (minuteCount >= limit.perMinute) {
        return {
            allowed: false,
            reason: `Rate limit exceeded: ${limit.perMinute} renders per minute`,
        };
    }
    if (hourCount >= limit.perHour) {
        return {
            allowed: false,
            reason: `Rate limit exceeded: ${limit.perHour} renders per hour`,
        };
    }
    return { allowed: true };
}
// Queue metrics
async function getQueueMetrics() {
    const queue = getRenderQueue();
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
    ]);
    // BullMQ doesn't have getPausedCount in newer versions
    const paused = 0;
    return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused,
        total: waiting + active + delayed + paused,
    };
}
// Cleanup on shutdown
async function closeRenderQueue() {
    if (renderQueue) {
        await renderQueue.close();
        renderQueue = null;
    }
    if (renderQueueEvents) {
        await renderQueueEvents.close();
        renderQueueEvents = null;
    }
}
