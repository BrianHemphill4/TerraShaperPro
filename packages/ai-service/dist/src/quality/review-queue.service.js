"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewQueueService = void 0;
const db_1 = require("@terrashaper/db");
class ReviewQueueService {
    supabase;
    defaultCriteria;
    constructor() {
        this.supabase = (0, db_1.createWorkerClient)();
        this.defaultCriteria = {
            autoApproveThreshold: 0.85,
            autoRejectThreshold: 0.5,
            requireManualReviewFor: ['high_value_render', 'first_render', 'retry_after_failure'],
        };
    }
    async addToReviewQueue(renderId, qualityScore, issues, metadata, forceManualReview = false) {
        const { data: render } = await this.supabase
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
        const { data, error } = await this.supabase
            .from('quality_reviews')
            .insert(review)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create quality review: ${error.message}`);
        }
        return data;
    }
    async getPendingReviews(limit = 10) {
        const { data, error } = await this.supabase
            .from('quality_reviews')
            .select('*')
            .eq('status', 'pending')
            .order('createdAt', { ascending: true })
            .limit(limit);
        if (error) {
            throw new Error(`Failed to fetch pending reviews: ${error.message}`);
        }
        return data;
    }
    async approveReview(reviewId, reviewedBy, notes) {
        const { error } = await this.supabase
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
        const { data: review } = await this.supabase
            .from('quality_reviews')
            .select('renderId')
            .eq('id', reviewId)
            .single();
        if (review) {
            await this.supabase
                .from('renders')
                .update({ qualityStatus: 'approved' })
                .eq('id', review.renderId);
        }
    }
    async rejectReview(reviewId, reviewedBy, notes) {
        const { error } = await this.supabase
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
        const { data: review } = await this.supabase
            .from('quality_reviews')
            .select('renderId')
            .eq('id', reviewId)
            .single();
        if (review) {
            await this.supabase
                .from('renders')
                .update({
                qualityStatus: 'rejected',
                status: 'failed',
                error: `Quality review rejected: ${notes}`,
            })
                .eq('id', review.renderId);
        }
    }
    async getReviewStats(timeframe = 'week') {
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
        const { data, error } = await this.supabase
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
    }
    async checkForDuplicates(perceptualHash, threshold = 0.95) {
        const { data: reviews } = await this.supabase
            .from('quality_reviews')
            .select('renderId, metadata')
            .not('metadata->perceptualHash', 'is', null)
            .limit(100);
        if (!reviews || reviews.length === 0) {
            return { isDuplicate: false, similarRenders: [] };
        }
        const phashService = await Promise.resolve().then(() => __importStar(require('./phash.service'))).then((m) => new m.PerceptualHashService());
        const similarRenders = [];
        for (const review of reviews) {
            const metadata = review.metadata;
            const existingHash = metadata?.perceptualHash;
            if (existingHash && typeof existingHash === 'string') {
                const similarity = await phashService.compareHashes(perceptualHash, existingHash);
                if (similarity >= threshold) {
                    similarRenders.push({ renderId: review.renderId, similarity });
                }
            }
        }
        return {
            isDuplicate: similarRenders.length > 0,
            similarRenders: similarRenders.sort((a, b) => b.similarity - a.similarity),
        };
    }
}
exports.ReviewQueueService = ReviewQueueService;
