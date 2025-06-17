import { AIProvider, ProviderConfig } from '../types/ai-provider.interface';
import { RenderProvider } from '../types/render.types';
import { GoogleImagenProvider } from './google-imagen.provider';
import { OpenAIGPTImageProvider } from './openai-gpt-image.provider';

export class ProviderFactory {
  private static providers = new Map<RenderProvider, new () => AIProvider>([
    [RenderProvider.GOOGLE_IMAGEN, GoogleImagenProvider],
    [RenderProvider.OPENAI_GPT_IMAGE, OpenAIGPTImageProvider],
  ]);

  static createProvider(type: RenderProvider): AIProvider {
    const ProviderClass = this.providers.get(type);
    
    if (!ProviderClass) {
      throw new Error(`Unknown provider type: ${type}`);
    }

    return new ProviderClass();
  }

  static async createAndInitialize(
    type: RenderProvider, 
    config: ProviderConfig
  ): Promise<AIProvider> {
    const provider = this.createProvider(type);
    await provider.initialize(config);
    return provider;
  }

  static getSupportedProviders(): RenderProvider[] {
    return Array.from(this.providers.keys());
  }

  static registerProvider(
    type: RenderProvider, 
    providerClass: new () => AIProvider
  ): void {
    this.providers.set(type, providerClass);
  }
}