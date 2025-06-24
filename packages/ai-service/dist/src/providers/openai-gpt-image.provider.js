var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import OpenAI from 'openai';
import { withRetry } from '../utils/retry';
export class OpenAIGPTImageProvider {
    constructor() {
        this.name = 'OpenAI DALL-E 3';
        this.openai = null;
        this.config = null;
    }
    initialize(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.openai = new OpenAI({
                apiKey: config.apiKey,
                baseURL: config.baseUrl,
                maxRetries: config.maxRetries,
                timeout: config.timeout,
            });
        });
    }
    generateImage(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, options = {
            width: 1024,
            height: 1024,
            style: 'realistic',
            quality: 'high',
        }) {
            if (!this.openai) {
                throw new Error('Provider not initialized');
            }
            const startTime = Date.now();
            try {
                const enhancedPrompt = this.enhancePrompt(prompt, options);
                const response = yield withRetry(() => this.openai.images.generate({
                    model: 'dall-e-3',
                    prompt: enhancedPrompt,
                    n: 1,
                    size: this.getSize(options.width || 1024, options.height || 1024),
                    quality: this.mapQuality(options.quality || 'high'),
                    style: this.mapStyle(options.style || 'realistic'),
                }), {
                    maxAttempts: 3,
                    initialDelay: 2000,
                    shouldRetry: (error) => {
                        if (error instanceof OpenAI.APIError) {
                            return (error.status === 429 || // Rate limit
                                error.status === 500 || // Server error
                                error.status === 502 || // Bad gateway
                                error.status === 503 // Service unavailable
                            );
                        }
                        return false;
                    },
                });
                if (!response.data || response.data.length === 0) {
                    throw new Error('No images generated');
                }
                const image = response.data[0];
                const duration = Date.now() - startTime;
                return {
                    imageUrl: image.url || '',
                    imageBase64: image.b64_json,
                    metadata: {
                        provider: this.name,
                        model: 'dall-e-3',
                        prompt: enhancedPrompt,
                        timestamp: new Date(),
                        duration,
                        cost: yield this.estimateCost(options),
                    },
                };
            }
            catch (error) {
                if (error instanceof OpenAI.APIError) {
                    throw new TypeError(`OpenAI API error: ${error.message}`);
                }
                throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    validatePrompt(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!prompt || prompt.trim().length === 0) {
                return false;
            }
            if (prompt.length > 4000) {
                return false;
            }
            return true;
        });
    }
    estimateCost(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const qualityCost = {
                low: 0.02,
                medium: 0.03,
                high: 0.04,
                ultra: 0.04,
            };
            const sizeCost = {
                '1024x1024': 1,
                '1792x1024': 1.5,
                '1024x1792': 1.5,
            };
            const quality = options.quality || 'high';
            const size = this.getSize(options.width || 1024, options.height || 1024);
            return qualityCost[quality] * (sizeCost[size] || 1);
        });
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.openai) {
                return { available: false };
            }
            try {
                const startTime = Date.now();
                const models = yield this.openai.models.list();
                const dalleAvailable = models.data.some((model) => model.id.includes('dall-e'));
                const latency = Date.now() - startTime;
                return {
                    available: dalleAvailable,
                    latency,
                };
            }
            catch (_a) {
                return { available: false };
            }
        });
    }
    getSize(width, height) {
        const ratio = width / height;
        if (ratio > 1.5)
            return '1792x1024';
        if (ratio < 0.66)
            return '1024x1792';
        return '1024x1024';
    }
    mapQuality(quality) {
        return quality === 'low' || quality === 'medium' ? 'standard' : 'hd';
    }
    mapStyle(style) {
        return style === 'realistic' || style === 'photographic' ? 'natural' : 'vivid';
    }
    enhancePrompt(prompt, options) {
        const styleEnhancements = {
            realistic: 'photorealistic, high detail, natural lighting',
            artistic: 'artistic interpretation, creative style, vibrant colors',
            architectural: 'architectural visualization, clean lines, professional rendering',
            photographic: 'professional photography, depth of field, composition',
        };
        const qualityEnhancements = {
            low: 'simple, basic',
            medium: 'detailed, clear',
            high: 'highly detailed, sharp, professional quality',
            ultra: 'ultra detailed, masterpiece, best quality, sharp focus',
        };
        const style = options.style || 'realistic';
        const quality = options.quality || 'high';
        return `${prompt}, ${styleEnhancements[style]}, ${qualityEnhancements[quality]}`;
    }
}
