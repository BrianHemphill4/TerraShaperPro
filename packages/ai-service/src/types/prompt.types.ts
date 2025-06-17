import { z } from 'zod';

export const AnnotationSchema = z.object({
  id: z.string(),
  type: z.enum(['plant', 'hardscape', 'feature', 'lighting', 'water']),
  name: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  attributes: z.record(z.string(), z.any()).optional(),
});

export type Annotation = z.infer<typeof AnnotationSchema>;

export const PromptTemplateSchema = z.object({
  base: z.string(),
  style: z.string().optional(),
  quality: z.string().optional(),
  lighting: z.string().optional(),
  season: z.string().optional(),
  timeOfDay: z.string().optional(),
  weather: z.string().optional(),
  cameraAngle: z.string().optional(),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

export interface PromptGenerationContext {
  annotations: Annotation[];
  template: PromptTemplate;
  userPreferences?: {
    style?: string;
    mood?: string;
    colorScheme?: string;
  };
  projectMetadata?: {
    location?: string;
    climate?: string;
    propertyType?: string;
  };
}