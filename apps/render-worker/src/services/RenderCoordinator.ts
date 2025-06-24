import * as Sentry from '@sentry/node';
import type {
  Annotation,
  ImageGenerationOptions,
  PromptGenerationContext,
  ProviderConfig,
} from '@terrashaper/ai-service';
import { PromptGenerator, ProviderManager, RenderProvider } from '@terrashaper/ai-service';
import { createWorkerClient, type SupabaseClientType } from '@terrashaper/db';
import type { RenderJobData, RenderJobResult } from '@terrashaper/queue';
import type { Job } from 'bullmq';

import { getStorage } from '../lib/gcs';
import { logger } from '../lib/logger';
import { workerMetrics } from '../lib/metrics';
import { CreditService } from './CreditService';
import { RenderQualityService } from './RenderQualityService';
import { RenderStorageService } from './RenderStorageService';

/**
 * Main coordinator service that orchestrates the render workflow
 */
export class RenderCoordinator {
  private providerManager: ProviderManager;
  private promptGenerator: PromptGenerator;
  private creditService: CreditService;
  private storageService: RenderStorageService;
  private qualityService: RenderQualityService;
  private supabase: SupabaseClientType;
  private initialized = false;

  constructor() {
    this.providerManager = new ProviderManager();
    this.promptGenerator = new PromptGenerator();

    this.creditService = new CreditService();
    this.storageService = new RenderStorageService(getStorage(), process.env.GCS_BUCKET_NAME!);
    this.qualityService = new RenderQualityService();
    this.supabase = createWorkerClient();
  }

  /**
   * Initialize AI providers with configurations
   */
  private async initializeProviders(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const configs = new Map<RenderProvider, ProviderConfig>([
      [
        RenderProvider.GOOGLE_IMAGEN,
        {
          apiKey: process.env.GOOGLE_API_KEY!,
          projectId: process.env.GOOGLE_CLOUD_PROJECT!,
          region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
          timeout: 60000,
          maxRetries: 3,
        },
      ],
      [
        RenderProvider.OPENAI_GPT_IMAGE,
        {
          apiKey: process.env.OPENAI_API_KEY!,
          timeout: 60000,
          maxRetries: 3,
        },
      ],
    ]);

    await this.providerManager.initialize(configs);
    this.initialized = true;
  }

  /**
   * Process a render job from start to completion
   */
  async processRenderJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
    const { renderId, projectId, prompt, settings, annotations, userId, organizationId } = job.data;
    const startTime = Date.now();

