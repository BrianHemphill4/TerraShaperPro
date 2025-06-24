var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RenderProvider } from '../types/render.types';
import { GoogleImagenProvider } from './google-imagen.provider';
import { OpenAIGPTImageProvider } from './openai-gpt-image.provider';
export class ProviderFactory {
    static createProvider(type) {
        const ProviderClass = this.providers.get(type);
        if (!ProviderClass) {
            throw new Error(`Unknown provider type: ${type}`);
        }
        return new ProviderClass();
    }
    static createAndInitialize(type, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this.createProvider(type);
            yield provider.initialize(config);
            return provider;
        });
    }
    static getSupportedProviders() {
        return Array.from(this.providers.keys());
    }
    static registerProvider(type, providerClass) {
        this.providers.set(type, providerClass);
    }
}
ProviderFactory.providers = new Map([
    [RenderProvider.GOOGLE_IMAGEN, GoogleImagenProvider],
    [RenderProvider.OPENAI_GPT_IMAGE, OpenAIGPTImageProvider],
]);
