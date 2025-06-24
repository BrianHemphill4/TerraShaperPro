"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRenderQueueEvents = void 0;
exports.getQueueEventEmitter = getQueueEventEmitter;
const events_1 = require("events");
const render_queue_1 = require("./queues/render.queue");
Object.defineProperty(exports, "getRenderQueueEvents", { enumerable: true, get: function () { return render_queue_1.getRenderQueueEvents; } });
class QueueEventEmitter extends events_1.EventEmitter {
    queueEvents;
    initialized = false;
    constructor() {
        super();
        this.setMaxListeners(100); // Allow many SSE connections
    }
    initialize() {
        if (this.initialized)
            return;
        this.queueEvents = (0, render_queue_1.getRenderQueueEvents)();
        // Set up queue event listeners
        this.queueEvents.on('progress', (data) => {
            this.emit('progress', {
                jobId: data.jobId,
                progress: data.data,
            });
        });
        this.queueEvents.on('completed', (data) => {
            this.emit('completed', {
                jobId: data.jobId,
                result: data.returnvalue,
            });
        });
        this.queueEvents.on('failed', (data) => {
            this.emit('failed', {
                jobId: data.jobId,
                error: new Error(data.failedReason || 'Job failed'),
            });
        });
        this.initialized = true;
    }
    async close() {
        if (this.queueEvents) {
            await this.queueEvents.close();
        }
        this.removeAllListeners();
    }
}
// Singleton instance
let queueEventEmitter = null;
function getQueueEventEmitter() {
    if (!queueEventEmitter) {
        queueEventEmitter = new QueueEventEmitter();
        queueEventEmitter.initialize();
    }
    return queueEventEmitter;
}
