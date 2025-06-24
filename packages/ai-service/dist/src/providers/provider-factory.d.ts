import type { AIProvider, ProviderConfig } from '../types/ai-provider.interface';
import { RenderProvider } from '../types/render.types';
export declare class ProviderFactory {
    private static providers;
    static createProvider(type: RenderProvider): AIProvider;
    static createAndInitialize(type: RenderProvider, config: ProviderConfig): Promise<AIProvider>;
    static getSupportedProviders(): RenderProvider[];
    static registerProvider(type: RenderProvider, providerClass: new () => AIProvider): void;
}
//# sourceMappingURL=provider-factory.d.ts.map