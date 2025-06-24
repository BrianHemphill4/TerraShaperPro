import { Buffer } from 'node:buffer';
export declare class PerceptualHashService {
    private hashCache;
    constructor();
    generateHash(imageData: Buffer | string): Promise<string>;
    compareHashes(hash1: string, hash2: string): Promise<number>;
    isDuplicate(hash1: string, hash2: string, threshold?: number): Promise<boolean>;
    private simplifyImage;
    private discreteCosineTransform;
    private calculateHash;
    private calculateMedian;
    clearCache(): void;
}
//# sourceMappingURL=phash.service.d.ts.map