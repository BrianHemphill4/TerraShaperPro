"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptGenerator = void 0;
const node_crypto_1 = require("node:crypto");
const annotation_converter_1 = require("./annotation-converter");
const prompt_template_1 = require("./prompt-template");
const quality_modifier_1 = require("./quality-modifier");
const style_modifier_1 = require("./style-modifier");
class PromptGenerator {
    templateManager;
    annotationConverter;
    styleModifier;
    qualityModifier;
    promptCache;
    constructor() {
        this.templateManager = new prompt_template_1.PromptTemplateManager();
        this.annotationConverter = new annotation_converter_1.AnnotationConverter();
        this.styleModifier = new style_modifier_1.StyleModifier();
        this.qualityModifier = new quality_modifier_1.QualityModifier();
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
        return (0, node_crypto_1.createHash)('md5').update(JSON.stringify(key)).digest('hex');
    }
    resolveTemplate(context) {
        const style = context.userPreferences?.style || 'landscape';
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
        const style = context.userPreferences?.style || 'landscape';
        const mood = context.userPreferences?.mood;
        const colorScheme = context.userPreferences?.colorScheme;
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
        if (metadata?.location) {
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
        return (0, node_crypto_1.createHash)('sha256').update(prompt).digest('hex');
    }
    getAppliedModifiers(context) {
        const modifiers = [];
        if (context.userPreferences?.style) {
            modifiers.push(`style:${context.userPreferences.style}`);
        }
        if (context.userPreferences?.mood) {
            modifiers.push(`mood:${context.userPreferences.mood}`);
        }
        if (context.userPreferences?.colorScheme) {
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
exports.PromptGenerator = PromptGenerator;
