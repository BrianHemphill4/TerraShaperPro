import type { PromptTemplate } from '../types/prompt.types';
export declare const defaultPromptTemplates: Record<string, PromptTemplate>;
export declare class PromptTemplateManager {
    private templates;
    constructor();
    getTemplate(name: string): PromptTemplate | undefined;
    addTemplate(name: string, template: PromptTemplate): void;
    getAllTemplates(): Map<string, PromptTemplate>;
    mergeTemplates(base: PromptTemplate, overrides: Partial<PromptTemplate>): PromptTemplate;
}
//# sourceMappingURL=prompt-template.d.ts.map