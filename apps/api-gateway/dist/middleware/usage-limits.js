"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsageLimit = checkUsageLimit;
exports.trackUsage = trackUsage;
const server_1 = require("@trpc/server");
const shared_1 = require("@terrashaper/shared");
/**
 * Middleware to check usage limits before allowing actions
 */
async function checkUsageLimit(ctx, options) {
    if (!ctx.session) {
        throw new server_1.TRPCError({
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
    const tier = (org?.stripe_subscription_status === 'active' ? org.subscription_tier : 'starter');
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
    const limitCheck = shared_1.FeatureGateService.checkUsageLimit(tier, options.limitType, futureUsage);
    if (limitCheck.exceeded) {
        const limitTypeDisplay = {
            maxProjects: 'projects',
            maxTeamMembers: 'team members',
            maxStorageGb: 'storage',
            maxRendersPerMonth: 'renders this month',
        };
        throw new server_1.TRPCError({
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
async function trackUsage(ctx, recordType, quantity = 1, metadata) {
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
