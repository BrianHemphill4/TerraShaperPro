"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateManager = exports.defaultPromptTemplates = void 0;
exports.defaultPromptTemplates = {
    landscape: {
        base: 'A beautiful landscape design featuring',
        style: 'professional landscape architecture visualization',
        quality: 'high resolution, detailed, photorealistic',
        lighting: 'natural daylight, soft shadows',
        season: 'lush green spring',
        timeOfDay: 'golden hour',
        weather: 'clear sky',
        cameraAngle: 'elevated perspective at 45 degrees',
    },
    modern: {
        base: 'A modern contemporary landscape design with',
        style: 'sleek minimalist landscape architecture',
        quality: 'sharp details, architectural rendering quality',
        lighting: 'dramatic architectural lighting',
        season: 'evergreen plantings',
        timeOfDay: 'dusk with accent lighting',
        weather: 'clear conditions',
        cameraAngle: 'wide angle architectural view',
    },
    traditional: {
        base: 'A traditional garden landscape featuring',
        style: 'classic English garden style',
        quality: 'rich colors, detailed textures',
        lighting: 'soft morning light',
        season: 'blooming summer garden',
        timeOfDay: 'mid-morning',
        weather: 'partly cloudy',
        cameraAngle: 'garden perspective view',
    },
    xeriscape: {
        base: 'A water-wise xeriscape design featuring',
        style: 'drought-tolerant landscape design',
        quality: 'crisp details, natural textures',
        lighting: 'bright desert sunlight',
        season: 'year-round interest',
        timeOfDay: 'midday',
        weather: 'sunny and dry',
        cameraAngle: 'showcase view of the design',
    },
    japanese: {
        base: 'A serene Japanese-inspired garden with',
        style: 'zen garden aesthetic, minimalist design',
        quality: 'tranquil atmosphere, refined details',
        lighting: 'filtered light through trees',
        season: 'autumn colors',
        timeOfDay: 'early morning',
        weather: 'misty atmosphere',
        cameraAngle: 'contemplative viewing angle',
    },
};
class PromptTemplateManager {
    templates;
    constructor() {
        this.templates = new Map(Object.entries(exports.defaultPromptTemplates));
    }
    getTemplate(name) {
        return this.templates.get(name);
    }
    addTemplate(name, template) {
        this.templates.set(name, template);
    }
    getAllTemplates() {
        return new Map(this.templates);
    }
    mergeTemplates(base, overrides) {
        return {
            ...base,
            ...overrides,
        };
    }
}
exports.PromptTemplateManager = PromptTemplateManager;
