import { z } from 'zod';
import { Scene, Mask } from '@terrasherper/db';
import pino from 'pino';
export { Logger as PinoLogger } from 'pino';

/**
 * Enum schema for subscription tiers available in the application.
 * Defines the hierarchy of subscription plans from starter to enterprise.
 */
declare const SubscriptionTierEnum: z.ZodEnum<["starter", "professional", "growth", "enterprise"]>;
/**
 * Type definition for subscription tiers.
 * Represents the different levels of service offering.
 */
type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;
/**
 * Enum schema for subscription status values.
 * Covers all possible states a subscription can be in.
 */
declare const SubscriptionStatusEnum: z.ZodEnum<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"]>;
/**
 * Type definition for subscription status.
 * Indicates the current state of a user's subscription.
 */
type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;
/**
 * Enum schema for payment status values.
 * Represents the outcome of payment processing attempts.
 */
declare const PaymentStatusEnum: z.ZodEnum<["succeeded", "failed", "pending", "refunded"]>;
/**
 * Type definition for payment status.
 * Indicates the result of a payment transaction.
 */
type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
/**
 * Enum schema for invoice status values.
 * Tracks the lifecycle state of billing invoices.
 */
declare const InvoiceStatusEnum: z.ZodEnum<["draft", "open", "paid", "void", "uncollectible"]>;
/**
 * Type definition for invoice status.
 * Represents the current state of a billing invoice.
 */
type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;
/**
 * Zod schema for subscription plan data.
 * Defines the structure of a subscription plan with pricing and features.
 */
declare const SubscriptionPlanSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    stripe_price_id: z.ZodString;
    tier: z.ZodEnum<["starter", "professional", "growth", "enterprise"]>;
    price_monthly: z.ZodNumber;
    price_yearly: z.ZodNullable<z.ZodNumber>;
    render_credits_monthly: z.ZodNumber;
    max_projects: z.ZodNullable<z.ZodNumber>;
    max_team_members: z.ZodNullable<z.ZodNumber>;
    features: z.ZodRecord<z.ZodString, z.ZodAny>;
    is_active: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    stripe_price_id: string;
    tier: "starter" | "professional" | "growth" | "enterprise";
    price_monthly: number;
    price_yearly: number | null;
    render_credits_monthly: number;
    max_projects: number | null;
    max_team_members: number | null;
    features: Record<string, any>;
    is_active: boolean;
}, {
    id: string;
    name: string;
    stripe_price_id: string;
    tier: "starter" | "professional" | "growth" | "enterprise";
    price_monthly: number;
    price_yearly: number | null;
    render_credits_monthly: number;
    max_projects: number | null;
    max_team_members: number | null;
    features: Record<string, any>;
    is_active: boolean;
}>;
type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
declare const PaymentMethodSchema: z.ZodObject<{
    id: z.ZodString;
    organization_id: z.ZodString;
    stripe_payment_method_id: z.ZodString;
    type: z.ZodString;
    brand: z.ZodNullable<z.ZodString>;
    last4: z.ZodNullable<z.ZodString>;
    exp_month: z.ZodNullable<z.ZodNumber>;
    exp_year: z.ZodNullable<z.ZodNumber>;
    is_default: z.ZodBoolean;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    organization_id: string;
    stripe_payment_method_id: string;
    brand: string | null;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}, {
    type: string;
    id: string;
    organization_id: string;
    stripe_payment_method_id: string;
    brand: string | null;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}>;
