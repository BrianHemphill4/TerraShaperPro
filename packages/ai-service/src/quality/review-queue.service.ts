import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface QualityReview {
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
    resolution: { width: number; height: number };
    format: string;
    size: number;
    perceptualHash: string;
    renderSettings?: any;
  };
}

export interface ReviewCriteria {
  autoApproveThreshold: number;
  autoRejectThreshold: number;
  requireManualReviewFor: string[];
}

export class ReviewQueueService {
  private supabase: SupabaseClient;
  private defaultCriteria: ReviewCriteria;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.defaultCriteria = {
      autoApproveThreshold: 0.85,
      autoRejectThreshold: 0.5,
      requireManualReviewFor: ['high_value_render', 'first_render', 'retry_after_failure'],
    };
  }

  async addToReviewQueue(
    renderId: string,
    qualityScore: number,
    issues: string[],
    metadata: QualityReview['metadata'],
    forceManualReview: boolean = false
  ): Promise<QualityReview> {
    const { data: render } = await this.supabase
      .from('renders')
      .select('*')
      .eq('id', renderId)
      .single();

    if (!render) {
      throw new Error(`Render ${renderId} not found`);
    }

    let status: QualityReview['status'] = 'pending';
    
    // Auto-approve/reject based on score unless manual review is forced
    if (!forceManualReview) {
      if (qualityScore >= this.defaultCriteria.autoApproveThreshold) {
        status = 'auto_approved';
      } else if (qualityScore <= this.defaultCriteria.autoRejectThreshold) {
        status = 'rejected';
      }
    }

    const review: Omit<QualityReview, 'id'> = {
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

    return data as QualityReview;
  }

  async getPendingReviews(limit: number = 10): Promise<QualityReview[]> {
    const { data, error } = await this.supabase
      .from('quality_reviews')
      .select('*')
      .eq('status', 'pending')
      .order('createdAt', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch pending reviews: ${error.message}`);
    }

    return data as QualityReview[];
  }

  async approveReview(
    reviewId: string,
    reviewedBy: string,
    notes?: string
  ): Promise<void> {
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

  async rejectReview(
    reviewId: string,
    reviewedBy: string,
    notes: string
  ): Promise<void> {
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
          error: `Quality review rejected: ${notes}`
        })
        .eq('id', review.renderId);
    }
  }

  async getReviewStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    autoApproved: number;
    avgQualityScore: number;
    commonIssues: Record<string, number>;
  }> {
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

    const reviews = data as QualityReview[];
    const issueCount: Record<string, number> = {};

    reviews.forEach(review => {
      review.issues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });

    return {
      total: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
      autoApproved: reviews.filter(r => r.status === 'auto_approved').length,
      avgQualityScore: reviews.reduce((sum, r) => sum + r.qualityScore, 0) / reviews.length || 0,
      commonIssues: issueCount,
    };
  }

  async checkForDuplicates(perceptualHash: string, threshold: number = 0.95): Promise<{
    isDuplicate: boolean;
    similarRenders: Array<{ renderId: string; similarity: number }>;
  }> {
    const { data: reviews } = await this.supabase
      .from('quality_reviews')
      .select('renderId, metadata')
      .not('metadata->perceptualHash', 'is', null)
      .limit(100);

    if (!reviews || reviews.length === 0) {
      return { isDuplicate: false, similarRenders: [] };
    }

    const phashService = await import('./phash.service').then(m => new m.PerceptualHashService());
    const similarRenders: Array<{ renderId: string; similarity: number }> = [];

    for (const review of reviews) {
      const metadata = review.metadata as any;
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