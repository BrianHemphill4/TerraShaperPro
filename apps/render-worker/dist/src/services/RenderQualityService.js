"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    performQualityCheck(imageData, width, height, renderId, settings, attemptsMade) {
        return __awaiter(this, void 0, void 0, function* () {
            // Run quality analysis
            const qualityResult = yield this.qualityChecker.checkQuality(imageData, {
                minResolution: { width: width / 2, height: height / 2 },
                minQualityScore: 0.6,
            });
            // Check for duplicates
            const duplicateCheck = yield this.reviewQueueService.checkForDuplicates(qualityResult.metadata.perceptualHash);
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
                yield this.reviewQueueService.addToReviewQueue(renderId, qualityResult.score, qualityResult.issues, {
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
        });
    }
    /**
     * Check for failure patterns after render completion
     */
    checkForFailurePatterns() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.failureDetectionService.checkForFailurePatterns();
        });
    }
}
exports.RenderQualityService = RenderQualityService;
