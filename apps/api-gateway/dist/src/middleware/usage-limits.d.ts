import type { Context } from '../context';
export type UsageLimitOptions = {
    limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth';
    incrementBy?: number;
    customMessage?: string;
};
/**
 * Middleware to check usage limits before allowing actions
 */
export declare function checkUsageLimit(ctx: Context, options: UsageLimitOptions): Promise<void>;
/**
 * Track usage for billing purposes
 */
export declare function trackUsage(ctx: Context, recordType: 'render' | 'storage' | 'api_call', quantity?: number, metadata?: Record<string, any>): Promise<void>;
