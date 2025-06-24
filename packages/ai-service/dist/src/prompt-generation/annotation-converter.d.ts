import type { Annotation } from '../types/prompt.types';
export declare class AnnotationConverter {
    private plantDatabase;
    constructor();
    convertAnnotationsToDescription(annotations: Annotation[]): string;
    private groupAnnotationsByType;
    private describePlants;
    private groupPlantsByArea;
    private describeHardscape;
    private describeFeatures;
    private describeLighting;
    private describeWater;
    private initializePlantDatabase;
    enrichAnnotationWithPlantInfo(annotation: Annotation): Annotation;
}
//# sourceMappingURL=annotation-converter.d.ts.map