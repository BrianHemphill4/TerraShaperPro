"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIGPTImageProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const retry_1 = require("../utils/retry");
class OpenAIGPTImageProvider {
    name = 'OpenAI DALL-E 3';
    openai = null;
    config = null;
    async initialize(config) {
        this.config = config;
        this.openai = new openai_1.default({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
            maxRetries: config.maxRetries,
            timeout: config.timeout,
        });
    }
    async generateImage(prompt, options = {
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
            const response = await (0, retry_1.withRetry)(() => this.openai.images.generate({
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
                    if (error instanceof openai_1.default.APIError) {
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
                    cost: await this.estimateCost(options),
                },
            };
        }
        catch (error) {
            if (error instanceof openai_1.default.APIError) {
                throw new TypeError(`OpenAI API error: ${error.message}`);
            }
            throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async validatePrompt(prompt) {
        if (!prompt || prompt.trim().length === 0) {
            return false;
        }
        if (prompt.length > 4000) {
            return false;
        }
        return true;
    }
    async estimateCost(options) {
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
    }
    async getStatus() {
        if (!this.openai) {
            return { available: false };
        }
        try {
            const startTime = Date.now();
            const models = await this.openai.models.list();
            const dalleAvailable = models.data.some((model) => model.id.includes('dall-e'));
            const latency = Date.now() - startTime;
            return {
                available: dalleAvailable,
                latency,
            };
        }
        catch {
            return { available: false };
        }
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
exports.OpenAIGPTImageProvider = OpenAIGPTImageProvider;
