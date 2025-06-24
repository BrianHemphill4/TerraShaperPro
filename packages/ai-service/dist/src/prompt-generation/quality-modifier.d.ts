export declare class QualityModifier {
    private qualityPresets;
    private technicalSpecs;
    constructor();
    applyQuality(prompt: string, quality: string): string;
    applyTechnicalSpecs(prompt: string): string;
    private initializePresets;
    addCustomQualityPreset(name: string, modifiers: string[]): void;
    setTechnicalSpecs(specs: string[]): void;
    getQualityPresets(): string[];
}
//# sourceMappingURL=quality-modifier.d.ts.map