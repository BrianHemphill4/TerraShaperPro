"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQualityService = void 0;
const ai_service_1 = require("@terrashaper/ai-service");
/**
 * Service responsible for quality control and review processes
 */
class RenderQualityService {
    constructor() {
        this.qualityChecker = new ai_service_1.QualityChecker();
        this.reviewQueueService = new ai_service_1.ReviewQueueService();
        this.failureDetectionService = new ai_service_1.FailureDetectionService();
    }
    /**
     * Perform comprehensive quality check on rendered image
     */
    async performQualityCheck(imageData, width, height, renderId, settings, attemptsMade) {
        // Run quality analysis
        const qualityResult = await this.qualityChecker.checkQuality(imageData, {
            minResolution: { width: width / 2, height: height / 2 },
            minQualityScore: 0.6,
        });
        // Check for duplicates
        const duplicateCheck = await this.reviewQueueService.checkForDuplicates(qualityResult.metadata.perceptualHash);
        if (duplicateCheck.isDuplicate) {
            throw new Error(`Duplicate render detected: Similar to render ${duplicateCheck.similarRenders[0].renderId} (${(duplicateCheck.similarRenders[0].similarity * 100).toFixed(1)}% similarity)`);
        }
        // Determine if manual review is required
        const forceManualReview = settings.forceManualReview ||
            attemptsMade > 1 ||
            (settings.quality && settings.quality > 75);
        const requiresManualReview = !qualityResult.passed || forceManualReview;
        // Add to review queue if needed
        if (requiresManualReview) {
            await this.reviewQueueService.addToReviewQueue(renderId, qualityResult.score, qualityResult.issues, {
                resolution: qualityResult.metadata.resolution,
                format: qualityResult.metadata.format,
                size: qualityResult.metadata.size,
                perceptualHash: qualityResult.metadata.perceptualHash,
                renderSettings: settings,
            }, forceManualReview);
            if (!qualityResult.passed) {
                throw new Error(`Quality check failed: ${qualityResult.issues.join(', ')}`);
            }
        }
        return { qualityResult, requiresManualReview };
    }
    /**
     * Check for failure patterns after render completion
     */
    async checkForFailurePatterns() {
        await this.failureDetectionService.checkForFailurePatterns();
    }
}
exports.RenderQualityService = RenderQualityService;
