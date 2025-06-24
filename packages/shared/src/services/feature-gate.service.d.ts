import { SubscriptionTier, PlanFeatures } from '../types/billing';
export declare class FeatureGateService {
    /**
     * Check if a feature is available for a given subscription tier
     */
    static hasFeature(tier: SubscriptionTier | null, featureName: keyof typeof PlanFeatures.starter): boolean;
    /**
     * Check if a usage limit is exceeded
     */
    static checkUsageLimit(tier: SubscriptionTier | null, limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth', currentUsage: number): {
        limit: number;
        usage: number;
        remaining: number;
        exceeded: boolean;
        percentage: number;
    };
    /**
     * Get all features for a given tier
     */
    static getFeaturesForTier(tier: SubscriptionTier | null): {
        readonly watermark: true;
        readonly exportFormats: readonly ["png", "jpg"];
        readonly support: "community";
        readonly customBranding: false;
        readonly apiAccess: false;
        readonly sso: false;
        readonly maxStorageGb: 5;
        readonly maxRendersPerMonth: 25;
        readonly renderResolution: "standard";
        readonly canvasSizeLimit: "2000x2000";
        readonly versionHistoryDays: 7;
        readonly prioritySupport: false;
        readonly whiteLabel: false;
        readonly bulkExport: false;
        readonly advancedAnalytics: false;
        readonly clientPortal: false;
        readonly teamCollaboration: false;
    } | {
        readonly watermark: false;
        readonly exportFormats: readonly ["png", "jpg", "svg", "pdf"];
        readonly support: "email";
        readonly customBranding: true;
        readonly apiAccess: false;
        readonly sso: false;
        readonly maxStorageGb: 50;
        readonly maxRendersPerMonth: 100;
        readonly renderResolution: "high";
        readonly canvasSizeLimit: "5000x5000";
        readonly versionHistoryDays: 30;
        readonly prioritySupport: false;
        readonly whiteLabel: false;
        readonly bulkExport: true;
        readonly advancedAnalytics: false;
        readonly clientPortal: true;
        readonly teamCollaboration: true;
    } | {
        readonly watermark: false;
        readonly exportFormats: readonly ["png", "jpg", "svg", "pdf", "dxf"];
        readonly support: "priority";
        readonly customBranding: true;
        readonly apiAccess: true;
        readonly sso: false;
        readonly maxStorageGb: 200;
        readonly maxRendersPerMonth: 500;
        readonly renderResolution: "ultra";
        readonly canvasSizeLimit: "10000x10000";
        readonly versionHistoryDays: 90;
        readonly prioritySupport: true;
        readonly whiteLabel: true;
        readonly bulkExport: true;
        readonly advancedAnalytics: true;
        readonly clientPortal: true;
        readonly teamCollaboration: true;
    } | {
        readonly watermark: false;
        readonly exportFormats: readonly ["png", "jpg", "svg", "pdf", "dxf", "dwg"];
        readonly support: "dedicated";
        readonly customBranding: true;
        readonly apiAccess: true;
        readonly sso: true;
        readonly maxStorageGb: -1;
        readonly maxRendersPerMonth: -1;
        readonly renderResolution: "ultra";
        readonly canvasSizeLimit: "unlimited";
        readonly versionHistoryDays: -1;
        readonly prioritySupport: true;
        readonly whiteLabel: true;
        readonly bulkExport: true;
        readonly advancedAnalytics: true;
        readonly clientPortal: true;
        readonly teamCollaboration: true;
        readonly customContract: true;
        readonly dedicatedAccountManager: true;
        readonly sla: true;
        readonly customIntegrations: true;
    };
    /**
     * Compare features between two tiers
     */
    static compareFeatures(fromTier: SubscriptionTier, toTier: SubscriptionTier): {
        feature: string;
        from: any;
        to: any;
        isUpgrade: boolean;
    }[];
    /**
     * Get tier ranking (for upgrade/downgrade logic)
     */
    static getTierRank(tier: SubscriptionTier): number;
    /**
     * Check if moving from one tier to another is an upgrade
     */
    static isUpgrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean;
    /**
     * Get available export formats for a tier
     */
    static getExportFormats(tier: SubscriptionTier | null): string[];
    /**
     * Check if a specific export format is available
     */
    static canExportFormat(tier: SubscriptionTier | null, format: string): boolean;
    /**
     * Get render resolution for a tier
     */
    static getRenderResolution(tier: SubscriptionTier | null): 'standard' | 'high' | 'ultra';
    /**
     * Check if a feature requires a specific minimum tier
     */
    static getMinimumTierForFeature(featureName: keyof typeof PlanFeatures.starter): SubscriptionTier | null;
}