type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
declare const InvoiceSchema: z.ZodObject<{
    id: z.ZodString;
    organization_id: z.ZodString;
    stripe_invoice_id: z.ZodString;
    invoice_number: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["draft", "open", "paid", "void", "uncollectible"]>;
    amount_due: z.ZodNumber;
    amount_paid: z.ZodNumber;
    currency: z.ZodString;
    due_date: z.ZodNullable<z.ZodString>;
    paid_at: z.ZodNullable<z.ZodString>;
    period_start: z.ZodNullable<z.ZodString>;
    period_end: z.ZodNullable<z.ZodString>;
    stripe_hosted_invoice_url: z.ZodNullable<z.ZodString>;
    stripe_invoice_pdf: z.ZodNullable<z.ZodString>;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "open" | "paid" | "void" | "uncollectible";
    id: string;
    organization_id: string;
    created_at: string;
    stripe_invoice_id: string;
    invoice_number: string | null;
    amount_due: number;
    amount_paid: number;
    currency: string;
    due_date: string | null;
    paid_at: string | null;
    period_start: string | null;
    period_end: string | null;
    stripe_hosted_invoice_url: string | null;
    stripe_invoice_pdf: string | null;
    metadata: Record<string, any>;
}, {
    status: "draft" | "open" | "paid" | "void" | "uncollectible";
    id: string;
    organization_id: string;
    created_at: string;
    stripe_invoice_id: string;
    invoice_number: string | null;
    amount_due: number;
    amount_paid: number;
    currency: string;
    due_date: string | null;
    paid_at: string | null;
    period_start: string | null;
    period_end: string | null;
    stripe_hosted_invoice_url: string | null;
    stripe_invoice_pdf: string | null;
    metadata: Record<string, any>;
}>;
type Invoice = z.infer<typeof InvoiceSchema>;
declare const PaymentHistorySchema: z.ZodObject<{
    id: z.ZodString;
    organization_id: z.ZodString;
    invoice_id: z.ZodNullable<z.ZodString>;
    stripe_payment_intent_id: z.ZodNullable<z.ZodString>;
    stripe_charge_id: z.ZodNullable<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["succeeded", "failed", "pending", "refunded"]>;
    payment_method_id: z.ZodNullable<z.ZodString>;
    failure_code: z.ZodNullable<z.ZodString>;
    failure_message: z.ZodNullable<z.ZodString>;
    refunded_amount: z.ZodNumber;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "succeeded" | "failed" | "pending" | "refunded";
    id: string;
    organization_id: string;
    created_at: string;
    currency: string;
    metadata: Record<string, any>;
    invoice_id: string | null;
    stripe_payment_intent_id: string | null;
    stripe_charge_id: string | null;
    amount: number;
    payment_method_id: string | null;
    failure_code: string | null;
    failure_message: string | null;
    refunded_amount: number;
}, {
    status: "succeeded" | "failed" | "pending" | "refunded";
    id: string;
    organization_id: string;
    created_at: string;
    currency: string;
    metadata: Record<string, any>;
    invoice_id: string | null;
    stripe_payment_intent_id: string | null;
    stripe_charge_id: string | null;
    amount: number;
    payment_method_id: string | null;
    failure_code: string | null;
    failure_message: string | null;
    refunded_amount: number;
}>;
type PaymentHistory = z.infer<typeof PaymentHistorySchema>;
declare const CreateCheckoutSessionSchema: z.ZodObject<{
    priceId: z.ZodString;
    successUrl: z.ZodString;
    cancelUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
}, {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
}>;
type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;
declare const CreatePortalSessionSchema: z.ZodObject<{
    returnUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    returnUrl: string;
}, {
    returnUrl: string;
}>;
type CreatePortalSessionInput = z.infer<typeof CreatePortalSessionSchema>;
declare const UpdateSubscriptionSchema: z.ZodObject<{
    priceId: z.ZodString;
    prorationBehavior: z.ZodOptional<z.ZodEnum<["create_prorations", "none", "always_invoice"]>>;
}, "strip", z.ZodTypeAny, {
    priceId: string;
    prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
}, {
    priceId: string;
    prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
}>;
type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
declare const CancelSubscriptionSchema: z.ZodObject<{
    cancelAtPeriodEnd: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cancelAtPeriodEnd: boolean;
    reason?: string | undefined;
}, {
    cancelAtPeriodEnd?: boolean | undefined;
    reason?: string | undefined;
}>;
type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionSchema>;
declare const AddPaymentMethodSchema: z.ZodObject<{
    paymentMethodId: z.ZodString;
    setAsDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    paymentMethodId: string;
    setAsDefault: boolean;
}, {
    paymentMethodId: string;
    setAsDefault?: boolean | undefined;
}>;
type AddPaymentMethodInput = z.infer<typeof AddPaymentMethodSchema>;
declare const StripeWebhookEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    data: z.ZodObject<{
        object: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        object: Record<string, any>;
    }, {
        object: Record<string, any>;
    }>;
    created: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    data: {
        object: Record<string, any>;
    };
    created: number;
}, {
    type: string;
    id: string;
    data: {
        object: Record<string, any>;
    };
    created: number;
}>;
type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;
declare const PlanFeatures: {
    readonly starter: {
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
    };
    readonly professional: {
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
    };
    readonly growth: {
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
    };
    readonly enterprise: {
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
};
declare const PlanLimitsSchema: z.ZodObject<{
    maxProjects: z.ZodNullable<z.ZodNumber>;
    maxTeamMembers: z.ZodNullable<z.ZodNumber>;
    maxStorageGb: z.ZodNumber;
    maxRendersPerMonth: z.ZodNumber;
    renderCreditsMonthly: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    maxProjects: number | null;
    maxTeamMembers: number | null;
    maxStorageGb: number;
    maxRendersPerMonth: number;
    renderCreditsMonthly: number;
}, {
    maxProjects: number | null;
    maxTeamMembers: number | null;
    maxStorageGb: number;
    maxRendersPerMonth: number;
    renderCreditsMonthly: number;
}>;
type PlanLimits = z.infer<typeof PlanLimitsSchema>;
declare const UsageLimitCheckSchema: z.ZodObject<{
    limit: z.ZodNumber;
    usage: z.ZodNumber;
    remaining: z.ZodNumber;
    exceeded: z.ZodBoolean;
    percentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    limit: number;
    usage: number;
    remaining: number;
    exceeded: boolean;
    percentage: number;
}, {
    limit: number;
    usage: number;
    remaining: number;
    exceeded: boolean;
    percentage: number;
}>;
type UsageLimitCheck = z.infer<typeof UsageLimitCheckSchema>;

declare class FeatureGateService {
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

interface QuotaStatus {
    remaining: number;
    total: number;
    used: number;
    refreshDate: Date | null;
}
declare class QuotaService {
    /**
     * Check current quota status for an organization
     */
    checkQuota(organizationId: string): Promise<QuotaStatus>;
    /**
     * Consume quota for an organization
     */
    consumeQuota(organizationId: string, amount?: number): Promise<boolean>;
    /**
     * Check if quota needs refresh (monthly) and reset if needed
     */
    refreshQuotaIfNeeded(organizationId: string): Promise<void>;
    /**
     * Set quota limit for an organization
     */
    setQuotaLimit(organizationId: string, newLimit: number): Promise<void>;
}
declare const quotaService: QuotaService;

interface SceneWithMasks extends Scene {
    masks: Array<{
        id: string;
        category: string;
        path: any;
        deleted: boolean;
        authorId: string | null;
        createdAt: Date;
    }>;
}
declare class SceneService {
    /**
     * Create a new scene for a project
     */
    createScene(projectId: string, imageUrl: string, order?: number): Promise<Scene>;
    /**
     * Get all scenes for a project
     */
    getScenesByProject(projectId: string): Promise<Scene[]>;
    /**
     * Get a scene with its masks
     */
    getSceneWithMasks(sceneId: string): Promise<SceneWithMasks | null>;
    /**
     * Reorder scenes within a project
     */
    reorderScenes(projectId: string, sceneOrder: string[]): Promise<void>;
    /**
     * Delete a scene (soft delete)
     */
    deleteScene(sceneId: string): Promise<void>;
    /**
     * Set a scene as the default for a project
     */
    setDefaultScene(projectId: string, sceneId: string): Promise<void>;
    /**
     * Validate image dimensions (≥1500×1000px as mentioned in requirements)
     */
    validateImageDimensions(width: number, height: number): boolean;
}
declare const sceneService: SceneService;

interface MaskData {
    id?: string;
    category: string;
    path: any;
    authorId?: string;
}
interface MaskHistory {
    id: string;
    masks: Mask[];
    createdAt: Date;
    authorId: string | null;
}
declare class MaskService {
    /**
     * Save masks for a scene with diff tracking
     */
    saveMasks(sceneId: string, maskData: MaskData[], authorId?: string): Promise<void>;
    /**
     * Get masks by category for a scene
     */
    getMasksByCategory(sceneId: string, category: string): Promise<Mask[]>;
    /**
     * Get all masks for a scene
     */
    getMasksByScene(sceneId: string): Promise<Mask[]>;
    /**
     * Soft delete a specific mask
     */
    softDeleteMask(maskId: string): Promise<void>;
    /**
     * Get mask history for a scene (simplified version)
     * In a full implementation, this would track changes over time
     */
    getMaskHistory(sceneId: string): Promise<MaskHistory[]>;
    /**
     * Export masks as GeoJSON format
     */
    exportMasksAsGeoJSON(sceneId: string): Promise<any>;
    /**
     * Get available mask categories
     */
    getCategories(sceneId?: string): Promise<string[]>;
}
declare const maskService: MaskService;

declare const ClientPermissionsSchema: z.ZodObject<{
    view: z.ZodDefault<z.ZodBoolean>;
    comment: z.ZodDefault<z.ZodBoolean>;
    approve: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    view: boolean;
    comment: boolean;
    approve: boolean;
}, {
    view?: boolean | undefined;
    comment?: boolean | undefined;
    approve?: boolean | undefined;
}>;
type ClientPermissions = z.infer<typeof ClientPermissionsSchema>;
declare const ClientAccessLinkSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    created_by: z.ZodString;
    token: z.ZodString;
    client_email: z.ZodNullable<z.ZodString>;
    client_name: z.ZodNullable<z.ZodString>;
    permissions: z.ZodObject<{
        view: z.ZodDefault<z.ZodBoolean>;
        comment: z.ZodDefault<z.ZodBoolean>;
        approve: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        view: boolean;
        comment: boolean;
        approve: boolean;
    }, {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    }>;
    expires_at: z.ZodNullable<z.ZodString>;
    last_accessed_at: z.ZodNullable<z.ZodString>;
    access_count: z.ZodDefault<z.ZodNumber>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    project_id: string;
    expires_at: string | null;
    token: string;
    client_email: string | null;
    client_name: string | null;
    permissions: {
        view: boolean;
        comment: boolean;
        approve: boolean;
    };
    last_accessed_at: string | null;
    access_count: number;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    project_id: string;
    expires_at: string | null;
    token: string;
    client_email: string | null;
    client_name: string | null;
    permissions: {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    };
    last_accessed_at: string | null;
    is_active?: boolean | undefined;
    access_count?: number | undefined;
}>;
type ClientAccessLink = z.infer<typeof ClientAccessLinkSchema>;
declare const ApprovalStatusEnum: z.ZodEnum<["pending", "approved", "rejected", "revision_requested"]>;
type ApprovalStatus = z.infer<typeof ApprovalStatusEnum>;
declare const ProjectApprovalSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    version_id: z.ZodNullable<z.ZodString>;
    requested_by: z.ZodString;
    approved_by: z.ZodNullable<z.ZodString>;
    client_access_link_id: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["pending", "approved", "rejected", "revision_requested"]>;
    notes: z.ZodNullable<z.ZodString>;
    approved_at: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "approved" | "rejected" | "revision_requested";
    id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    version_id: string | null;
    requested_by: string;
    approved_by: string | null;
    client_access_link_id: string | null;
    notes: string | null;
    approved_at: string | null;
}, {
    status: "pending" | "approved" | "rejected" | "revision_requested";
    id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    version_id: string | null;
    requested_by: string;
    approved_by: string | null;
    client_access_link_id: string | null;
    notes: string | null;
    approved_at: string | null;
}>;
type ProjectApproval = z.infer<typeof ProjectApprovalSchema>;
declare const CommentPositionSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
}, {
    x: number;
    y: number;
}>;
type CommentPosition = z.infer<typeof CommentPositionSchema>;
declare const ProjectCommentSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    parent_id: z.ZodNullable<z.ZodString>;
    author_id: z.ZodNullable<z.ZodString>;
    author_email: z.ZodNullable<z.ZodString>;
    author_name: z.ZodNullable<z.ZodString>;
    client_access_link_id: z.ZodNullable<z.ZodString>;
    content: z.ZodString;
    position: z.ZodNullable<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>>;
    attachments: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    is_resolved: z.ZodDefault<z.ZodBoolean>;
    resolved_by: z.ZodNullable<z.ZodString>;
    resolved_at: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    author_id: string | null;
    client_access_link_id: string | null;
    parent_id: string | null;
    author_email: string | null;
    author_name: string | null;
    content: string;
    position: {
        x: number;
        y: number;
    } | null;
    attachments: any[];
    is_resolved: boolean;
    resolved_by: string | null;
    resolved_at: string | null;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    author_id: string | null;
    client_access_link_id: string | null;
    parent_id: string | null;
    author_email: string | null;
    author_name: string | null;
    content: string;
    position: {
        x: number;
        y: number;
    } | null;
    resolved_by: string | null;
    resolved_at: string | null;
    attachments?: any[] | undefined;
    is_resolved?: boolean | undefined;
}>;
type ProjectComment = z.infer<typeof ProjectCommentSchema>;
declare const CreateClientAccessLinkSchema: z.ZodObject<{
    projectId: z.ZodString;
    clientEmail: z.ZodOptional<z.ZodString>;
    clientName: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodObject<{
        view: z.ZodDefault<z.ZodBoolean>;
        comment: z.ZodDefault<z.ZodBoolean>;
        approve: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        view: boolean;
        comment: boolean;
        approve: boolean;
    }, {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    }>>;
    expiresIn: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    permissions?: {
        view: boolean;
        comment: boolean;
        approve: boolean;
    } | undefined;
    clientEmail?: string | undefined;
    clientName?: string | undefined;
    expiresIn?: number | undefined;
}, {
    projectId: string;
    permissions?: {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    } | undefined;
    clientEmail?: string | undefined;
    clientName?: string | undefined;
    expiresIn?: number | undefined;
}>;
type CreateClientAccessLinkInput = z.infer<typeof CreateClientAccessLinkSchema>;
declare const CreateProjectApprovalSchema: z.ZodObject<{
    projectId: z.ZodString;
    versionId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    notes?: string | undefined;
    versionId?: string | undefined;
}, {
    projectId: string;
    notes?: string | undefined;
    versionId?: string | undefined;
}>;
type CreateProjectApprovalInput = z.infer<typeof CreateProjectApprovalSchema>;
declare const UpdateApprovalStatusSchema: z.ZodObject<{
    approvalId: z.ZodString;
    status: z.ZodEnum<["pending", "approved", "rejected", "revision_requested"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "approved" | "rejected" | "revision_requested";
    approvalId: string;
    notes?: string | undefined;
}, {
    status: "pending" | "approved" | "rejected" | "revision_requested";
    approvalId: string;
    notes?: string | undefined;
}>;
type UpdateApprovalStatusInput = z.infer<typeof UpdateApprovalStatusSchema>;
declare const CreateProjectCommentSchema: z.ZodObject<{
    projectId: z.ZodString;
    content: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>>;
    clientAccessToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    content: string;
    position?: {
        x: number;
        y: number;
    } | undefined;
    parentId?: string | undefined;
    clientAccessToken?: string | undefined;
}, {
    projectId: string;
    content: string;
    position?: {
        x: number;
        y: number;
    } | undefined;
    parentId?: string | undefined;
    clientAccessToken?: string | undefined;
}>;
type CreateProjectCommentInput = z.infer<typeof CreateProjectCommentSchema>;
declare const ResolveCommentSchema: z.ZodObject<{
    commentId: z.ZodString;
    resolved: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    commentId: string;
    resolved: boolean;
}, {
    commentId: string;
    resolved: boolean;
}>;
type ResolveCommentInput = z.infer<typeof ResolveCommentSchema>;

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    target?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: {
        label: string;
        onClick?: () => void;
    };
    skipLabel?: string;
    canSkip?: boolean;
}
interface OnboardingFlow {
    id: string;
    name: string;
    description: string;
    steps: OnboardingStep[];
    completionAction?: () => void;
}
interface OnboardingState {
    currentFlowId: string | null;
    currentStepIndex: number;
    completedFlows: string[];
    skippedFlows: string[];
    lastSeenAt: string | null;
    preferences: {
        showTooltips: boolean;
        showKeyboardShortcuts: boolean;
    };
}
interface UserOnboardingProgress {
    userId: string;
    hasCompletedInitialSetup: boolean;
    hasSeenDashboardTour: boolean;
    hasCreatedFirstProject: boolean;
    hasUsedDesignTools: boolean;
    hasExportedDesign: boolean;
    toolsUsed: string[];
    featuresDiscovered: string[];
    lastActivityAt: string;
}
declare const ONBOARDING_FLOWS: {
    readonly INITIAL_SETUP: "initial-setup";
    readonly DASHBOARD_TOUR: "dashboard-tour";
    readonly DESIGN_CANVAS_INTRO: "design-canvas-intro";
    readonly DRAWING_TOOLS: "drawing-tools";
    readonly PLANT_LIBRARY: "plant-library";
    readonly LAYERS_AND_PROPERTIES: "layers-and-properties";
    readonly EXPORT_AND_SHARE: "export-and-share";
};
type OnboardingFlowId = (typeof ONBOARDING_FLOWS)[keyof typeof ONBOARDING_FLOWS];

