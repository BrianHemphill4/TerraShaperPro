import {
  FailureDetectionService,
  QualityChecker,
  ReviewQueueService,
} from '@terrashaper/ai-service';

/**
 * Service responsible for quality control and review processes
 */
export class RenderQualityService {
  private qualityChecker: QualityChecker;
  private reviewQueueService: ReviewQueueService;
  private failureDetectionService: FailureDetectionService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.qualityChecker = new QualityChecker();
    this.reviewQueueService = new ReviewQueueService(supabaseUrl, supabaseKey);
    this.failureDetectionService = new FailureDetectionService(supabaseUrl, supabaseKey);
  }

  /**
   * Perform comprehensive quality check on rendered image
   */
  async performQualityCheck(
    imageData: string,
    width: number,
    height: number,
    renderId: string,
    settings: any,
    attemptsMade: number
  ): Promise<{ qualityResult: any; requiresManualReview: boolean }> {
    // Run quality analysis
    const qualityResult = await this.qualityChecker.checkQuality(imageData, {
      minResolution: { width: width / 2, height: height / 2 },
      minQualityScore: 0.6,
    });

    // Check for duplicates
    const duplicateCheck = await this.reviewQueueService.checkForDuplicates(
      qualityResult.metadata.perceptualHash!
    );

    if (duplicateCheck.isDuplicate) {
      throw new Error(
        `Duplicate render detected: Similar to render ${duplicateCheck.similarRenders[0].renderId} (${(duplicateCheck.similarRenders[0].similarity * 100).toFixed(1)}% similarity)`
      );
    }

    // Determine if manual review is required
    const forceManualReview =
      (settings as any).forceManualReview ||
      attemptsMade > 1 ||
      (settings.quality && settings.quality > 75);

    const requiresManualReview = !qualityResult.passed || forceManualReview;

    // Add to review queue if needed
    if (requiresManualReview) {
      await this.reviewQueueService.addToReviewQueue(
        renderId,
        qualityResult.score,
        qualityResult.issues,
        {
          resolution: qualityResult.metadata.resolution!,
          format: qualityResult.metadata.format!,
          size: qualityResult.metadata.size!,
          perceptualHash: qualityResult.metadata.perceptualHash!,
          renderSettings: settings,
        },
        forceManualReview
      );

      if (!qualityResult.passed) {
        throw new Error(`Quality check failed: ${qualityResult.issues.join(', ')}`);
      }
    }

    return { qualityResult, requiresManualReview };
  }

  /**
   * Check for failure patterns after render completion
   */
  async checkForFailurePatterns(): Promise<void> {
    await this.failureDetectionService.checkForFailurePatterns();
  }
}
