import { EventEmitter } from 'events';
import { getRenderQueueEvents } from './queues/render.queue';
export interface RenderQueueEventData {
    progress: {
        jobId: string;
        progress: number;
    };
    completed: {
        jobId: string;
        result: any;
    };
    failed: {
        jobId: string;
        error: Error;
    };
}
declare class QueueEventEmitter extends EventEmitter {
    private queueEvents;
    private initialized;
    constructor();
    initialize(): void;
    close(): Promise<void>;
}
export declare function getQueueEventEmitter(): QueueEventEmitter;
export { getRenderQueueEvents };
