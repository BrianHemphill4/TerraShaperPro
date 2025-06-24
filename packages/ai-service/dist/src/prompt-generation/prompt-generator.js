import { createHash } from 'node:crypto';
import { AnnotationConverter } from './annotation-converter';
import { PromptTemplateManager } from './prompt-template';
import { QualityModifier } from './quality-modifier';
import { StyleModifier } from './style-modifier';
export class PromptGenerator {
    constructor() {
        this.templateManager = new PromptTemplateManager();
        this.annotationConverter = new AnnotationConverter();
        this.styleModifier = new StyleModifier();
        this.qualityModifier = new QualityModifier();
        this.promptCache = new Map();
    }
    generatePrompt(context) {
        const cacheKey = this.generateCacheKey(context);
        const cached = this.promptCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const enrichedAnnotations = context.annotations.map((annotation) => this.annotationConverter.enrichAnnotationWithPlantInfo(annotation));
        const annotationDescription = this.annotationConverter.convertAnnotationsToDescription(enrichedAnnotations);
        const template = this.resolveTemplate(context);
        let prompt = this.buildBasePrompt(template, annotationDescription);
        prompt = this.applyStyleModifiers(prompt, context);
        prompt = this.applyQualityModifiers(prompt, template);
        prompt = this.applyEnvironmentalFactors(prompt, context);
        prompt = this.finalizePrompt(prompt);
        const hash = this.hashPrompt(prompt);
        const generatedPrompt = {
            prompt,
            hash,
            metadata: {
                template: context.template.base,
                annotationCount: context.annotations.length,
                modifiers: this.getAppliedModifiers(context),
                timestamp: new Date(),
            },
        };
        this.promptCache.set(cacheKey, generatedPrompt);
        return generatedPrompt;
    }
    generateCacheKey(context) {
        const key = {
            annotations: context.annotations.map((a) => ({
                id: a.id,
                type: a.type,
                name: a.name,
                position: a.position,
            })),
            template: context.template.base,
            userPreferences: context.userPreferences,
            projectMetadata: context.projectMetadata,
        };
        return createHash('md5').update(JSON.stringify(key)).digest('hex');
    }
    resolveTemplate(context) {
        var _a;
        const style = ((_a = context.userPreferences) === null || _a === void 0 ? void 0 : _a.style) || 'landscape';
        const baseTemplate = this.templateManager.getTemplate(style) || this.templateManager.getTemplate('landscape');
        return this.templateManager.mergeTemplates(baseTemplate, context.template);
    }
    buildBasePrompt(template, annotationDescription) {
        const parts = [template.base, annotationDescription];
        if (template.style) {
            parts.push(`rendered in ${template.style}`);
        }
        return parts.join(' ');
    }
    applyStyleModifiers(prompt, context) {
        var _a, _b, _c;
        const style = ((_a = context.userPreferences) === null || _a === void 0 ? void 0 : _a.style) || 'landscape';
        const mood = (_b = context.userPreferences) === null || _b === void 0 ? void 0 : _b.mood;
        const colorScheme = (_c = context.userPreferences) === null || _c === void 0 ? void 0 : _c.colorScheme;
        prompt = this.styleModifier.applyStyle(prompt, style);
        if (mood) {
            prompt = this.styleModifier.applyMood(prompt, mood);
        }
        if (colorScheme) {
            prompt = this.styleModifier.applyColorScheme(prompt, colorScheme);
        }
        return prompt;
    }
    applyQualityModifiers(prompt, template) {
        if (template.quality) {
            prompt = this.qualityModifier.applyQuality(prompt, template.quality);
        }
        prompt = this.qualityModifier.applyTechnicalSpecs(prompt);
        return prompt;
    }
    applyEnvironmentalFactors(prompt, context) {
        const template = context.template;
        const metadata = context.projectMetadata;
        const factors = [];
        if (template.lighting) {
            factors.push(template.lighting);
        }
        if (template.season) {
            factors.push(`during ${template.season}`);
        }
        if (template.timeOfDay) {
            factors.push(`at ${template.timeOfDay}`);
        }
        if (template.weather) {
            factors.push(`with ${template.weather}`);
        }
        if (template.cameraAngle) {
            factors.push(`viewed from ${template.cameraAngle}`);
        }
        if (metadata === null || metadata === void 0 ? void 0 : metadata.location) {
            factors.push(`in ${metadata.location} climate`);
        }
        if (factors.length > 0) {
            prompt += `, ${factors.join(', ')}`;
        }
        return prompt;
    }
    finalizePrompt(prompt) {
        const negativePrompts = [
            'no text',
            'no watermarks',
            'no logos',
            'no people unless specifically requested',
            'no cartoon style',
            'no anime style',
        ];
        return `${prompt}. ${negativePrompts.join(', ')}`;
    }
    hashPrompt(prompt) {
        return createHash('sha256').update(prompt).digest('hex');
    }
    getAppliedModifiers(context) {
        var _a, _b, _c;
        const modifiers = [];
        if ((_a = context.userPreferences) === null || _a === void 0 ? void 0 : _a.style) {
            modifiers.push(`style:${context.userPreferences.style}`);
        }
        if ((_b = context.userPreferences) === null || _b === void 0 ? void 0 : _b.mood) {
            modifiers.push(`mood:${context.userPreferences.mood}`);
        }
        if ((_c = context.userPreferences) === null || _c === void 0 ? void 0 : _c.colorScheme) {
            modifiers.push(`color:${context.userPreferences.colorScheme}`);
        }
        if (context.template.quality) {
            modifiers.push(`quality:${context.template.quality}`);
        }
        return modifiers;
    }
    clearCache() {
        this.promptCache.clear();
    }
    getCacheSize() {
        return this.promptCache.size;
    }
}
