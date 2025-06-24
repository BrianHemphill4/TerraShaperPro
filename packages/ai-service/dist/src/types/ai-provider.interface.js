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
