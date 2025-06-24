import type { AIProvider, GenerationResult, ImageGenerationOptions, ProviderConfig } from '../types/ai-provider.interface';
export declare class GoogleImagenProvider implements AIProvider {
    name: string;
    private vertexAI;
    private config;
    initialize(config: ProviderConfig): Promise<void>;
    generateImage(prompt: string, _options?: ImageGenerationOptions): Promise<GenerationResult>;
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
    private getAspectRatio;
    private getNegativePrompt;
}
//# sourceMappingURL=google-imagen.provider.d.ts.map