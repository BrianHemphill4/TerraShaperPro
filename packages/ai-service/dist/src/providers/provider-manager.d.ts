import type { AIProvider, ProviderConfig } from '../types/ai-provider.interface';
import type { RenderProvider } from '../types/render.types';
type ProviderStatus = {
    provider: RenderProvider;
    available: boolean;
    latency?: number;
    lastChecked: Date;
};
export declare class ProviderManager {
    private providers;
    private providerStatus;
    private primaryProvider;
    private fallbackProviders;
    initialize(configs: Map<RenderProvider, ProviderConfig>): Promise<void>;
    private initializeProvider;
    getProvider(preferredProvider?: RenderProvider): Promise<AIProvider>;
    private isProviderAvailable;
    private updateProviderStatuses;
    private updateProviderStatus;
    private selectPrimaryProvider;
    healthCheck(): Promise<Map<RenderProvider, ProviderStatus>>;
    getPrimaryProvider(): RenderProvider | null;
    getFallbackProviders(): RenderProvider[];
}
export {};
//# sourceMappingURL=provider-manager.d.ts.map