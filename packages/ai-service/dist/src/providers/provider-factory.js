"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const render_types_1 = require("../types/render.types");
const google_imagen_provider_1 = require("./google-imagen.provider");
const openai_gpt_image_provider_1 = require("./openai-gpt-image.provider");
class ProviderFactory {
    static providers = new Map([
        [render_types_1.RenderProvider.GOOGLE_IMAGEN, google_imagen_provider_1.GoogleImagenProvider],
        [render_types_1.RenderProvider.OPENAI_GPT_IMAGE, openai_gpt_image_provider_1.OpenAIGPTImageProvider],
    ]);
    static createProvider(type) {
        const ProviderClass = this.providers.get(type);
        if (!ProviderClass) {
            throw new Error(`Unknown provider type: ${type}`);
        }
        return new ProviderClass();
    }
    static async createAndInitialize(type, config) {
        const provider = this.createProvider(type);
        await provider.initialize(config);
        return provider;
    }
    static getSupportedProviders() {
        return Array.from(this.providers.keys());
    }
    static registerProvider(type, providerClass) {
        this.providers.set(type, providerClass);
    }
}
exports.ProviderFactory = ProviderFactory;
