import { supabase } from '@terrashaper/db';
import { getRenderQueue } from '@terrashaper/queue';

export type RenderService = {
  createRenderJob: (projectId: string, options: RenderOptions) => Promise<RenderJob>;
  getRenderStatus: (jobId: string) => Promise<RenderStatus>;
  cancelRender: (jobId: string) => Promise<void>;
  getRenderHistory: (projectId: string) => Promise<RenderJob[]>;
  getCreditsUsage: (organizationId: string, period: { start: Date; end: Date }) => Promise<CreditsUsage>;
  estimateCredits: (params: EstimateCreditsInput) => Promise<number>;
}

export type RenderOptions = {
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  format: 'png' | 'jpg' | 'webp';
  width: number;
  height: number;
  prompt?: string;
  style?: string;
  userId: string;
  organizationId: string;
}

export type RenderJob = {
  id: string;
  projectId: string;
  status: RenderStatus;
  options: RenderOptions;
  createdAt: Date;
  completedAt?: Date;
  outputUrl?: string;
  error?: string;
  creditsUsed?: number;
}

export type RenderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type CreditsUsage = {
  total: number;
  byQuality: Record<string, number>;
  byProject: Array<{ projectId: string; projectName: string; credits: number }>;
  dailyUsage: Array<{ date: string; credits: number }>;
}

export type EstimateCreditsInput = {
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  resolution: string;
  style?: string;
}

export class RenderServiceImpl implements RenderService {
  private creditCosts = {
    draft: 0.5,
    standard: 1,
    high: 2,
    ultra: 4,
  };