declare const UserRoleEnum: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
type UserRole = z.infer<typeof UserRoleEnum>;
declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    clerk_id: z.ZodString;
    email: z.ZodString;
    full_name: z.ZodNullable<z.ZodString>;
    organization_id: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
    email: string;
    clerk_id: string;
    full_name: string | null;
    role: "member" | "owner" | "admin" | "designer" | "viewer";
}, {
    id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
    email: string;
    clerk_id: string;
    full_name: string | null;
    role: "member" | "owner" | "admin" | "designer" | "viewer";
}>;
type User = z.infer<typeof UserSchema>;
declare const InvitationSchema: z.ZodObject<{
    id: z.ZodString;
    organization_id: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
    invited_by: z.ZodString;
    token: z.ZodString;
    expires_at: z.ZodString;
    accepted_at: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
    email: string;
    role: "member" | "owner" | "admin" | "designer" | "viewer";
    expires_at: string;
    token: string;
    invited_by: string;
    accepted_at: string | null;
}, {
    id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
    email: string;
    role: "member" | "owner" | "admin" | "designer" | "viewer";
    expires_at: string;
    token: string;
    invited_by: string;
    accepted_at: string | null;
}>;
type Invitation = z.infer<typeof InvitationSchema>;
declare const ActivityLogSchema: z.ZodObject<{
    id: z.ZodString;
    organization_id: z.ZodString;
    user_id: z.ZodNullable<z.ZodString>;
    action: z.ZodString;
    entity_type: z.ZodString;
    entity_id: z.ZodNullable<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ip_address: z.ZodNullable<z.ZodString>;
    user_agent: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    organization_id: string;
    created_at: string;
    metadata: Record<string, any>;
    user_id: string | null;
    action: string;
    ip_address: string | null;
    user_agent: string | null;
    entity_type: string;
    entity_id: string | null;
}, {
    id: string;
    organization_id: string;
    created_at: string;
    user_id: string | null;
    action: string;
    ip_address: string | null;
    user_agent: string | null;
    entity_type: string;
    entity_id: string | null;
    metadata?: Record<string, any> | undefined;
}>;
type ActivityLog = z.infer<typeof ActivityLogSchema>;
declare const CreateInvitationSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "member" | "owner" | "admin" | "designer" | "viewer";
}, {
    email: string;
    role: "member" | "owner" | "admin" | "designer" | "viewer";
}>;
type CreateInvitationInput = z.infer<typeof CreateInvitationSchema>;
declare const UpdateUserRoleSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
}, "strip", z.ZodTypeAny, {
    role: "member" | "owner" | "admin" | "designer" | "viewer";
    userId: string;
}, {
    role: "member" | "owner" | "admin" | "designer" | "viewer";
    userId: string;
}>;
type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
declare const AcceptInvitationSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
type AcceptInvitationInput = z.infer<typeof AcceptInvitationSchema>;
declare const roleHierarchy: Record<UserRole, number>;
declare function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean;
declare const ActivityActions: {
    readonly USER_INVITED: "user.invited";
    readonly USER_JOINED: "user.joined";
    readonly USER_ROLE_CHANGED: "user.role_changed";
    readonly USER_REMOVED: "user.removed";
    readonly PROJECT_CREATED: "project.created";
    readonly PROJECT_UPDATED: "project.updated";
    readonly PROJECT_DELETED: "project.deleted";
    readonly PROJECT_SHARED: "project.shared";
    readonly RENDER_STARTED: "render.started";
    readonly RENDER_COMPLETED: "render.completed";
    readonly RENDER_FAILED: "render.failed";
    readonly ORG_SETTINGS_UPDATED: "org.settings_updated";
    readonly ORG_SUBSCRIPTION_CHANGED: "org.subscription_changed";
};
type ActivityAction = (typeof ActivityActions)[keyof typeof ActivityActions];

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
interface LoggerOptions {
    level?: LogLevel;
    service?: string;
    environment?: string;
}
interface LogContext {
    userId?: string;
    organizationId?: string;
    projectId?: string;
    requestId?: string;
    [key: string]: unknown;
}
declare class Logger {
    private logger;
    private context;
    constructor(options?: LoggerOptions);
    setContext(context: LogContext): void;
    clearContext(): void;
    child(bindings: pino.Bindings): Logger;
    trace(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
    time(label: string): () => void;
    metric(name: string, value: number, unit?: string, tags?: Record<string, string>): void;
}
declare const logger: Logger;
declare const createServiceLogger: (serviceName: string) => Logger;

export { type AcceptInvitationInput, AcceptInvitationSchema, type ActivityAction, ActivityActions, type ActivityLog, ActivityLogSchema, type AddPaymentMethodInput, AddPaymentMethodSchema, type ApprovalStatus, ApprovalStatusEnum, type CancelSubscriptionInput, CancelSubscriptionSchema, type ClientAccessLink, ClientAccessLinkSchema, type ClientPermissions, ClientPermissionsSchema, type CommentPosition, CommentPositionSchema, type CreateCheckoutSessionInput, CreateCheckoutSessionSchema, type CreateClientAccessLinkInput, CreateClientAccessLinkSchema, type CreateInvitationInput, CreateInvitationSchema, type CreatePortalSessionInput, CreatePortalSessionSchema, type CreateProjectApprovalInput, CreateProjectApprovalSchema, type CreateProjectCommentInput, CreateProjectCommentSchema, FeatureGateService, type Invitation, InvitationSchema, type Invoice, InvoiceSchema, type InvoiceStatus, InvoiceStatusEnum, type LogContext, type LogLevel, type LoggerOptions, type MaskData, type MaskHistory, MaskService, ONBOARDING_FLOWS, type OnboardingFlow, type OnboardingFlowId, type OnboardingState, type OnboardingStep, type PaymentHistory, PaymentHistorySchema, type PaymentMethod, PaymentMethodSchema, type PaymentStatus, PaymentStatusEnum, PlanFeatures, type PlanLimits, PlanLimitsSchema, type ProjectApproval, ProjectApprovalSchema, type ProjectComment, ProjectCommentSchema, QuotaService, type QuotaStatus, type ResolveCommentInput, ResolveCommentSchema, SceneService, type SceneWithMasks, type StripeWebhookEvent, StripeWebhookEventSchema, type SubscriptionPlan, SubscriptionPlanSchema, type SubscriptionStatus, SubscriptionStatusEnum, type SubscriptionTier, SubscriptionTierEnum, type UpdateApprovalStatusInput, UpdateApprovalStatusSchema, type UpdateSubscriptionInput, UpdateSubscriptionSchema, type UpdateUserRoleInput, UpdateUserRoleSchema, type UsageLimitCheck, UsageLimitCheckSchema, type User, type UserOnboardingProgress, type UserRole, UserRoleEnum, UserSchema, createServiceLogger, hasPermission, logger, maskService, quotaService, roleHierarchy, sceneService };
