import { ConnectionOptions, QueueOptions } from 'bullmq';
export declare const redisConnection: ConnectionOptions;
export declare const defaultQueueOptions: QueueOptions;
export declare const QUEUE_NAMES: {
    readonly RENDER: "renderQueue";
    readonly NOTIFICATION: "notificationQueue";
};
export declare const QUEUE_PRIORITIES: {
    readonly STARTER: 5;
    readonly PRO: 3;
    readonly GROWTH: 1;
};
