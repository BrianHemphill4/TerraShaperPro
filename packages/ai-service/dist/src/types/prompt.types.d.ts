import { z } from 'zod';
export declare const AnnotationSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["plant", "hardscape", "feature", "lighting", "water"]>;
    name: z.ZodString;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x?: number;
        y?: number;
    }, {
        x?: number;
        y?: number;
    }>;
    size: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width?: number;
        height?: number;
    }, {
        width?: number;
        height?: number;
    }>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: "plant" | "hardscape" | "feature" | "lighting" | "water";
    name?: string;
    position?: {
        x?: number;
        y?: number;
    };
    size?: {
        width?: number;
        height?: number;
    };
    attributes?: Record<string, any>;
}, {
    id?: string;
    type?: "plant" | "hardscape" | "feature" | "lighting" | "water";
    name?: string;
    position?: {
        x?: number;
        y?: number;
    };
    size?: {
        width?: number;
        height?: number;
    };
    attributes?: Record<string, any>;
}>;
export type Annotation = z.infer<typeof AnnotationSchema>;
export declare const PromptTemplateSchema: z.ZodObject<{
    base: z.ZodString;
    style: z.ZodOptional<z.ZodString>;
    quality: z.ZodOptional<z.ZodString>;
    lighting: z.ZodOptional<z.ZodString>;
    season: z.ZodOptional<z.ZodString>;
    timeOfDay: z.ZodOptional<z.ZodString>;
    weather: z.ZodOptional<z.ZodString>;
    cameraAngle: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lighting?: string;
    base?: string;
    style?: string;
    quality?: string;
    season?: string;
    timeOfDay?: string;
    weather?: string;
    cameraAngle?: string;
}, {
    lighting?: string;
    base?: string;
    style?: string;
    quality?: string;
    season?: string;
    timeOfDay?: string;
    weather?: string;
    cameraAngle?: string;
}>;
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;
export type PromptGenerationContext = {
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
};
//# sourceMappingURL=prompt.types.d.ts.map