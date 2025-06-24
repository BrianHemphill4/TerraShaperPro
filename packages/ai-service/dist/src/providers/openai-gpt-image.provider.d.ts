import type { AIProvider, GenerationResult, ImageGenerationOptions, ProviderConfig } from '../types/ai-provider.interface';
export declare class OpenAIGPTImageProvider implements AIProvider {
    name: string;
    private openai;
    private config;
    initialize(config: ProviderConfig): Promise<void>;
    generateImage(prompt: string, options?: ImageGenerationOptions): Promise<GenerationResult>;
    validatePrompt(prompt: string): Promise<boolean>;
    estimateCost(options: ImageGenerationOptions): Promise<number>;
    getStatus(): Promise<{
        available: boolean;
        latency?: number;
        quota?: {
            used: number;
            total: number;
        };
    }>;
    private getSize;
    private mapQuality;
    private mapStyle;
    private enhancePrompt;
}
//# sourceMappingURL=openai-gpt-image.provider.d.ts.map