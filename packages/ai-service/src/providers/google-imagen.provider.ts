import { VertexAI } from '@google-cloud/aiplatform';
import { 
  AIProvider, 
  ProviderConfig, 
  ImageGenerationOptions, 
  GenerationResult 
} from '../types/ai-provider.interface';
import { withRetry } from '../utils/retry';

export class GoogleImagenProvider implements AIProvider {
  name = 'Google Imagen 4 Ultra';
  private vertexAI: VertexAI | null = null;
  private config: ProviderConfig | null = null;

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;
    
    if (!config.projectId) {
      throw new Error('Google Cloud project ID is required');
    }

    this.vertexAI = new VertexAI({
      project: config.projectId,
      location: config.region || 'us-central1',
      apiEndpoint: config.baseUrl,
    });
  }

  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<GenerationResult> {
    if (!this.vertexAI) {
      throw new Error('Provider not initialized');
    }

    const startTime = Date.now();

    try {
      const model = 'imagen-4-ultra';
      const imageGenModel = this.vertexAI.preview.getGenerativeModel({
        model,
      });

      const request = {
        prompt,
        numberOfImages: 1,
        aspectRatio: this.getAspectRatio(options.width || 1024, options.height || 1024),
        negativePrompt: this.getNegativePrompt(options.style || 'realistic'),
        personGeneration: 'dont_allow',
        addWatermark: false,
        seed: options.seed,
      };

      const response = await withRetry(
        () => imageGenModel.generateImages(request),
        {
          maxAttempts: 3,
          initialDelay: 2000,
          shouldRetry: (error) => {
            const message = error.message.toLowerCase();
            return (
              message.includes('rate limit') ||
              message.includes('quota') ||
              message.includes('timeout') ||
              message.includes('unavailable')
            );
          },
        }
      );
      
      if (!response.images || response.images.length === 0) {
        throw new Error('No images generated');
      }

      const image = response.images[0];
      const duration = Date.now() - startTime;

      return {
        imageUrl: image.uri || '',
        imageBase64: image.bytesBase64Encoded,
        metadata: {
          provider: this.name,
          model,
          prompt,
          timestamp: new Date(),
          duration,
          cost: await this.estimateCost(options),
        },
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validatePrompt(prompt: string): Promise<boolean> {
    if (!prompt || prompt.trim().length === 0) {
      return false;
    }

    if (prompt.length > 2000) {
      return false;
    }

    const bannedTerms = [
      'nsfw', 'nude', 'violence', 'gore', 'hate',
    ];

    const lowerPrompt = prompt.toLowerCase();
    return !bannedTerms.some(term => lowerPrompt.includes(term));
  }

  async estimateCost(options: ImageGenerationOptions): Promise<number> {
    const baseCost = 0.02;
    
    const qualityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      ultra: 2,
    };

    const resolutionMultiplier = 
      ((options.width || 1024) * (options.height || 1024)) / (1024 * 1024);

    return baseCost * qualityMultiplier[options.quality || 'high'] * resolutionMultiplier;
  }

  async getStatus(): Promise<{
    available: boolean;
    latency?: number;
    quota?: { used: number; total: number };
  }> {
    if (!this.vertexAI) {
      return { available: false };
    }

    try {
      const startTime = Date.now();
      await this.validatePrompt('test');
      const latency = Date.now() - startTime;

      return {
        available: true,
        latency,
        quota: {
          used: 0,
          total: 50000,
        },
      };
    } catch {
      return { available: false };
    }
  }

  private getAspectRatio(width: number, height: number): string {
    const ratio = width / height;
    
    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 3/4) < 0.1) return '3:4';
    
    return '1:1';
  }

  private getNegativePrompt(style: string): string {
    const baseNegative = 'blurry, low quality, distorted, deformed';
    
    const styleNegatives: Record<string, string> = {
      realistic: 'cartoon, anime, illustration, painting',
      artistic: 'photorealistic, photo',
      architectural: 'people, characters, animals',
      photographic: 'illustration, drawing, painting, cartoon',
    };

    return `${baseNegative}, ${styleNegatives[style] || ''}`;
  }
}