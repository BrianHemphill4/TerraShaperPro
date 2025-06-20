import { Buffer } from 'node:buffer';

import { createClient } from '@supabase/supabase-js';
import type {
  Annotation,
  ImageGenerationOptions,
  PromptGenerationContext,
  ProviderConfig,
} from '@terrashaper/ai-service';
import {
  FailureDetectionService,
  PromptGenerator,
  ProviderManager,
  QualityChecker,
  RenderProvider,
  ReviewQueueService,
} from '@terrashaper/ai-service';
import { ImageProcessor } from '@terrashaper/storage';
import type { Job } from 'bullmq';

// import type { RenderJobData, RenderJobResult } from '@terrashaper/queue';
import type { RenderJobData, RenderJobResult } from '../../../../packages/queue/src/types';
import { getStorage } from '../lib/gcs';
import { logger } from '../lib/logger';
import { workerMetrics } from '../lib/metrics';
import * as Sentry from '@sentry/node';

const providerManager = new ProviderManager();
const promptGenerator = new PromptGenerator();
const qualityChecker = new QualityChecker();

let reviewQueueService: ReviewQueueService;
let failureDetectionService: FailureDetectionService;
let initialized = false;

async function initializeProviders() {
  if (initialized) {
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

  await providerManager.initialize(configs);

  // Initialize quality review and failure detection services
  reviewQueueService = new ReviewQueueService(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  failureDetectionService = new FailureDetectionService(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  initialized = true;
}

export async function processRenderJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
  const { renderId, projectId, prompt, settings, annotations, userId, organizationId } = job.data;
  const startTime = Date.now();
  
  // Start Sentry transaction
  const transaction = Sentry.startTransaction({
    name: 'render.process',
    op: 'render',
    tags: {
      renderId,
      projectId,
      userId,
      organizationId,
      provider: settings.provider || 'auto',
      resolution: settings.resolution,
      quality: settings.quality?.toString() || 'high',
    },
  });
  
  Sentry.getCurrentHub().configureScope(scope => {
    scope.setSpan(transaction);
    scope.setContext('render', {
      renderId,
      projectId,
      settings,
    });
  });
  
  // Record job start
  workerMetrics.recordJobStart(renderId, 'render.generate');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await job.updateProgress(5);
    logger.info(`Starting render ${renderId} for project ${projectId}`);

    // Check and consume credits
    const creditCost = getCreditCost(settings);
    const { data: consumeResult, error: consumeError } = await supabase.rpc('consume_credits', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_render_id: renderId,
      p_amount: creditCost,
      p_description: `Render: ${settings.resolution} @ ${settings.quality || 'high'} quality`,
    });

    if (consumeError || !consumeResult) {
      throw new Error('Insufficient credits');
    }

    await initializeProviders();
    await job.updateProgress(10);

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
    const generatedPrompt = promptGenerator.generatePrompt(promptContext);
    transaction.setMeasurement('prompt.generation', Date.now() - promptStartTime, 'millisecond');
    await job.updateProgress(20);

    const [width, height] = settings.resolution.split('x').map(Number);
    const generationOptions: ImageGenerationOptions = {
      width,
      height,
      quality: mapQualityLevel(settings.quality),
      style: 'realistic',
    };

    const providerType =
      settings.provider === 'google-imagen'
        ? RenderProvider.GOOGLE_IMAGEN
        : RenderProvider.OPENAI_GPT_IMAGE;

    const provider = await providerManager.getProvider(providerType);
    await job.updateProgress(30);

    const imageStartTime = Date.now();
    const result = await provider.generateImage(generatedPrompt.prompt, generationOptions);
    transaction.setMeasurement('image.generation', Date.now() - imageStartTime, 'millisecond');
    await job.updateProgress(70);

    const qualityResult = await qualityChecker.checkQuality(result.imageBase64 || result.imageUrl, {
      minResolution: { width: width / 2, height: height / 2 },
      minQualityScore: 0.6,
    });

    // Check for duplicate renders
    const duplicateCheck = await reviewQueueService.checkForDuplicates(
      qualityResult.metadata.perceptualHash!
    );

    if (duplicateCheck.isDuplicate) {
      throw new Error(
        `Duplicate render detected: Similar to render ${duplicateCheck.similarRenders[0].renderId} (${(duplicateCheck.similarRenders[0].similarity * 100).toFixed(1)}% similarity)`
      );
    }

    // Add to review queue if quality check failed or manual review required
    const forceManualReview =
      (settings as any).forceManualReview ||
      job.attemptsMade > 1 ||
      (settings.quality && settings.quality > 75);

    if (!qualityResult.passed || forceManualReview) {
      await reviewQueueService.addToReviewQueue(
        renderId,
        qualityResult.score,
        qualityResult.issues,
        {
          resolution: qualityResult.metadata.resolution!,
          format: qualityResult.metadata.format!,
          size: qualityResult.metadata.size!,
          perceptualHash: qualityResult.metadata.perceptualHash!,
          renderSettings: settings,
        },
        forceManualReview
      );

      if (!qualityResult.passed) {
        throw new Error(`Quality check failed: ${qualityResult.issues.join(', ')}`);
      }
    }

    await job.updateProgress(80);

    const storage = getStorage();
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);
    const fileName = `renders/${projectId}/${renderId}.${settings.format.toLowerCase()}`;
    const thumbnailFileName = `renders/${projectId}/${renderId}_thumb.webp`;

    let imageBuffer: Buffer;
    if (result.imageBase64) {
      imageBuffer = Buffer.from(result.imageBase64, 'base64');
    } else {
      const response = await fetch(result.imageUrl);
      imageBuffer = Buffer.from(await response.arrayBuffer());
    }

    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: `image/${settings.format.toLowerCase()}`,
        metadata: {
          renderId,
          projectId,
          promptHash: generatedPrompt.hash,
        },
      },
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;

    // Create proper thumbnail
    const thumbnailBuffer = await ImageProcessor.createThumbnail(imageBuffer);
    const thumbnailFile = bucket.file(thumbnailFileName);
    await thumbnailFile.save(thumbnailBuffer, {
      metadata: {
        contentType: 'image/webp',
      },
    });
    await thumbnailFile.makePublic();
    const thumbnailUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${thumbnailFileName}`;

    await job.updateProgress(95);

    await supabase
      .from('renders')
      .update({
        status: 'completed',
        qualityStatus: qualityResult.passed ? 'auto_approved' : 'pending_review',
        imageUrl: publicUrl,
        thumbnailUrl,
        metadata: {
          ...result.metadata,
          quality: qualityResult.score,
          perceptualHash: qualityResult.metadata.perceptualHash,
        },
        completedAt: new Date().toISOString(),
      })
      .eq('id', renderId);

    // Track usage for billing
    const creditCost = getCreditCost(settings);
    await supabase.from('usage_records').insert({
      organization_id: organizationId,
      record_type: 'render',
      quantity: 1,
      unit_amount: creditCost,
      total_amount: creditCost,
      description: `Render completed: ${settings.resolution} @ ${settings.quality || 'high'} quality`,
      metadata: {
        render_id: renderId,
        project_id: projectId,
        resolution: settings.resolution,
        quality: settings.quality,
        format: settings.format,
        provider: settings.provider,
      },
    });

    await job.updateProgress(100);
    
    const processingTime = Date.now() - startTime;
    
    // Record successful job completion
    workerMetrics.recordJobComplete({
      jobId: renderId,
      jobType: 'render.generate',
      duration: processingTime,
      success: true,
      metadata: {
        provider: providerType,
        resolution: settings.resolution,
        quality: settings.quality?.toString() || 'high',
        imageSize: imageBuffer.length,
        creditCost,
      },
    });
    
    // Finish transaction
    transaction.setStatus('ok');
    transaction.finish();

    return {
      renderId,
      imageUrl: publicUrl,
      thumbnailUrl,
      processingTime,
      promptHash: generatedPrompt.hash,
      metadata: {
        width,
        height,
        format: settings.format,
        fileSize: imageBuffer.length,
      },
    };
  } catch (error) {
    logger.error(`Error processing render ${renderId}:`, error);

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('renders')
      .update({
        status: 'failed',
        qualityStatus: 'rejected',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
      })
      .eq('id', renderId);

    // Refund credits on failure (except for insufficient credits error)
    if (error instanceof Error && error.message !== 'Insufficient credits') {
      const creditCost = getCreditCost(settings);
      await supabase.rpc('refund_credits', {
        p_organization_id: organizationId,
        p_user_id: userId,
        p_render_id: renderId,
        p_amount: creditCost,
        p_reason: `Render failed: ${error.message}`,
      });
    }

    // Check for failure patterns after updating the render status
    if (failureDetectionService) {
      await failureDetectionService.checkForFailurePatterns();
    }
    
    // Record failed job
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
    
    // Finish transaction with error
    transaction.setStatus('internal_error');
    transaction.finish();

    throw error;
  }
}

function mapQualityLevel(quality?: number): 'low' | 'medium' | 'high' | 'ultra' {
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

function getCreditCost(settings: any): number {
  // Base cost is 1 credit
  let cost = 1;

  // Higher resolution costs more
  const [width, height] = settings.resolution.split('x').map(Number);
  const pixels = width * height;
  if (pixels > 1024 * 1024) {
    cost += 1; // 2 credits for > 1MP
  }
  if (pixels > 2048 * 2048) {
    cost += 2; // 4 credits for > 4MP
  }

  // Ultra quality costs extra
  if (settings.quality && settings.quality > 75) {
    cost += 1;
  }

  return cost;
}
