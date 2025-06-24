"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const zod_1 = require("zod");
// Replicate the render input schemas defined in render.router.ts
const renderSettingsSchema = zod_1.z.object({
    provider: zod_1.z.enum(['google-imagen', 'openai-gpt-image']),
    resolution: zod_1.z.enum(['1024x1024', '2048x2048', '4096x4096']),
    format: zod_1.z.enum(['PNG', 'JPEG']).default('PNG'),
    quality: zod_1.z.number().min(1).max(100).optional(),
});
const annotationSchema = zod_1.z.object({
    type: zod_1.z.enum(['mask', 'assetInstance', 'textLabel']),
    data: zod_1.z.any(),
});
const createRenderSchema = zod_1.z.object({
    projectId: zod_1.z.string(),
    sceneId: zod_1.z.string(),
    sourceImageUrl: zod_1.z.string().url(),
    maskImageUrl: zod_1.z.string().url().optional(),
    prompt: zod_1.z.object({
        system: zod_1.z.string(),
        user: zod_1.z.string(),
    }),
    annotations: zod_1.z.array(annotationSchema),
    settings: renderSettingsSchema,
});
(0, vitest_1.describe)('Render Router Logic Tests', () => {
    (0, vitest_1.describe)('Input Validation', () => {
        (0, vitest_1.it)('should validate create render input', () => {
            const validInput = {
                projectId: 'proj_123',
                sceneId: 'scene_123',
                sourceImageUrl: 'https://cdn.example.com/src.png',
                prompt: { system: 'You are a helpful assistant', user: 'Generate a garden design' },
                annotations: [{ type: 'mask', data: {} }],
                settings: {
                    provider: 'google-imagen',
                    resolution: '1024x1024',
                    format: 'PNG',
                    quality: 80,
                },
            };
            (0, vitest_1.expect)(() => createRenderSchema.parse(validInput)).not.toThrow();
            // Invalid provider
            (0, vitest_1.expect)(() => createRenderSchema.parse({
                ...validInput,
                settings: { ...validInput.settings, provider: 'invalid' },
            })).toThrow();
            // Missing annotations
            (0, vitest_1.expect)(() => createRenderSchema.parse({
                ...validInput,
                annotations: undefined,
            })).toThrow();
        });
        (0, vitest_1.it)('should apply default values', () => {
            const input = {
                projectId: '1',
                sceneId: '1',
                sourceImageUrl: 'https://example.com/img.png',
                prompt: { system: 'system', user: 'user' },
                annotations: [],
                settings: {
                    provider: 'openai-gpt-image',
                    resolution: '2048x2048',
                },
            };
            const parsed = createRenderSchema.parse(input);
            (0, vitest_1.expect)(parsed.settings.format).toBe('PNG');
        });
    });
    (0, vitest_1.describe)('Utility Functions', () => {
        (0, vitest_1.it)('should calculate render progress based on steps', () => {
            const calcProgress = (completed, total) => {
                return Math.round((completed / total) * 100);
            };
            (0, vitest_1.expect)(calcProgress(0, 10)).toBe(0);
            (0, vitest_1.expect)(calcProgress(5, 10)).toBe(50);
            (0, vitest_1.expect)(calcProgress(10, 10)).toBe(100);
        });
    });
});
