"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateSchema = exports.AnnotationSchema = void 0;
const zod_1 = require("zod");
exports.AnnotationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['plant', 'hardscape', 'feature', 'lighting', 'water']),
    name: zod_1.z.string(),
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
    }),
    size: zod_1.z.object({
        width: zod_1.z.number(),
        height: zod_1.z.number(),
    }),
    attributes: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.PromptTemplateSchema = zod_1.z.object({
    base: zod_1.z.string(),
    style: zod_1.z.string().optional(),
    quality: zod_1.z.string().optional(),
    lighting: zod_1.z.string().optional(),
    season: zod_1.z.string().optional(),
    timeOfDay: zod_1.z.string().optional(),
    weather: zod_1.z.string().optional(),
    cameraAngle: zod_1.z.string().optional(),
});
