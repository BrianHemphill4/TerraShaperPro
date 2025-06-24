var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { PerceptualHashService } from './phash.service';
export class QualityChecker {
    constructor() {
        this.phashService = new PerceptualHashService();
        this.defaultThresholds = {
            minResolution: { width: 512, height: 512 },
            maxFileSize: 10 * 1024 * 1024, // 10MB
            minQualityScore: 0.7,
            allowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
        };
    }
    checkQuality(imageData, customThresholds) {
        return __awaiter(this, void 0, void 0, function* () {
            const thresholds = Object.assign(Object.assign({}, this.defaultThresholds), customThresholds);
            const issues = [];
            let score = 1.0;
            const metadata = {};
            const format = this.detectFormat(imageData);
            metadata.format = format;
            if (!thresholds.allowedFormats.includes(format)) {
                issues.push(`Invalid format: ${format}. Allowed: ${thresholds.allowedFormats.join(', ')}`);
                score -= 0.3;
            }
            const size = this.getDataSize(imageData);
            metadata.size = size;
            if (size > thresholds.maxFileSize) {
                issues.push(`File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(thresholds.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
                score -= 0.2;
            }
            const resolution = yield this.getResolution(imageData);
            metadata.resolution = resolution;
            if (resolution.width < thresholds.minResolution.width ||
                resolution.height < thresholds.minResolution.height) {
                issues.push(`Resolution ${resolution.width}x${resolution.height} below minimum ${thresholds.minResolution.width}x${thresholds.minResolution.height}`);
                score -= 0.3;
            }
            const qualityScore = yield this.assessImageQuality(imageData);
            if (qualityScore < thresholds.minQualityScore) {
                issues.push(`Quality score ${qualityScore.toFixed(2)} below threshold ${thresholds.minQualityScore}`);
                score -= 0.2;
            }
            try {
                metadata.perceptualHash = yield this.phashService.generateHash(imageData);
            }
            catch (_a) {
                issues.push('Failed to generate perceptual hash');
            }
            score = Math.max(0, Math.min(1, score));
            return {
                passed: issues.length === 0 && score >= thresholds.minQualityScore,
                score,
                issues,
                metadata,
            };
        });
    }
    checkForDuplicates(imageData_1, existingHashes_1) {
        return __awaiter(this, arguments, void 0, function* (imageData, existingHashes, threshold = 0.95) {
            const hash = yield this.phashService.generateHash(imageData);
            for (const existingHash of existingHashes) {
                const isDuplicate = yield this.phashService.isDuplicate(hash, existingHash, threshold);
                if (isDuplicate) {
                    return { isDuplicate: true, similarTo: existingHash };
                }
            }
            return { isDuplicate: false };
        });
    }
    detectFormat(imageData) {
        const data = typeof imageData === 'string' ? Buffer.from(imageData, 'base64') : imageData;
        if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) {
            return 'png';
        }
        if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
            return 'jpeg';
        }
        if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46) {
            return 'webp';
        }
        return 'unknown';
    }
    getDataSize(imageData) {
        if (typeof imageData === 'string') {
            return Buffer.from(imageData, 'base64').length;
        }
        return imageData.length;
    }
    getResolution(imageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = typeof imageData === 'string' ? Buffer.from(imageData, 'base64') : imageData;
            const metadata = yield sharp(data).metadata();
            return { width: metadata.width || 0, height: metadata.height || 0 };
        });
    }
    assessImageQuality(imageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = typeof imageData === 'string' ? Buffer.from(imageData, 'base64') : imageData;
            let score = 1.0;
            try {
                const stats = yield sharp(data).stats();
                // Check for low contrast (flat images)
                const channelRange = stats.channels.map((c) => c.max - c.min);
                const avgRange = channelRange.reduce((a, b) => a + b, 0) / channelRange.length;
                if (avgRange < 50) {
                    score -= 0.3; // Very low contrast
                }
                else if (avgRange < 100) {
                    score -= 0.1; // Low contrast
                }
                // Check for noise/artifacts using standard deviation
                const avgStdDev = stats.channels.reduce((sum, c) => sum + c.stdev, 0) / stats.channels.length;
                if (avgStdDev > 80) {
                    score -= 0.2; // High noise
                }
                // Check entropy
                const entropy = this.calculateEntropy(data);
                if (entropy < 0.5) {
                    score -= 0.2;
                }
            }
            catch (_a) {
                // If sharp fails, fall back to basic check
                score -= 0.5;
            }
            return Math.max(0, Math.min(1, score));
        });
    }
    estimateCompressionRatio(data) {
        const uniqueBytes = new Set(data);
        return uniqueBytes.size / data.length;
    }
    calculateEntropy(data) {
        const frequencies = new Map();
        Array.from(data).forEach((byte) => {
            frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
        });
        let entropy = 0;
        const dataLength = data.length;
        Array.from(frequencies.values()).forEach((count) => {
            const probability = count / dataLength;
            entropy -= probability * Math.log2(probability);
        });
        return entropy / 8;
    }
}
