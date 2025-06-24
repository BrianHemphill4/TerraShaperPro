export declare class StyleModifier {
    private styleModifiers;
    private moodModifiers;
    private colorSchemeModifiers;
    constructor();
    applyStyle(prompt: string, style: string): string;
    applyMood(prompt: string, mood: string): string;
    applyColorScheme(prompt: string, colorScheme: string): string;
    private initializeModifiers;
    addCustomStyle(name: string, modifiers: string[]): void;
    addCustomMood(name: string, modifiers: string[]): void;
    addCustomColorScheme(name: string, modifiers: string[]): void;
}
//# sourceMappingURL=style-modifier.d.ts.map