var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProviderFactory } from './provider-factory';
export class ProviderManager {
    constructor() {
        this.providers = new Map();
        this.providerStatus = new Map();
        this.primaryProvider = null;
        this.fallbackProviders = [];
    }
    initialize(configs) {
        return __awaiter(this, void 0, void 0, function* () {
            const initPromises = [];
            Array.from(configs.entries()).forEach(([type, config]) => {
                initPromises.push(this.initializeProvider(type, config));
            });
            yield Promise.allSettled(initPromises);
            yield this.updateProviderStatuses();
            this.selectPrimaryProvider();
        });
    }
    initializeProvider(type, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = yield ProviderFactory.createAndInitialize(type, config);
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
        });
    }
    getProvider(preferredProvider) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    isProviderAvailable(type) {
        const status = this.providerStatus.get(type);
        return (status === null || status === void 0 ? void 0 : status.available) || false;
    }
    updateProviderStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            const statusPromises = [];
            Array.from(this.providers.entries()).forEach(([type, provider]) => {
                statusPromises.push(this.updateProviderStatus(type, provider));
            });
            yield Promise.allSettled(statusPromises);
        });
    }
    updateProviderStatus(type, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield provider.getStatus();
                this.providerStatus.set(type, {
                    provider: type,
                    available: status.available,
                    latency: status.latency,
                    lastChecked: new Date(),
                });
            }
            catch (_a) {
                this.providerStatus.set(type, {
                    provider: type,
                    available: false,
                    lastChecked: new Date(),
                });
            }
        });
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
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateProviderStatuses();
            this.selectPrimaryProvider();
            return new Map(this.providerStatus);
        });
    }
    getPrimaryProvider() {
        return this.primaryProvider;
    }
    getFallbackProviders() {
        return [...this.fallbackProviders];
    }
}
