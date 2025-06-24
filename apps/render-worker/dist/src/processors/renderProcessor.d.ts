import type { RenderJobData, RenderJobResult } from '@terrashaper/queue';
import type { Job } from 'bullmq';
export declare function processRenderJob(job: Job<RenderJobData>): Promise<RenderJobResult>;