  async createRenderJob(projectId: string, options: RenderOptions): Promise<RenderJob> {
    // Calculate credits required
    const creditsRequired = await this.estimateCredits({
      quality: options.quality,
      resolution: `${options.width}x${options.height}`,
      style: options.style,
    });

    // Check if user has enough credits
    const { data: org } = await supabase
      .from('organizations')
      .select('*, subscriptions(*, subscription_plans(*))')
      .eq('id', options.organizationId)
      .single();

    if (!org) {
      throw new Error('Organization not found');
    }

    const plan = org.subscriptions?.[0]?.subscription_plans;
    if (!plan) {
      throw new Error('No active subscription');
    }

    // Get current period usage
    const currentPeriodStart = new Date(org.subscriptions[0].current_period_start);
    const usage = await this.getCreditsUsage(options.organizationId, {
      start: currentPeriodStart,
      end: new Date(),
    });

    if (usage.total + creditsRequired > plan.render_credits_monthly) {
      throw new Error('Insufficient render credits');
    }

    // Create render record
    const renderData = {
      project_id: projectId,
      organization_id: options.organizationId,
      user_id: options.userId,
      prompt: options.prompt || '',
      style: options.style || 'default',
      quality: options.quality,
      resolution: `${options.width}x${options.height}`,
      status: 'pending',
      credits_used: creditsRequired,
      metadata: {
        format: options.format,
        width: options.width,
        height: options.height,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { data: result, error } = await supabase
      .from('renders')
      .insert(renderData)
      .select()
      .single();

    if (error) throw error;

    // Queue render job
    const queue = getRenderQueue();
    await queue.add('process-render', {
      renderId: result.id,
      projectId,
      sceneId: 'default', // TODO: Add scene support
      userId: options.userId,
      organizationId: options.organizationId,
      subscriptionTier: (plan.tier || 'starter') as 'starter' | 'pro' | 'growth',
      sourceImageUrl: '', // TODO: Add source image support
      prompt: {
        system: `Style: ${options.style || 'default'}, Quality: ${options.quality}`,
        user: options.prompt || 'Generate landscape design',
      },
      annotations: [],
      settings: {
        provider: 'openai-gpt-image', // Default provider
        resolution: '1024x1024', // TODO: Map from width/height
        format: options.format.toUpperCase() as 'PNG' | 'JPEG',
        quality: options.quality === 'ultra' ? 100 : options.quality === 'high' ? 90 : 80,
      },
    });

    return {
      id: result.id,
      projectId: result.project_id,
      status: result.status as RenderStatus,
      options,
      createdAt: result.created_at,
      creditsUsed: result.credits_used,
    };
  }

  async getRenderStatus(jobId: string): Promise<RenderStatus> {
    const { data: result, error } = await supabase
      .from('renders')
      .select('status')
      .eq('id', jobId)
      .single();
    
    if (error) throw new Error('Render job not found');
    return result.status as RenderStatus;
  }

  async cancelRender(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('renders')
      .update({
        status: 'cancelled',
        updated_at: new Date(),
      })
      .eq('id', jobId)
      .in('status', ['pending', 'processing']);

    if (error) throw error;

    // TODO: Cancel the job in the queue
  }

  async getRenderHistory(projectId: string): Promise<RenderJob[]> {
    const { data: results, error } = await supabase
      .from('renders')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (results || []).map(render => ({
      id: render.id,
      projectId: render.project_id,
      status: render.status as RenderStatus,
      options: {
        quality: render.quality as any,
        format: (render.metadata as any)?.format || 'png',
        width: (render.metadata as any)?.width || 1920,
        height: (render.metadata as any)?.height || 1080,
        prompt: render.prompt,
        style: render.style,
        userId: render.user_id,
        organizationId: render.organization_id,
      },
      createdAt: render.created_at,
      completedAt: render.completed_at || undefined,
      outputUrl: render.output_url || undefined,
      error: render.error_message || undefined,
      creditsUsed: render.credits_used,
    }));
  }

  async getCreditsUsage(organizationId: string, period: { start: Date; end: Date }): Promise<CreditsUsage> {
    const { data: renders } = await supabase
      .from('renders')
      .select('*, projects(name)')
      .eq('organization_id', organizationId)
      .gte('created_at', period.start.toISOString())
      .lte('created_at', period.end.toISOString())
      .in('status', ['completed', 'processing']);

    const total = renders?.reduce((sum, render) => sum + (render.credits_used || 0), 0) || 0;

    const byQuality = renders?.reduce((acc, render) => {
      const quality = render.quality || 'standard';
      acc[quality] = (acc[quality] || 0) + (render.credits_used || 0);
      return acc;
    }, {} as Record<string, number>) || {};

    // Group by project
    const projectMap = new Map<string, { name: string; credits: number }>();
    renders?.forEach(render => {
      const existing = projectMap.get(render.project_id) || {
        name: render.projects?.name || 'Unknown Project',
        credits: 0,
      };
      existing.credits += render.credits_used || 0;
      projectMap.set(render.project_id, existing);
    });

    const byProject = Array.from(projectMap.entries())
      .map(([projectId, data]) => ({
        projectId,
        projectName: data.name,
        credits: data.credits,
      }))
      .sort((a, b) => b.credits - a.credits);

    // Group by day
    const dailyMap = new Map<string, number>();
    renders?.forEach(render => {
      const date = new Date(render.created_at).toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + (render.credits_used || 0));
    });

    const dailyUsage = Array.from(dailyMap.entries())
      .map(([date, credits]) => ({ date, credits }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total,
      byQuality,
      byProject,
      dailyUsage,
    };
  }

  async estimateCredits(params: EstimateCreditsInput): Promise<number> {
    let credits = this.creditCosts[params.quality] || 1;

    // Parse resolution
    const [width, height] = params.resolution.split('x').map(Number);
    const pixels = width * height;

    // Add multiplier for high resolution
    if (pixels > 3840 * 2160) { // > 4K
      credits *= 2;
    } else if (pixels > 2560 * 1440) { // > 2K
      credits *= 1.5;
    }

    // Add multiplier for complex styles
    if (params.style && ['photorealistic', 'hyperrealistic'].includes(params.style.toLowerCase())) {
      credits *= 1.5;
    }

    return Math.ceil(credits);
  }
}

export const renderService = new RenderServiceImpl();