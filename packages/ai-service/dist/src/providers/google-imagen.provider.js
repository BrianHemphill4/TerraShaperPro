"use strict";
// Temporarily disabled - need to update Google Cloud AI Platform SDK usage
// import { VertexAI } from '@google-cloud/aiplatform';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleImagenProvider = void 0;
class GoogleImagenProvider {
    name = 'Google Imagen 4 Ultra';
    vertexAI = null;
    config = null;
    async initialize(config) {
        this.config = config;
        if (!config.projectId) {
            throw new Error('Google Cloud project ID is required');
        }
        // TODO: Update to use correct Google Cloud AI Platform SDK
        throw new Error('Google Imagen provider temporarily disabled - SDK update needed');
    }
    async generateImage(prompt, _options = {
        width: 1024,
        height: 1024,
        style: 'realistic',
        quality: 'high',
    }) {
        throw new Error('Google Imagen provider temporarily disabled - SDK update needed');
    }
    async validatePrompt(prompt) {
        if (!prompt || prompt.trim().length === 0) {
            return false;
        }
        if (prompt.length > 2000) {
            return false;
        }
        const bannedTerms = ['nsfw', 'nude', 'violence', 'gore', 'hate'];
        const lowerPrompt = prompt.toLowerCase();
        return !bannedTerms.some((term) => lowerPrompt.includes(term));
    }
    async estimateCost(options) {
        const baseCost = 0.02;
        const qualityMultiplier = {
            low: 0.5,
            medium: 1,
            high: 1.5,
            ultra: 2,
        };
        const resolutionMultiplier = ((options.width || 1024) * (options.height || 1024)) / (1024 * 1024);
        return baseCost * qualityMultiplier[options.quality || 'high'] * resolutionMultiplier;
    }
    async getStatus() {
        return { available: false };
    }
    getAspectRatio(width, height) {
        const ratio = width / height;
        if (Math.abs(ratio - 1) < 0.1)
            return '1:1';
        if (Math.abs(ratio - 16 / 9) < 0.1)
            return '16:9';
        if (Math.abs(ratio - 9 / 16) < 0.1)
            return '9:16';
        if (Math.abs(ratio - 4 / 3) < 0.1)
            return '4:3';
        if (Math.abs(ratio - 3 / 4) < 0.1)
            return '3:4';
        return '1:1';
    }
    getNegativePrompt(style) {
        const baseNegative = 'blurry, low quality, distorted, deformed';
        const styleNegatives = {
            realistic: 'cartoon, anime, illustration, painting',
            artistic: 'photorealistic, photo',
            architectural: 'people, characters, animals',
            photographic: 'illustration, drawing, painting, cartoon',
        };
        return `${baseNegative}, ${styleNegatives[style] || ''}`;
    }
}
exports.GoogleImagenProvider = GoogleImagenProvider;
