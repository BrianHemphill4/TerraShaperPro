var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventEmitter } from 'events';
import { getRenderQueueEvents } from './queues/render.queue';
class QueueEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.initialized = false;
        this.setMaxListeners(100); // Allow many SSE connections
    }
    initialize() {
        if (this.initialized)
            return;
        this.queueEvents = getRenderQueueEvents();
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
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queueEvents) {
                yield this.queueEvents.close();
            }
            this.removeAllListeners();
        });
    }
}
// Singleton instance
let queueEventEmitter = null;
export function getQueueEventEmitter() {
    if (!queueEventEmitter) {
        queueEventEmitter = new QueueEventEmitter();
        queueEventEmitter.initialize();
    }
    return queueEventEmitter;
}
export { getRenderQueueEvents };
