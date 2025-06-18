export class QualityModifier {
  private qualityPresets: Map<string, string[]> = new Map();
  private technicalSpecs: string[] = [];

  constructor() {
    this.initializePresets();
  }

  applyQuality(prompt: string, quality: string): string {
    const modifiers = this.qualityPresets.get(quality) || 
                     this.qualityPresets.get('high') || [];
    
    return `${prompt}, ${modifiers.join(', ')}`;
  }

  applyTechnicalSpecs(prompt: string): string {
    return `${prompt}, ${this.technicalSpecs.join(', ')}`;
  }

  private initializePresets(): void {
    this.qualityPresets = new Map([
      ['low', [
        'simple rendering',
        'basic details',
        'quick visualization',
      ]],
      ['medium', [
        'good quality rendering',
        'clear details',
        'balanced complexity',
      ]],
      ['high', [
        'high quality rendering',
        'fine details',
        'professional visualization',
        'photorealistic textures',
      ]],
      ['ultra', [
        'ultra high quality',
        'extreme detail',
        'masterpiece quality',
        'photorealistic rendering',
        'professional architectural visualization',
        '8K resolution',
        'ray-traced lighting',
      ]],
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

  addCustomQualityPreset(name: string, modifiers: string[]): void {
    this.qualityPresets.set(name, modifiers);
  }

  setTechnicalSpecs(specs: string[]): void {
    this.technicalSpecs = specs;
  }

  getQualityPresets(): string[] {
    return Array.from(this.qualityPresets.keys());
  }
}