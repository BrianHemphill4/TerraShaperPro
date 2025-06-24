import { z } from 'zod';

/**
 * Zod schema for validating image generation options.
 * Enforces resolution limits, quality settings, and optional parameters.
 */
export const ImageGenerationOptionsSchema = z.object({
  width: z.number().min(256).max(2048).default(1024),
  height: z.number().min(256).max(2048).default(1024),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).default('high'),
  style: z.enum(['realistic', 'artistic', 'architectural', 'photographic']).default('realistic'),
  seed: z.number().optional(),
  guidanceScale: z.number().min(1).max(20).optional(),
  numInferenceSteps: z.number().min(10).max(100).optional(),
});

/**
 * Type definition for image generation options.
 * Derived from the ImageGenerationOptionsSchema.
 */
export type ImageGenerationOptions = z.infer<typeof ImageGenerationOptionsSchema>;

/**
 * Zod schema for validating AI provider configuration.
 * Contains authentication and connection settings.
 */
export const ProviderConfigSchema = z.object({
  apiKey: z.string(),
  projectId: z.string().optional(),
  region: z.string().optional(),
  baseUrl: z.string().optional(),
  maxRetries: z.number().default(3),
  timeout: z.number().default(30000),
});

/**
 * Type definition for AI provider configuration.
 * Derived from the ProviderConfigSchema.
 */
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

/**
 * Result returned from an AI image generation operation.
 * Contains the generated image and associated metadata.
 */
export type GenerationResult = {
  imageUrl: string;
  imageBase64?: string;
  metadata: {
    provider: string;
    model: string;
    prompt: string;
    timestamp: Date;
    duration: number;
    cost?: number;
  };
};

/**
 * Interface that all AI providers must implement.
 * Provides a standardized API for image generation across different providers.
 */
export type AIProvider = {
  name: string;

  initialize: (config: ProviderConfig) => Promise<void>;

  generateImage: (prompt: string, options?: ImageGenerationOptions) => Promise<GenerationResult>;

  validatePrompt: (prompt: string) => Promise<boolean>;

  estimateCost: (options: ImageGenerationOptions) => Promise<number>;

  getStatus: () => Promise<{
    available: boolean;
    latency?: number;
    quota?: {
      used: number;
      total: number;
    };
  }>;
};