    return Sentry.startSpan(
      {
        name: 'render.process',
        op: 'render',
        attributes: {
          renderId,
          projectId,
          userId,
          organizationId,
          provider: settings.provider || 'auto',
          resolution: settings.resolution,
          quality: settings.quality?.toString() || 'high',
        },
      },
      async () => {
        Sentry.setContext('render', { renderId, projectId, settings });
        workerMetrics.recordJobStart(renderId, 'render.generate');

        try {
          await job.updateProgress(5);
          logger.info(`Starting render ${renderId} for project ${projectId}`);

          // Step 1: Handle credit consumption
          await this.creditService.consumeCredits(organizationId, userId, renderId, settings);
          await job.updateProgress(10);

          // Step 2: Initialize providers and prepare generation
          await this.initializeProviders();
          const { generatedPrompt, generationOptions, provider } = await this.prepareGeneration(
            prompt,
            settings,
            annotations
          );
          await job.updateProgress(30);

          // Step 3: Generate image
          const imageStartTime = Date.now();
          const result = await provider.generateImage(generatedPrompt.prompt, generationOptions);
          Sentry.setMeasurement('image.generation', Date.now() - imageStartTime, 'millisecond');
          await job.updateProgress(70);

          // Step 4: Quality control
          const imageBuffer = await this.storageService.prepareImageBuffer(result);
          const { qualityResult, requiresManualReview } =
            await this.qualityService.performQualityCheck(
              result.imageBase64 || result.imageUrl!,
              generationOptions.width,
              generationOptions.height,
              renderId,
              settings,
              job.attemptsMade
            );
          await job.updateProgress(80);

          // Step 5: Store results
          const { imageUrl, thumbnailUrl } = await this.storageService.storeRenderResult(
            renderId,
            projectId,
            imageBuffer,
            settings,
            generatedPrompt.hash
          );
          await job.updateProgress(95);

          // Step 6: Update database and record usage
          await this.finalizeRender(
            renderId,
            imageUrl,
            thumbnailUrl,
            qualityResult,
            result.metadata,
            requiresManualReview
          );

          await this.creditService.recordUsage(organizationId, renderId, projectId, settings);
          await job.updateProgress(100);

          const processingTime = Date.now() - startTime;
          this.recordSuccessMetrics(renderId, settings, processingTime, imageBuffer.length);

          return {
            renderId,
            imageUrl,
            thumbnailUrl,
            processingTime,
            promptHash: generatedPrompt.hash,
            metadata: {
              width: generationOptions.width,
              height: generationOptions.height,
              format: settings.format,
              fileSize: imageBuffer.length,
            },
          };
        } catch (error) {
          await this.handleRenderFailure(
            error,
            renderId,
            organizationId,
            userId,
            settings,
            startTime
          );
          throw error;
        }
      }
    );
  }

  private async prepareGeneration(prompt: any, settings: any, annotations: any[]) {
    const convertedAnnotations: Annotation[] = annotations
      .filter((a: any) => a.type === 'assetInstance')
      .map((a: any) => ({
        id: a.data.id,
        type: a.data.category || 'plant',
        name: a.data.name,
        position: a.data.position || { x: 0, y: 0 },
        size: a.data.size || { width: 100, height: 100 },
        attributes: a.data.attributes,
      }));

    const promptContext: PromptGenerationContext = {
      annotations: convertedAnnotations,
      template: {
        base: prompt.user,
        style: 'landscape architecture visualization',
        quality: settings.quality ? `quality level ${settings.quality}` : 'high quality',
      },
      userPreferences: {
        style: 'landscape',
      },
    };

    const promptStartTime = Date.now();
    const generatedPrompt = this.promptGenerator.generatePrompt(promptContext);
    Sentry.setMeasurement('prompt.generation', Date.now() - promptStartTime, 'millisecond');

    const [width, height] = settings.resolution.split('x').map(Number);
    const generationOptions: ImageGenerationOptions = {
      width,
      height,
      quality: this.mapQualityLevel(settings.quality),
      style: 'realistic',
    };

    const providerType =
      settings.provider === 'google-imagen'
        ? RenderProvider.GOOGLE_IMAGEN
        : RenderProvider.OPENAI_GPT_IMAGE;

    const provider = await this.providerManager.getProvider(providerType);

    return { generatedPrompt, generationOptions, provider };
  }

  private async finalizeRender(
    renderId: string,
    imageUrl: string,
    thumbnailUrl: string,
    qualityResult: any,
    metadata: any,
    requiresManualReview: boolean
  ): Promise<void> {
    await this.supabase
      .from('renders')
      .update({
        status: 'completed',
        qualityStatus: requiresManualReview ? 'pending_review' : 'auto_approved',
        imageUrl,
        thumbnailUrl,
        metadata: {
          ...metadata,
          quality: qualityResult.score,
          perceptualHash: qualityResult.metadata.perceptualHash,
        },
        completedAt: new Date().toISOString(),
      })
      .eq('id', renderId);
  }

  private async handleRenderFailure(
    error: any,
    renderId: string,
    organizationId: string,
    userId: string,
    settings: any,
    startTime: number
  ): Promise<void> {
    logger.error(`Error processing render ${renderId}:`, error);

    await this.supabase
      .from('renders')
      .update({
        status: 'failed',
        qualityStatus: 'rejected',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
      })
      .eq('id', renderId);

    if (error instanceof Error && error.message !== 'Insufficient credits') {
      await this.creditService.refundCredits(
        organizationId,
        userId,
        renderId,
        settings,
        `Render failed: ${error.message}`
      );
    }

    await this.qualityService.checkForFailurePatterns();

    workerMetrics.recordJobComplete({
      jobId: renderId,
      jobType: 'render.generate',
      duration: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        provider: settings.provider || 'unknown',
        resolution: settings.resolution,
        quality: settings.quality?.toString() || 'high',
      },
    });
  }

  private recordSuccessMetrics(
    renderId: string,
    settings: any,
    processingTime: number,
    imageSize: number
  ): void {
    workerMetrics.recordJobComplete({
      jobId: renderId,
      jobType: 'render.generate',
      duration: processingTime,
      success: true,
      metadata: {
        provider: settings.provider || 'auto',
        resolution: settings.resolution,
        quality: settings.quality?.toString() || 'high',
        imageSize,
        creditCost: this.creditService.calculateCreditCost(settings),
      },
    });
  }

  private mapQualityLevel(quality?: number): 'low' | 'medium' | 'high' | 'ultra' {
    if (!quality) {
      return 'high';
    }
    if (quality <= 25) {
      return 'low';
    }
    if (quality <= 50) {
      return 'medium';
    }
    if (quality <= 75) {
      return 'high';
    }
    return 'ultra';
  }
}
