import { ConnectionOptions, Queue, QueueEvents, Job, Worker, QueueOptions } from 'bullmq';
import { EventEmitter } from 'events';

/**
 * Data structure for render job queue entries.
 * Contains all information needed to process an AI image generation request.
 */
interface RenderJobData {
    renderId: string;
    projectId: string;
    sceneId: string;
    userId: string;
    organizationId: string;
    subscriptionTier: 'starter' | 'pro' | 'growth';
    sourceImageUrl: string;
    maskImageUrl?: string;
    prompt: {
        system: string;
        user: string;
    };
    annotations: Array<{
        type: 'mask' | 'assetInstance' | 'textLabel';
        data: any;
    }>;
    settings: {
        provider: 'google-imagen' | 'openai-gpt-image';
        resolution: '1024x1024' | '2048x2048' | '4096x4096';
        format: 'PNG' | 'JPEG';
        quality?: number;
    };
}
/**
 * Result structure returned from completed render jobs.
 * Contains the generated images and processing metadata.
 */
interface RenderJobResult {
    renderId: string;
    imageUrl: string;
    thumbnailUrl: string;
    processingTime: number;
    promptHash: string;
    metadata: {
        width: number;
        height: number;
        format: string;
        fileSize: number;
    };
}
/**
 * Data structure for notification job queue entries.
 * Handles various types of user notifications and alerts.
 */
interface NotificationJobData {
    type: 'email' | 'in-app' | 'push';
    userId: string;
    template: string;
    data: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
}
/**
 * Union type representing all possible job statuses in the queue system.
 * Covers the complete lifecycle of queued jobs.
 */
type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';

declare function getRenderQueue(connection?: ConnectionOptions): Queue<RenderJobData, RenderJobResult>;
declare function getRenderQueueEvents(connection?: ConnectionOptions): QueueEvents;
declare function addRenderJob(data: RenderJobData, options?: {
    priority?: number;
    delay?: number;
}): Promise<Job<RenderJobData, RenderJobResult>>;
declare function createRenderWorker(processFunction: (job: Job<RenderJobData>) => Promise<RenderJobResult>, connection?: ConnectionOptions, concurrency?: number): Worker<RenderJobData, RenderJobResult>;
declare function getRenderJobCount(userId: string, windowMs?: number): Promise<number>;
declare function canUserSubmitRender(userId: string, subscriptionTier: 'starter' | 'pro' | 'growth'): Promise<{
    allowed: boolean;
    reason?: string;
}>;
declare function getQueueMetrics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
    total: number;
}>;
declare function closeRenderQueue(): Promise<void>;

declare const redisConnection: ConnectionOptions;
declare const defaultQueueOptions: QueueOptions;
declare const QUEUE_NAMES: {
    readonly RENDER: "renderQueue";
    readonly NOTIFICATION: "notificationQueue";
};
declare const QUEUE_PRIORITIES: {
    readonly STARTER: 5;
    readonly PRO: 3;
    readonly GROWTH: 1;
};

interface RenderQueueEventData {
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
declare function getQueueEventEmitter(): QueueEventEmitter;

export { type JobStatus, type NotificationJobData, QUEUE_NAMES, QUEUE_PRIORITIES, type RenderJobData, type RenderJobResult, type RenderQueueEventData, addRenderJob, canUserSubmitRender, closeRenderQueue, createRenderWorker, defaultQueueOptions, getQueueEventEmitter, getQueueMetrics, getRenderJobCount, getRenderQueue, getRenderQueueEvents, redisConnection };
