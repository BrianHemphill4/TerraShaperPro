import type { AIProvider, ProviderConfig } from '../types/ai-provider.interface';
import type { RenderProvider } from '../types/render.types';
import { ProviderFactory } from './provider-factory';

type ProviderStatus = {
  provider: RenderProvider;
  available: boolean;
  latency?: number;
  lastChecked: Date;
};

export class ProviderManager {
  private providers = new Map<RenderProvider, AIProvider>();
  private providerStatus = new Map<RenderProvider, ProviderStatus>();
  private primaryProvider: RenderProvider | null = null;
  private fallbackProviders: RenderProvider[] = [];

  async initialize(configs: Map<RenderProvider, ProviderConfig>): Promise<void> {
    const initPromises: Promise<void>[] = [];

    Array.from(configs.entries()).forEach(([type, config]) => {
      initPromises.push(this.initializeProvider(type, config));
    });

    await Promise.allSettled(initPromises);

    await this.updateProviderStatuses();
    this.selectPrimaryProvider();
  }

  private async initializeProvider(type: RenderProvider, config: ProviderConfig): Promise<void> {
    try {
      const provider = await ProviderFactory.createAndInitialize(type, config);
      this.providers.set(type, provider);
    } catch (error) {
      console.error(`Failed to initialize provider ${type}:`, error);
      this.providerStatus.set(type, {
        provider: type,
        available: false,
        lastChecked: new Date(),
      });
    }
  }

  async getProvider(preferredProvider?: RenderProvider): Promise<AIProvider> {
    if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
      const provider = this.providers.get(preferredProvider);
      if (provider) return provider;
    }

    if (this.primaryProvider && this.isProviderAvailable(this.primaryProvider)) {
      const provider = this.providers.get(this.primaryProvider);
      if (provider) return provider;
    }

    for (const fallbackProvider of this.fallbackProviders) {
      if (this.isProviderAvailable(fallbackProvider)) {
        const provider = this.providers.get(fallbackProvider);
        if (provider) return provider;
      }
    }

    throw new Error('No available providers');
  }

  private isProviderAvailable(type: RenderProvider): boolean {
    const status = this.providerStatus.get(type);
    return status?.available || false;
  }

  private async updateProviderStatuses(): Promise<void> {
    const statusPromises: Promise<void>[] = [];

    Array.from(this.providers.entries()).forEach(([type, provider]) => {
      statusPromises.push(this.updateProviderStatus(type, provider));
    });

    await Promise.allSettled(statusPromises);
  }

  private async updateProviderStatus(type: RenderProvider, provider: AIProvider): Promise<void> {
    try {
      const status = await provider.getStatus();
      this.providerStatus.set(type, {
        provider: type,
        available: status.available,
        latency: status.latency,
        lastChecked: new Date(),
      });
    } catch {
      this.providerStatus.set(type, {
        provider: type,
        available: false,
        lastChecked: new Date(),
      });
    }
  }

  private selectPrimaryProvider(): void {
    const availableProviders = Array.from(this.providerStatus.entries())
      .filter(([_, status]) => status.available)
      .sort((a, b) => (a[1].latency || Infinity) - (b[1].latency || Infinity));

    if (availableProviders.length > 0) {
      this.primaryProvider = availableProviders[0][0];
      this.fallbackProviders = availableProviders.slice(1).map(([type]) => type);
    }
  }

  async healthCheck(): Promise<Map<RenderProvider, ProviderStatus>> {
    await this.updateProviderStatuses();
    this.selectPrimaryProvider();
    return new Map(this.providerStatus);
  }

  getPrimaryProvider(): RenderProvider | null {
    return this.primaryProvider;
  }

  getFallbackProviders(): RenderProvider[] {
    return [...this.fallbackProviders];
  }
}
