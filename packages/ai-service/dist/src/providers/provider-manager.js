"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderManager = void 0;
const provider_factory_1 = require("./provider-factory");
class ProviderManager {
    providers = new Map();
    providerStatus = new Map();
    primaryProvider = null;
    fallbackProviders = [];
    async initialize(configs) {
        const initPromises = [];
        Array.from(configs.entries()).forEach(([type, config]) => {
            initPromises.push(this.initializeProvider(type, config));
        });
        await Promise.allSettled(initPromises);
        await this.updateProviderStatuses();
        this.selectPrimaryProvider();
    }
    async initializeProvider(type, config) {
        try {
            const provider = await provider_factory_1.ProviderFactory.createAndInitialize(type, config);
            this.providers.set(type, provider);
        }
        catch (error) {
            console.error(`Failed to initialize provider ${type}:`, error);
            this.providerStatus.set(type, {
                provider: type,
                available: false,
                lastChecked: new Date(),
            });
        }
    }
    async getProvider(preferredProvider) {
        if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
            const provider = this.providers.get(preferredProvider);
            if (provider)
                return provider;
        }
        if (this.primaryProvider && this.isProviderAvailable(this.primaryProvider)) {
            const provider = this.providers.get(this.primaryProvider);
            if (provider)
                return provider;
        }
        for (const fallbackProvider of this.fallbackProviders) {
            if (this.isProviderAvailable(fallbackProvider)) {
                const provider = this.providers.get(fallbackProvider);
                if (provider)
                    return provider;
            }
        }
        throw new Error('No available providers');
    }
    isProviderAvailable(type) {
        const status = this.providerStatus.get(type);
        return status?.available || false;
    }
    async updateProviderStatuses() {
        const statusPromises = [];
        Array.from(this.providers.entries()).forEach(([type, provider]) => {
            statusPromises.push(this.updateProviderStatus(type, provider));
        });
        await Promise.allSettled(statusPromises);
    }
    async updateProviderStatus(type, provider) {
        try {
            const status = await provider.getStatus();
            this.providerStatus.set(type, {
                provider: type,
                available: status.available,
                latency: status.latency,
                lastChecked: new Date(),
            });
        }
        catch {
            this.providerStatus.set(type, {
                provider: type,
                available: false,
                lastChecked: new Date(),
            });
        }
    }
    selectPrimaryProvider() {
        const availableProviders = Array.from(this.providerStatus.entries())
            .filter(([_, status]) => status.available)
            .sort((a, b) => (a[1].latency || Infinity) - (b[1].latency || Infinity));
        if (availableProviders.length > 0) {
            this.primaryProvider = availableProviders[0][0];
            this.fallbackProviders = availableProviders.slice(1).map(([type]) => type);
        }
    }
    async healthCheck() {
        await this.updateProviderStatuses();
        this.selectPrimaryProvider();
        return new Map(this.providerStatus);
    }
    getPrimaryProvider() {
        return this.primaryProvider;
    }
    getFallbackProviders() {
        return [...this.fallbackProviders];
    }
}
exports.ProviderManager = ProviderManager;
