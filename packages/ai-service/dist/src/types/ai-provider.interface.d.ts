import { z } from 'zod';
/**
 * Zod schema for validating image generation options.
 * Enforces resolution limits, quality settings, and optional parameters.
 */
export declare const ImageGenerationOptionsSchema: z.ZodObject<{
    width: z.ZodDefault<z.ZodNumber>;
    height: z.ZodDefault<z.ZodNumber>;
    quality: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "ultra"]>>;
    style: z.ZodDefault<z.ZodEnum<["realistic", "artistic", "architectural", "photographic"]>>;
    seed: z.ZodOptional<z.ZodNumber>;
    guidanceScale: z.ZodOptional<z.ZodNumber>;
    numInferenceSteps: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    width?: number;
    height?: number;
    style?: "realistic" | "artistic" | "architectural" | "photographic";
    quality?: "high" | "low" | "medium" | "ultra";
    seed?: number;
    guidanceScale?: number;
    numInferenceSteps?: number;
}, {
    width?: number;
    height?: number;
    style?: "realistic" | "artistic" | "architectural" | "photographic";
    quality?: "high" | "low" | "medium" | "ultra";
    seed?: number;
    guidanceScale?: number;
    numInferenceSteps?: number;
}>;
/**
 * Type definition for image generation options.
 * Derived from the ImageGenerationOptionsSchema.
 */
export type ImageGenerationOptions = z.infer<typeof ImageGenerationOptionsSchema>;
/**
 * Zod schema for validating AI provider configuration.
 * Contains authentication and connection settings.
 */
export declare const ProviderConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodOptional<z.ZodString>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiKey?: string;
    projectId?: string;
    region?: string;
    baseUrl?: string;
    maxRetries?: number;
    timeout?: number;
}, {
    apiKey?: string;
    projectId?: string;
    region?: string;
    baseUrl?: string;
    maxRetries?: number;
    timeout?: number;
}>;
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
//# sourceMappingURL=ai-provider.interface.d.ts.map