"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderConfigSchema = exports.ImageGenerationOptionsSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod schema for validating image generation options.
 * Enforces resolution limits, quality settings, and optional parameters.
 */
exports.ImageGenerationOptionsSchema = zod_1.z.object({
    width: zod_1.z.number().min(256).max(2048).default(1024),
    height: zod_1.z.number().min(256).max(2048).default(1024),
    quality: zod_1.z.enum(['low', 'medium', 'high', 'ultra']).default('high'),
    style: zod_1.z.enum(['realistic', 'artistic', 'architectural', 'photographic']).default('realistic'),
    seed: zod_1.z.number().optional(),
    guidanceScale: zod_1.z.number().min(1).max(20).optional(),
    numInferenceSteps: zod_1.z.number().min(10).max(100).optional(),
});
/**
 * Zod schema for validating AI provider configuration.
 * Contains authentication and connection settings.
 */
exports.ProviderConfigSchema = zod_1.z.object({
    apiKey: zod_1.z.string(),
    projectId: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    baseUrl: zod_1.z.string().optional(),
    maxRetries: zod_1.z.number().default(3),
    timeout: zod_1.z.number().default(30000),
});
