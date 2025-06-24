import type { RenderJobData, RenderJobResult } from '@terrashaper/queue';
import type { Job } from 'bullmq';
/**
 * Main coordinator service that orchestrates the render workflow
 */
export declare class RenderCoordinator {
    private providerManager;
    private promptGenerator;
    private creditService;
    private storageService;
    private qualityService;
    private supabase;
    private initialized;
    constructor();
    /**
     * Initialize AI providers with configurations
     */
    private initializeProviders;
    /**
     * Process a render job from start to completion
     */
    processRenderJob(job: Job<RenderJobData>): Promise<RenderJobResult>;
    private prepareGeneration;
    private finalizeRender;
    private handleRenderFailure;
    private recordSuccessMetrics;
    private mapQualityLevel;
}
