import { TRPCError } from '@trpc/server';
import type { Context } from '../context';
import { FeatureGateService } from '@terrashaper/shared';
import type { SubscriptionTier } from '@terrashaper/shared';

export interface UsageLimitOptions {
  limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth';
  incrementBy?: number;
  customMessage?: string;
}

/**
 * Middleware to check usage limits before allowing actions
 */
export async function checkUsageLimit(
  ctx: Context,
  options: UsageLimitOptions
): Promise<void> {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  // Get organization subscription tier
  const { data: org } = await ctx.supabase
    .from('organizations')
    .select('subscription_tier, stripe_subscription_status')
    .eq('id', ctx.session.organizationId)
    .single();

  const tier = (org?.stripe_subscription_status === 'active' ? org.subscription_tier : 'starter') as SubscriptionTier;

  // Get current usage based on limit type
  let currentUsage = 0;
  
  switch (options.limitType) {
    case 'maxProjects': {
      const { count } = await ctx.supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', ctx.session.organizationId);
      currentUsage = count || 0;
      break;
    }
    
    case 'maxTeamMembers': {
      const { count } = await ctx.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', ctx.session.organizationId);
      currentUsage = count || 0;
      break;
    }
    
    case 'maxRendersPerMonth': {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data } = await ctx.supabase
        .from('usage_records')
        .select('quantity')
        .eq('organization_id', ctx.session.organizationId)
        .eq('record_type', 'render')
        .gte('created_at', startOfMonth.toISOString());
      
      currentUsage = data?.reduce((sum, record) => sum + record.quantity, 0) || 0;
      break;
    }
    
    case 'maxStorageGb': {
      // Get storage usage from helper function
      const { data } = await ctx.supabase
        .rpc('get_organization_storage_usage', {
          org_id: ctx.session.organizationId,
        });
      
      currentUsage = Math.ceil((data?.total_bytes || 0) / (1024 * 1024 * 1024)); // Convert to GB
      break;
    }
  }

  // Check if adding incrementBy would exceed the limit
  const futureUsage = currentUsage + (options.incrementBy || 1);
  const limitCheck = FeatureGateService.checkUsageLimit(tier, options.limitType, futureUsage);

  if (limitCheck.exceeded) {
    const limitTypeDisplay = {
      maxProjects: 'projects',
      maxTeamMembers: 'team members',
      maxStorageGb: 'storage',
      maxRendersPerMonth: 'renders this month',
    };

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: options.customMessage || 
        `You've reached your limit of ${limitCheck.limit} ${limitTypeDisplay[options.limitType]}. ` +
        `Please upgrade your plan to continue.`,
      cause: {
        limitType: options.limitType,
        limit: limitCheck.limit,
        currentUsage: currentUsage,
        tier: tier,
      },
    });
  }
}

/**
 * Track usage for billing purposes
 */
export async function trackUsage(
  ctx: Context,
  recordType: 'render' | 'storage' | 'api_call',
  quantity: number = 1,
  metadata?: Record<string, any>
): Promise<void> {
  if (!ctx.session) {
    return;
  }

  await ctx.supabase.from('usage_records').insert({
    organization_id: ctx.session.organizationId,
    record_type: recordType,
    quantity: quantity,
    metadata: metadata || {},
  });
}