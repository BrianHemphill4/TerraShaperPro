export class StyleModifier {
  private styleModifiers: Map<string, string[]> = new Map();
  private moodModifiers: Map<string, string[]> = new Map();
  private colorSchemeModifiers: Map<string, string[]> = new Map();

  constructor() {
    this.initializeModifiers();
  }

  applyStyle(prompt: string, style: string): string {
    const modifiers = this.styleModifiers.get(style) || [];
    if (modifiers.length === 0) return prompt;

    return `${prompt}, ${modifiers.join(', ')}`;
  }

  applyMood(prompt: string, mood: string): string {
    const modifiers = this.moodModifiers.get(mood) || [];
    if (modifiers.length === 0) return prompt;

    return `${prompt}, ${modifiers.join(', ')}`;
  }

  applyColorScheme(prompt: string, colorScheme: string): string {
    const modifiers = this.colorSchemeModifiers.get(colorScheme) || [];
    if (modifiers.length === 0) return prompt;

    return `${prompt}, ${modifiers.join(', ')}`;
  }

  private initializeModifiers(): void {
    this.styleModifiers = new Map([
      ['modern', [
        'clean lines',
        'contemporary design',
        'minimalist aesthetic',
        'geometric shapes',
        'sophisticated palette',
      ]],
      ['traditional', [
        'classic design elements',
        'timeless appeal',
        'formal arrangement',
        'symmetrical layout',
        'established style',
      ]],
      ['rustic', [
        'natural materials',
        'weathered textures',
        'organic forms',
        'countryside charm',
        'informal arrangement',
      ]],
      ['tropical', [
        'lush vegetation',
        'exotic plants',
        'vibrant colors',
        'layered canopy',
        'paradise atmosphere',
      ]],
      ['mediterranean', [
        'warm earth tones',
        'drought-tolerant plants',
        'terracotta elements',
        'gravel pathways',
        'sun-drenched atmosphere',
      ]],
      ['zen', [
        'peaceful composition',
        'balanced elements',
        'contemplative spaces',
        'natural harmony',
        'subtle beauty',
      ]],
    ]);

    this.moodModifiers = new Map([
      ['serene', [
        'peaceful atmosphere',
        'calming presence',
        'tranquil setting',
        'gentle transitions',
      ]],
      ['vibrant', [
        'energetic composition',
        'dynamic elements',
        'bold contrasts',
        'lively atmosphere',
      ]],
      ['romantic', [
        'soft lighting',
        'dreamy atmosphere',
        'intimate spaces',
        'enchanting details',
      ]],
      ['dramatic', [
        'strong contrasts',
        'bold statements',
        'striking features',
        'theatrical lighting',
      ]],
      ['welcoming', [
        'inviting spaces',
        'warm atmosphere',
        'comfortable settings',
        'friendly approach',
      ]],
    ]);

    this.colorSchemeModifiers = new Map([
      ['monochromatic', [
        'single color palette',
        'tonal variations',
        'subtle gradations',
        'unified scheme',
      ]],
      ['complementary', [
        'contrasting colors',
        'vibrant combinations',
        'balanced opposites',
        'dynamic palette',
      ]],
      ['analogous', [
        'harmonious colors',
        'flowing transitions',
        'natural progression',
        'cohesive palette',
      ]],
      ['warm', [
        'warm color tones',
        'reds oranges yellows',
        'inviting warmth',
        'sunset colors',
      ]],
      ['cool', [
        'cool color tones',
        'blues greens purples',
        'refreshing palette',
        'calming colors',
      ]],
      ['neutral', [
        'neutral tones',
        'earthy colors',
        'natural palette',
        'understated elegance',
      ]],
    ]);
  }

  addCustomStyle(name: string, modifiers: string[]): void {
    this.styleModifiers.set(name, modifiers);
  }

  addCustomMood(name: string, modifiers: string[]): void {
    this.moodModifiers.set(name, modifiers);
  }

  addCustomColorScheme(name: string, modifiers: string[]): void {
    this.colorSchemeModifiers.set(name, modifiers);
  }
}