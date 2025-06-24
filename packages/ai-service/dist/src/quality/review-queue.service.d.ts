export type QualityReview = {
    id: string;
    renderId: string;
    projectId: string;
    imageUrl: string;
    thumbnailUrl: string;
    qualityScore: number;
    issues: string[];
    status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
    createdAt: Date;
    metadata: {
        resolution: {
            width: number;
            height: number;
        };
        format: string;
        size: number;
        perceptualHash: string;
        renderSettings?: any;
    };
};
export type ReviewCriteria = {
    autoApproveThreshold: number;
    autoRejectThreshold: number;
    requireManualReviewFor: string[];
};
export declare class ReviewQueueService {
    private supabase;
    private defaultCriteria;
    constructor();
    addToReviewQueue(renderId: string, qualityScore: number, issues: string[], metadata: QualityReview['metadata'], forceManualReview?: boolean): Promise<QualityReview>;
    getPendingReviews(limit?: number): Promise<QualityReview[]>;
    approveReview(reviewId: string, reviewedBy: string, notes?: string): Promise<void>;
    rejectReview(reviewId: string, reviewedBy: string, notes: string): Promise<void>;
    getReviewStats(timeframe?: 'day' | 'week' | 'month'): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        autoApproved: number;
        avgQualityScore: number;
        commonIssues: Record<string, number>;
    }>;
    checkForDuplicates(perceptualHash: string, threshold?: number): Promise<{
        isDuplicate: boolean;
        similarRenders: Array<{
            renderId: string;
            similarity: number;
        }>;
    }>;
}
//# sourceMappingURL=review-queue.service.d.ts.map