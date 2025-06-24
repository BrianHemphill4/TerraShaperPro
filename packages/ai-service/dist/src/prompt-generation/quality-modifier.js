export class QualityModifier {
    constructor() {
        this.qualityPresets = new Map();
        this.technicalSpecs = [];
        this.initializePresets();
    }
    applyQuality(prompt, quality) {
        const modifiers = this.qualityPresets.get(quality) || this.qualityPresets.get('high') || [];
        return `${prompt}, ${modifiers.join(', ')}`;
    }
    applyTechnicalSpecs(prompt) {
        return `${prompt}, ${this.technicalSpecs.join(', ')}`;
    }
    initializePresets() {
        this.qualityPresets = new Map([
            ['low', ['simple rendering', 'basic details', 'quick visualization']],
            ['medium', ['good quality rendering', 'clear details', 'balanced complexity']],
            [
                'high',
                [
                    'high quality rendering',
                    'fine details',
                    'professional visualization',
                    'photorealistic textures',
                ],
            ],
            [
                'ultra',
                [
                    'ultra high quality',
                    'extreme detail',
                    'masterpiece quality',
                    'photorealistic rendering',
                    'professional architectural visualization',
                    '8K resolution',
                    'ray-traced lighting',
                ],
            ],
        ]);
        this.technicalSpecs = [
            'proper perspective',
            'accurate scale',
            'realistic proportions',
            'natural lighting and shadows',
            'depth of field',
            'atmospheric perspective',
        ];
    }
    addCustomQualityPreset(name, modifiers) {
        this.qualityPresets.set(name, modifiers);
    }
    setTechnicalSpecs(specs) {
        this.technicalSpecs = specs;
    }
    getQualityPresets() {
        return Array.from(this.qualityPresets.keys());
    }
}
