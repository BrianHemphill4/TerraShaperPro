import { Queue, Worker, QueueEvents, Job, ConnectionOptions } from 'bullmq';
import { RenderJobData, RenderJobResult } from '../types';
export declare function getRenderQueue(connection?: ConnectionOptions): Queue<RenderJobData, RenderJobResult>;
export declare function getRenderQueueEvents(connection?: ConnectionOptions): QueueEvents;
export declare function addRenderJob(data: RenderJobData, options?: {
    priority?: number;
    delay?: number;
}): Promise<Job<RenderJobData, RenderJobResult>>;
export declare function createRenderWorker(processFunction: (job: Job<RenderJobData>) => Promise<RenderJobResult>, connection?: ConnectionOptions, concurrency?: number): Worker<RenderJobData, RenderJobResult>;
export declare function getRenderJobCount(userId: string, windowMs?: number): Promise<number>;
export declare function canUserSubmitRender(userId: string, subscriptionTier: 'starter' | 'pro' | 'growth'): Promise<{
    allowed: boolean;
    reason?: string;
}>;
export declare function getQueueMetrics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
    total: number;
}>;
export declare function closeRenderQueue(): Promise<void>;
