var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Queue, Worker, QueueEvents } from 'bullmq';
import { QUEUE_NAMES, QUEUE_PRIORITIES, defaultQueueOptions } from '../config';
let renderQueue = null;
let renderQueueEvents = null;
export function getRenderQueue(connection) {
    if (!renderQueue) {
        renderQueue = new Queue(QUEUE_NAMES.RENDER, Object.assign(Object.assign({}, defaultQueueOptions), (connection && { connection })));
    }
    return renderQueue;
}
export function getRenderQueueEvents(connection) {
    if (!renderQueueEvents) {
        renderQueueEvents = new QueueEvents(QUEUE_NAMES.RENDER, {
            connection: connection || defaultQueueOptions.connection,
        });
    }
    return renderQueueEvents;
}
export function addRenderJob(data, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const queue = getRenderQueue();
        // Set priority based on subscription tier
        const priority = (_a = options === null || options === void 0 ? void 0 : options.priority) !== null && _a !== void 0 ? _a : QUEUE_PRIORITIES[data.subscriptionTier.toUpperCase()];
        return queue.add('render', data, {
            priority,
            delay: options === null || options === void 0 ? void 0 : options.delay,
        });
    });
}
export function createRenderWorker(processFunction, connection, concurrency = 5) {
    return new Worker(QUEUE_NAMES.RENDER, processFunction, {
        connection: connection || defaultQueueOptions.connection,
        concurrency,
        autorun: true,
    });
}
// Rate limiting helpers
export function getRenderJobCount(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, windowMs = 60000) {
        const queue = getRenderQueue();
        const jobs = yield queue.getJobs(['active', 'waiting', 'delayed']);
        const cutoff = Date.now() - windowMs;
        return jobs.filter((job) => job.data.userId === userId && (job.timestamp || 0) > cutoff).length;
    });
}
export function canUserSubmitRender(userId, subscriptionTier) {
    return __awaiter(this, void 0, void 0, function* () {
        const limits = {
            starter: { perMinute: 2, perHour: 20 },
            pro: { perMinute: 10, perHour: 100 },
            growth: { perMinute: 20, perHour: 300 },
        };
        const limit = limits[subscriptionTier];
        const minuteCount = yield getRenderJobCount(userId, 60000);
        const hourCount = yield getRenderJobCount(userId, 3600000);
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
    });
}
// Queue metrics
export function getQueueMetrics() {
    return __awaiter(this, void 0, void 0, function* () {
        const queue = getRenderQueue();
        const [waiting, active, completed, failed, delayed] = yield Promise.all([
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
    });
}
// Cleanup on shutdown
export function closeRenderQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        if (renderQueue) {
            yield renderQueue.close();
            renderQueue = null;
        }
        if (renderQueueEvents) {
            yield renderQueueEvents.close();
            renderQueueEvents = null;
        }
    });
}
