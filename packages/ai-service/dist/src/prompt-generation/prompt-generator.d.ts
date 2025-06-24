import type { PromptGenerationContext } from '../types/prompt.types';
export type GeneratedPrompt = {
    prompt: string;
    hash: string;
    metadata: {
        template: string;
        annotationCount: number;
        modifiers: string[];
        timestamp: Date;
    };
};
export declare class PromptGenerator {
    private templateManager;
    private annotationConverter;
    private styleModifier;
    private qualityModifier;
    private promptCache;
    constructor();
    generatePrompt(context: PromptGenerationContext): GeneratedPrompt;
    private generateCacheKey;
    private resolveTemplate;
    private buildBasePrompt;
    private applyStyleModifiers;
    private applyQualityModifiers;
    private applyEnvironmentalFactors;
    private finalizePrompt;
    private hashPrompt;
    private getAppliedModifiers;
    clearCache(): void;
    getCacheSize(): number;
}
//# sourceMappingURL=prompt-generator.d.ts.map