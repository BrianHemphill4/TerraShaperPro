var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createWorkerClient } from '@terrashaper/db';
export class ReviewQueueService {
    constructor() {
        this.supabase = createWorkerClient();
        this.defaultCriteria = {
            autoApproveThreshold: 0.85,
            autoRejectThreshold: 0.5,
            requireManualReviewFor: ['high_value_render', 'first_render', 'retry_after_failure'],
        };
    }
    addToReviewQueue(renderId_1, qualityScore_1, issues_1, metadata_1) {
        return __awaiter(this, arguments, void 0, function* (renderId, qualityScore, issues, metadata, forceManualReview = false) {
            const { data: render } = yield this.supabase
                .from('renders')
                .select('*')
                .eq('id', renderId)
                .single();
            if (!render) {
                throw new Error(`Render ${renderId} not found`);
            }
            let status = 'pending';
            // Auto-approve/reject based on score unless manual review is forced
            if (!forceManualReview) {
                if (qualityScore >= this.defaultCriteria.autoApproveThreshold) {
                    status = 'auto_approved';
                }
                else if (qualityScore <= this.defaultCriteria.autoRejectThreshold) {
                    status = 'rejected';
                }
            }
            const review = {
                renderId,
                projectId: render.projectId,
                imageUrl: render.imageUrl,
                thumbnailUrl: render.thumbnailUrl,
                qualityScore,
                issues,
                status,
                createdAt: new Date(),
                metadata,
            };
            const { data, error } = yield this.supabase
                .from('quality_reviews')
                .insert(review)
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to create quality review: ${error.message}`);
            }
            return data;
        });
    }
    getPendingReviews() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const { data, error } = yield this.supabase
                .from('quality_reviews')
                .select('*')
                .eq('status', 'pending')
                .order('createdAt', { ascending: true })
                .limit(limit);
            if (error) {
                throw new Error(`Failed to fetch pending reviews: ${error.message}`);
            }
            return data;
        });
    }
    approveReview(reviewId, reviewedBy, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = yield this.supabase
                .from('quality_reviews')
                .update({
                status: 'approved',
                reviewedBy,
                reviewedAt: new Date().toISOString(),
                reviewNotes: notes,
            })
                .eq('id', reviewId);
            if (error) {
                throw new Error(`Failed to approve review: ${error.message}`);
            }
            // Update render status to approved
            const { data: review } = yield this.supabase
                .from('quality_reviews')
                .select('renderId')
                .eq('id', reviewId)
                .single();
            if (review) {
                yield this.supabase
                    .from('renders')
                    .update({ qualityStatus: 'approved' })
                    .eq('id', review.renderId);
            }
        });
    }
    rejectReview(reviewId, reviewedBy, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = yield this.supabase
                .from('quality_reviews')
                .update({
                status: 'rejected',
                reviewedBy,
                reviewedAt: new Date().toISOString(),
                reviewNotes: notes,
            })
                .eq('id', reviewId);
            if (error) {
                throw new Error(`Failed to reject review: ${error.message}`);
            }
            // Update render status and trigger retry
            const { data: review } = yield this.supabase
                .from('quality_reviews')
                .select('renderId')
                .eq('id', reviewId)
                .single();
            if (review) {
                yield this.supabase
                    .from('renders')
                    .update({
                    qualityStatus: 'rejected',
                    status: 'failed',
                    error: `Quality review rejected: ${notes}`,
                })
                    .eq('id', review.renderId);
            }
        });
    }
    getReviewStats() {
        return __awaiter(this, arguments, void 0, function* (timeframe = 'week') {
            const since = new Date();
            switch (timeframe) {
                case 'day':
                    since.setDate(since.getDate() - 1);
                    break;
                case 'week':
                    since.setDate(since.getDate() - 7);
                    break;
                case 'month':
                    since.setMonth(since.getMonth() - 1);
                    break;
            }
            const { data, error } = yield this.supabase
                .from('quality_reviews')
                .select('*')
                .gte('createdAt', since.toISOString());
            if (error) {
                throw new Error(`Failed to fetch review stats: ${error.message}`);
            }
            const reviews = data;
            const issueCount = {};
            reviews.forEach((review) => {
                review.issues.forEach((issue) => {
                    issueCount[issue] = (issueCount[issue] || 0) + 1;
                });
            });
            return {
                total: reviews.length,
                pending: reviews.filter((r) => r.status === 'pending').length,
                approved: reviews.filter((r) => r.status === 'approved').length,
                rejected: reviews.filter((r) => r.status === 'rejected').length,
                autoApproved: reviews.filter((r) => r.status === 'auto_approved').length,
                avgQualityScore: reviews.reduce((sum, r) => sum + r.qualityScore, 0) / reviews.length || 0,
                commonIssues: issueCount,
            };
        });
    }
    checkForDuplicates(perceptualHash_1) {
        return __awaiter(this, arguments, void 0, function* (perceptualHash, threshold = 0.95) {
            const { data: reviews } = yield this.supabase
                .from('quality_reviews')
                .select('renderId, metadata')
                .not('metadata->perceptualHash', 'is', null)
                .limit(100);
            if (!reviews || reviews.length === 0) {
                return { isDuplicate: false, similarRenders: [] };
            }
            const phashService = yield import('./phash.service').then((m) => new m.PerceptualHashService());
            const similarRenders = [];
            for (const review of reviews) {
                const metadata = review.metadata;
                const existingHash = metadata === null || metadata === void 0 ? void 0 : metadata.perceptualHash;
                if (existingHash && typeof existingHash === 'string') {
                    const similarity = yield phashService.compareHashes(perceptualHash, existingHash);
                    if (similarity >= threshold) {
                        similarRenders.push({ renderId: review.renderId, similarity });
                    }
                }
            }
            return {
                isDuplicate: similarRenders.length > 0,
                similarRenders: similarRenders.sort((a, b) => b.similarity - a.similarity),
            };
        });
    }
}
