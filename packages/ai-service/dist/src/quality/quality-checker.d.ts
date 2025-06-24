import { Buffer } from 'node:buffer';
export type QualityCheckResult = {
    passed: boolean;
    score: number;
    issues: string[];
    metadata: {
        resolution?: {
            width: number;
            height: number;
        };
        format?: string;
        size?: number;
        perceptualHash?: string;
    };
};
export type QualityThresholds = {
    minResolution: {
        width: number;
        height: number;
    };
    maxFileSize: number;
    minQualityScore: number;
    allowedFormats: string[];
};
export declare class QualityChecker {
    private phashService;
    private defaultThresholds;
    constructor();
    checkQuality(imageData: Buffer | string, customThresholds?: Partial<QualityThresholds>): Promise<QualityCheckResult>;
    checkForDuplicates(imageData: Buffer | string, existingHashes: string[], threshold?: number): Promise<{
        isDuplicate: boolean;
        similarTo?: string;
    }>;
    private detectFormat;
    private getDataSize;
    private getResolution;
    private assessImageQuality;
    private estimateCompressionRatio;
    private calculateEntropy;
}
//# sourceMappingURL=quality-checker.d.ts.map