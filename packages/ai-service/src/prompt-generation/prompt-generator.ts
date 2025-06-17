import { createHash } from 'crypto';
import { 
  PromptGenerationContext, 
  PromptTemplate,
  Annotation 
} from '../types/prompt.types';
import { PromptTemplateManager } from './prompt-template';
import { AnnotationConverter } from './annotation-converter';
import { StyleModifier } from './style-modifier';
import { QualityModifier } from './quality-modifier';

export interface GeneratedPrompt {
  prompt: string;
  hash: string;
  metadata: {
    template: string;
    annotationCount: number;
    modifiers: string[];
    timestamp: Date;
  };
}

export class PromptGenerator {
  private templateManager: PromptTemplateManager;
  private annotationConverter: AnnotationConverter;
  private styleModifier: StyleModifier;
  private qualityModifier: QualityModifier;
  private promptCache: Map<string, GeneratedPrompt>;

  constructor() {
    this.templateManager = new PromptTemplateManager();
    this.annotationConverter = new AnnotationConverter();
    this.styleModifier = new StyleModifier();
    this.qualityModifier = new QualityModifier();
    this.promptCache = new Map();
  }

  generatePrompt(context: PromptGenerationContext): GeneratedPrompt {
    const cacheKey = this.generateCacheKey(context);
    
    const cached = this.promptCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const enrichedAnnotations = context.annotations.map(annotation => 
      this.annotationConverter.enrichAnnotationWithPlantInfo(annotation)
    );

    const annotationDescription = this.annotationConverter.convertAnnotationsToDescription(
      enrichedAnnotations
    );

    const template = this.resolveTemplate(context);
    
    let prompt = this.buildBasePrompt(template, annotationDescription);
    
    prompt = this.applyStyleModifiers(prompt, context);
    
    prompt = this.applyQualityModifiers(prompt, template);
    
    prompt = this.applyEnvironmentalFactors(prompt, context);
    
    prompt = this.finalizePrompt(prompt);

    const hash = this.hashPrompt(prompt);

    const generatedPrompt: GeneratedPrompt = {
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

  private generateCacheKey(context: PromptGenerationContext): string {
    const key = {
      annotations: context.annotations.map(a => ({
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

  private resolveTemplate(context: PromptGenerationContext): PromptTemplate {
    const style = context.userPreferences?.style || 'landscape';
    const baseTemplate = this.templateManager.getTemplate(style) || 
                        this.templateManager.getTemplate('landscape')!;

    return this.templateManager.mergeTemplates(baseTemplate, context.template);
  }

  private buildBasePrompt(template: PromptTemplate, annotationDescription: string): string {
    const parts = [
      template.base,
      annotationDescription,
    ];

    if (template.style) {
      parts.push(`rendered in ${template.style}`);
    }

    return parts.join(' ');
  }

  private applyStyleModifiers(prompt: string, context: PromptGenerationContext): string {
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

  private applyQualityModifiers(prompt: string, template: PromptTemplate): string {
    if (template.quality) {
      prompt = this.qualityModifier.applyQuality(prompt, template.quality);
    }

    prompt = this.qualityModifier.applyTechnicalSpecs(prompt);

    return prompt;
  }

  private applyEnvironmentalFactors(prompt: string, context: PromptGenerationContext): string {
    const template = context.template;
    const metadata = context.projectMetadata;

    const factors: string[] = [];

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

  private finalizePrompt(prompt: string): string {
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

  private hashPrompt(prompt: string): string {
    return createHash('sha256').update(prompt).digest('hex');
  }

  private getAppliedModifiers(context: PromptGenerationContext): string[] {
    const modifiers: string[] = [];

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

  clearCache(): void {
    this.promptCache.clear();
  }

  getCacheSize(): number {
    return this.promptCache.size;
  }
}