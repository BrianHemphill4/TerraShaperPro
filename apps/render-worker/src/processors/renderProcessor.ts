import { Job } from 'bullmq';
import type { RenderJobData, RenderJobResult } from '@terrashaper/queue';
import { 
  ProviderManager, 
  ProviderFactory, 
  PromptGenerator,
  QualityChecker,
  ReviewQueueService,
  FailureDetectionService,
  RenderProvider,
  ProviderConfig,
  ImageGenerationOptions,
  PromptGenerationContext,
  Annotation
} from '@terrashaper/ai-service';
import { createClient } from '@supabase/supabase-js';
import { Storage } from '@google-cloud/storage';

const providerManager = new ProviderManager();
const promptGenerator = new PromptGenerator();
const qualityChecker = new QualityChecker();
const storage = new Storage();

let reviewQueueService: ReviewQueueService;
let failureDetectionService: FailureDetectionService;
let initialized = false;

async function initializeProviders() {
  if (initialized) return;
  
  const configs = new Map<RenderProvider, ProviderConfig>([
    [RenderProvider.GOOGLE_IMAGEN, {
      apiKey: process.env.GOOGLE_API_KEY!,
      projectId: process.env.GOOGLE_CLOUD_PROJECT!,
      region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
      timeout: 60000,
      maxRetries: 3,
    }],
    [RenderProvider.OPENAI_GPT_IMAGE, {
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 60000,
      maxRetries: 3,
    }],
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
  const { renderId, projectId, prompt, settings, sourceImageUrl, annotations } = job.data;
  const startTime = Date.now();
  
  try {
    await job.updateProgress(5);
    console.log(`Starting render ${renderId} for project ${projectId}`);
    
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
    
    const generatedPrompt = promptGenerator.generatePrompt(promptContext);
    await job.updateProgress(20);
    
    const [width, height] = settings.resolution.split('x').map(Number);
    const generationOptions: ImageGenerationOptions = {
      width,
      height,
      quality: mapQualityLevel(settings.quality),
      style: 'realistic',
    };
    
    const providerType = settings.provider === 'google-imagen' 
      ? RenderProvider.GOOGLE_IMAGEN 
      : RenderProvider.OPENAI_GPT_IMAGE;
    
    const provider = await providerManager.getProvider(providerType);
    await job.updateProgress(30);
    
    const result = await provider.generateImage(
      generatedPrompt.prompt,
      generationOptions
    );
    await job.updateProgress(70);
    
    const qualityResult = await qualityChecker.checkQuality(
      result.imageBase64 || result.imageUrl,
      {
        minResolution: { width: width / 2, height: height / 2 },
        minQualityScore: 0.6,
      }
    );
    
    // Check for duplicate renders
    const duplicateCheck = await reviewQueueService.checkForDuplicates(
      qualityResult.metadata.perceptualHash!
    );
    
    if (duplicateCheck.isDuplicate) {
      throw new Error(`Duplicate render detected: Similar to render ${duplicateCheck.similarRenders[0].renderId} (${(duplicateCheck.similarRenders[0].similarity * 100).toFixed(1)}% similarity)`);
    }
    
    // Add to review queue if quality check failed or manual review required
    const forceManualReview = settings.forceManualReview || 
                            job.attemptsMade > 1 || 
                            settings.quality > 75;
    
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
    
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);
    const fileName = `renders/${projectId}/${renderId}.${settings.format.toLowerCase()}`;
    const thumbnailFileName = `renders/${projectId}/${renderId}_thumb.${settings.format.toLowerCase()}`;
    
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
    
    const thumbnailBuffer = imageBuffer;
    const thumbnailFile = bucket.file(thumbnailFileName);
    await thumbnailFile.save(thumbnailBuffer, {
      metadata: {
        contentType: `image/${settings.format.toLowerCase()}`,
      },
    });
    await thumbnailFile.makePublic();
    const thumbnailUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${thumbnailFileName}`;
    
    await job.updateProgress(95);
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
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
    
    await job.updateProgress(100);
    
    return {
      renderId,
      imageUrl: publicUrl,
      thumbnailUrl,
      processingTime: Date.now() - startTime,
      promptHash: generatedPrompt.hash,
      metadata: {
        width,
        height,
        format: settings.format,
        fileSize: imageBuffer.length,
      },
    };
  } catch (error) {
    console.error(`Error processing render ${renderId}:`, error);
    
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
    
    // Check for failure patterns after updating the render status
    if (failureDetectionService) {
      await failureDetectionService.checkForFailurePatterns();
    }
    
    throw error;
  }
}

function mapQualityLevel(quality?: number): 'low' | 'medium' | 'high' | 'ultra' {
  if (!quality) return 'high';
  if (quality <= 25) return 'low';
  if (quality <= 50) return 'medium';
  if (quality <= 75) return 'high';
  return 'ultra';
}