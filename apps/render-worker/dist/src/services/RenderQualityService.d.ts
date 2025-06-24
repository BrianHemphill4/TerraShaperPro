/**
 * Service responsible for quality control and review processes
 */
export declare class RenderQualityService {
    private qualityChecker;
    private reviewQueueService;
    private failureDetectionService;
    constructor();
    /**
     * Perform comprehensive quality check on rendered image
     */
    performQualityCheck(imageData: string, width: number, height: number, renderId: string, settings: any, attemptsMade: number): Promise<{
        qualityResult: any;
        requiresManualReview: boolean;
    }>;
    /**
     * Check for failure patterns after render completion
     */
    checkForFailurePatterns(): Promise<void>;
}
