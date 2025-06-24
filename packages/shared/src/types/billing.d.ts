import { z } from 'zod';
/**
 * Enum schema for subscription tiers available in the application.
 * Defines the hierarchy of subscription plans from starter to enterprise.
 */
export declare const SubscriptionTierEnum: z.ZodEnum<["starter", "professional", "growth", "enterprise"]>;
/**
 * Type definition for subscription tiers.
 * Represents the different levels of service offering.
 */
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;
/**
 * Enum schema for subscription status values.
 * Covers all possible states a subscription can be in.
 */
export declare const SubscriptionStatusEnum: z.ZodEnum<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"]>;
/**
 * Type definition for subscription status.
 * Indicates the current state of a user's subscription.
 */
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;
/**
 * Enum schema for payment status values.
 * Represents the outcome of payment processing attempts.
 */
export declare const PaymentStatusEnum: z.ZodEnum<["succeeded", "failed", "pending", "refunded"]>;
/**
 * Type definition for payment status.
 * Indicates the result of a payment transaction.
 */
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
/**
 * Enum schema for invoice status values.
 * Tracks the lifecycle state of billing invoices.
 */
export declare const InvoiceStatusEnum: z.ZodEnum<["draft", "open", "paid", "void", "uncollectible"]>;
/**
 * Type definition for invoice status.
 * Represents the current state of a billing invoice.
 */
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;
/**
 * Zod schema for subscription plan data.
 * Defines the structure of a subscription plan with pricing and features.
 */
export declare const SubscriptionPlanSchema: z.ZodObject<{
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
    is_active: boolean;
    features: Record<string, any>;
    stripe_price_id: string;
    tier: "professional" | "enterprise" | "starter" | "growth";
    price_monthly: number;
    price_yearly: number | null;
    render_credits_monthly: number;
    max_projects: number | null;
    max_team_members: number | null;
}, {
    id: string;
    name: string;
    is_active: boolean;
    features: Record<string, any>;
    stripe_price_id: string;
    tier: "professional" | "enterprise" | "starter" | "growth";
    price_monthly: number;
    price_yearly: number | null;
    render_credits_monthly: number;
    max_projects: number | null;
    max_team_members: number | null;
}>;
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export declare const PaymentMethodSchema: z.ZodObject<{
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
    id: string;
    brand: string | null;
    created_at: string;
    updated_at: string;
    organization_id: string;
    is_default: boolean;
    type: string;
    stripe_payment_method_id: string;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
}, {
    id: string;
    brand: string | null;
    created_at: string;
    updated_at: string;
    organization_id: string;
    is_default: boolean;
    type: string;
    stripe_payment_method_id: string;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
}>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export declare const InvoiceSchema: z.ZodObject<{
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
    id: string;
    created_at: string;
    organization_id: string;
    status: "draft" | "void" | "paid" | "open" | "uncollectible";
    metadata: Record<string, any>;
    amount_due: number;
    amount_paid: number;
    currency: string;
    due_date: string | null;
    period_end: string | null;
    period_start: string | null;
    stripe_invoice_id: string;
    invoice_number: string | null;
    paid_at: string | null;
    stripe_hosted_invoice_url: string | null;
    stripe_invoice_pdf: string | null;
}, {
    id: string;
    created_at: string;
    organization_id: string;
    status: "draft" | "void" | "paid" | "open" | "uncollectible";
    metadata: Record<string, any>;
    amount_due: number;
    amount_paid: number;
    currency: string;
    due_date: string | null;
    period_end: string | null;
    period_start: string | null;
    stripe_invoice_id: string;
    invoice_number: string | null;
    paid_at: string | null;
    stripe_hosted_invoice_url: string | null;
    stripe_invoice_pdf: string | null;
}>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export declare const PaymentHistorySchema: z.ZodObject<{
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
    id: string;
    created_at: string;
    organization_id: string;
    status: "pending" | "failed" | "succeeded" | "refunded";
    metadata: Record<string, any>;
    currency: string;
    invoice_id: string | null;
    stripe_payment_intent_id: string | null;
    stripe_charge_id: string | null;
    amount: number;
    payment_method_id: string | null;
    failure_code: string | null;
    failure_message: string | null;
    refunded_amount: number;
}, {
    id: string;
    created_at: string;
    organization_id: string;
    status: "pending" | "failed" | "succeeded" | "refunded";
    metadata: Record<string, any>;
    currency: string;
    invoice_id: string | null;
    stripe_payment_intent_id: string | null;
    stripe_charge_id: string | null;
    amount: number;
    payment_method_id: string | null;
    failure_code: string | null;
    failure_message: string | null;
    refunded_amount: number;
}>;
export type PaymentHistory = z.infer<typeof PaymentHistorySchema>;
export declare const CreateCheckoutSessionSchema: z.ZodObject<{
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
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;
export declare const CreatePortalSessionSchema: z.ZodObject<{
    returnUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    returnUrl: string;
}, {
    returnUrl: string;
}>;
export type CreatePortalSessionInput = z.infer<typeof CreatePortalSessionSchema>;
export declare const UpdateSubscriptionSchema: z.ZodObject<{
    priceId: z.ZodString;
    prorationBehavior: z.ZodOptional<z.ZodEnum<["create_prorations", "none", "always_invoice"]>>;
}, "strip", z.ZodTypeAny, {
    priceId: string;
    prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
}, {
    priceId: string;
    prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
}>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
export declare const CancelSubscriptionSchema: z.ZodObject<{
    cancelAtPeriodEnd: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cancelAtPeriodEnd: boolean;
    reason?: string | undefined;
}, {
    cancelAtPeriodEnd?: boolean | undefined;
    reason?: string | undefined;
}>;
export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionSchema>;
export declare const AddPaymentMethodSchema: z.ZodObject<{
    paymentMethodId: z.ZodString;
    setAsDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    paymentMethodId: string;
    setAsDefault: boolean;
}, {
    paymentMethodId: string;
    setAsDefault?: boolean | undefined;
}>;
export type AddPaymentMethodInput = z.infer<typeof AddPaymentMethodSchema>;
export declare const StripeWebhookEventSchema: z.ZodObject<{
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
    id: string;
    data: {
        object: Record<string, any>;
    };
    type: string;
    created: number;
}, {
    id: string;
    data: {
        object: Record<string, any>;
    };
    type: string;
    created: number;
}>;
export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;
export declare const PlanFeatures: {
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
export declare const PlanLimitsSchema: z.ZodObject<{
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
export type PlanLimits = z.infer<typeof PlanLimitsSchema>;
export declare const UsageLimitCheckSchema: z.ZodObject<{
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
export type UsageLimitCheck = z.infer<typeof UsageLimitCheckSchema>;
