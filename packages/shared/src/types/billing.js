"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageLimitCheckSchema = exports.PlanLimitsSchema = exports.PlanFeatures = exports.StripeWebhookEventSchema = exports.AddPaymentMethodSchema = exports.CancelSubscriptionSchema = exports.UpdateSubscriptionSchema = exports.CreatePortalSessionSchema = exports.CreateCheckoutSessionSchema = exports.PaymentHistorySchema = exports.InvoiceSchema = exports.PaymentMethodSchema = exports.SubscriptionPlanSchema = exports.InvoiceStatusEnum = exports.PaymentStatusEnum = exports.SubscriptionStatusEnum = exports.SubscriptionTierEnum = void 0;
const zod_1 = require("zod");
/**
 * Enum schema for subscription tiers available in the application.
 * Defines the hierarchy of subscription plans from starter to enterprise.
 */
exports.SubscriptionTierEnum = zod_1.z.enum(['starter', 'professional', 'growth', 'enterprise']);
/**
 * Enum schema for subscription status values.
 * Covers all possible states a subscription can be in.
 */
exports.SubscriptionStatusEnum = zod_1.z.enum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
]);
/**
 * Enum schema for payment status values.
 * Represents the outcome of payment processing attempts.
 */
exports.PaymentStatusEnum = zod_1.z.enum(['succeeded', 'failed', 'pending', 'refunded']);
/**
 * Enum schema for invoice status values.
 * Tracks the lifecycle state of billing invoices.
 */
exports.InvoiceStatusEnum = zod_1.z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']);
/**
 * Zod schema for subscription plan data.
 * Defines the structure of a subscription plan with pricing and features.
 */
exports.SubscriptionPlanSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    stripe_price_id: zod_1.z.string(),
    tier: exports.SubscriptionTierEnum,
    price_monthly: zod_1.z.number(),
    price_yearly: zod_1.z.number().nullable(),
    render_credits_monthly: zod_1.z.number(),
    max_projects: zod_1.z.number().nullable(),
    max_team_members: zod_1.z.number().nullable(),
    features: zod_1.z.record(zod_1.z.any()),
    is_active: zod_1.z.boolean(),
});
exports.PaymentMethodSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organization_id: zod_1.z.string().uuid(),
    stripe_payment_method_id: zod_1.z.string(),
    type: zod_1.z.string(),
    brand: zod_1.z.string().nullable(),
    last4: zod_1.z.string().nullable(),
    exp_month: zod_1.z.number().nullable(),
    exp_year: zod_1.z.number().nullable(),
    is_default: zod_1.z.boolean(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.InvoiceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organization_id: zod_1.z.string().uuid(),
    stripe_invoice_id: zod_1.z.string(),
    invoice_number: zod_1.z.string().nullable(),
    status: exports.InvoiceStatusEnum,
    amount_due: zod_1.z.number(),
    amount_paid: zod_1.z.number(),
    currency: zod_1.z.string(),
    due_date: zod_1.z.string().datetime().nullable(),
    paid_at: zod_1.z.string().datetime().nullable(),
    period_start: zod_1.z.string().datetime().nullable(),
    period_end: zod_1.z.string().datetime().nullable(),
    stripe_hosted_invoice_url: zod_1.z.string().nullable(),
    stripe_invoice_pdf: zod_1.z.string().nullable(),
    metadata: zod_1.z.record(zod_1.z.any()),
    created_at: zod_1.z.string().datetime(),
});
exports.PaymentHistorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organization_id: zod_1.z.string().uuid(),
    invoice_id: zod_1.z.string().uuid().nullable(),
    stripe_payment_intent_id: zod_1.z.string().nullable(),
    stripe_charge_id: zod_1.z.string().nullable(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
    status: exports.PaymentStatusEnum,
    payment_method_id: zod_1.z.string().uuid().nullable(),
    failure_code: zod_1.z.string().nullable(),
    failure_message: zod_1.z.string().nullable(),
    refunded_amount: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.any()),
    created_at: zod_1.z.string().datetime(),
});
// Input schemas for API operations
exports.CreateCheckoutSessionSchema = zod_1.z.object({
    priceId: zod_1.z.string(),
    successUrl: zod_1.z.string(),
    cancelUrl: zod_1.z.string(),
});
exports.CreatePortalSessionSchema = zod_1.z.object({
    returnUrl: zod_1.z.string(),
});
exports.UpdateSubscriptionSchema = zod_1.z.object({
    priceId: zod_1.z.string(),
    prorationBehavior: zod_1.z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
});
exports.CancelSubscriptionSchema = zod_1.z.object({
    cancelAtPeriodEnd: zod_1.z.boolean().default(true),
    reason: zod_1.z.string().optional(),
});
exports.AddPaymentMethodSchema = zod_1.z.object({
    paymentMethodId: zod_1.z.string(),
    setAsDefault: zod_1.z.boolean().default(false),
});
// Webhook event types
exports.StripeWebhookEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    data: zod_1.z.object({
        object: zod_1.z.record(zod_1.z.any()),
    }),
    created: zod_1.z.number(),
});
// Subscription features
exports.PlanFeatures = {
    starter: {
        watermark: true,
        exportFormats: ['png', 'jpg'],
        support: 'community',
        customBranding: false,
        apiAccess: false,
        sso: false,
        maxStorageGb: 5,
        maxRendersPerMonth: 25,
        renderResolution: 'standard',
        canvasSizeLimit: '2000x2000',
        versionHistoryDays: 7,
        prioritySupport: false,
        whiteLabel: false,
        bulkExport: false,
        advancedAnalytics: false,
        clientPortal: false,
        teamCollaboration: false,
    },
    professional: {
        watermark: false,
        exportFormats: ['png', 'jpg', 'svg', 'pdf'],
        support: 'email',
        customBranding: true,
        apiAccess: false,
        sso: false,
        maxStorageGb: 50,
        maxRendersPerMonth: 100,
        renderResolution: 'high',
        canvasSizeLimit: '5000x5000',
        versionHistoryDays: 30,
        prioritySupport: false,
        whiteLabel: false,
        bulkExport: true,
        advancedAnalytics: false,
        clientPortal: true,
        teamCollaboration: true,
    },
    growth: {
        watermark: false,
        exportFormats: ['png', 'jpg', 'svg', 'pdf', 'dxf'],
        support: 'priority',
        customBranding: true,
        apiAccess: true,
        sso: false,
        maxStorageGb: 200,
        maxRendersPerMonth: 500,
        renderResolution: 'ultra',
        canvasSizeLimit: '10000x10000',
        versionHistoryDays: 90,
        prioritySupport: true,
        whiteLabel: true,
        bulkExport: true,
        advancedAnalytics: true,
        clientPortal: true,
        teamCollaboration: true,
    },
    enterprise: {
        watermark: false,
        exportFormats: ['png', 'jpg', 'svg', 'pdf', 'dxf', 'dwg'],
        support: 'dedicated',
        customBranding: true,
        apiAccess: true,
        sso: true,
        maxStorageGb: -1, // Unlimited
        maxRendersPerMonth: -1, // Unlimited
        renderResolution: 'ultra',
        canvasSizeLimit: 'unlimited',
        versionHistoryDays: -1, // Unlimited
        prioritySupport: true,
        whiteLabel: true,
        bulkExport: true,
        advancedAnalytics: true,
        clientPortal: true,
        teamCollaboration: true,
        customContract: true,
        dedicatedAccountManager: true,
        sla: true,
        customIntegrations: true,
    },
};
// Plan limits type
exports.PlanLimitsSchema = zod_1.z.object({
    maxProjects: zod_1.z.number().nullable(),
    maxTeamMembers: zod_1.z.number().nullable(),
    maxStorageGb: zod_1.z.number(),
    maxRendersPerMonth: zod_1.z.number(),
    renderCreditsMonthly: zod_1.z.number(),
});
// Usage limit check result
exports.UsageLimitCheckSchema = zod_1.z.object({
    limit: zod_1.z.number(),
    usage: zod_1.z.number(),
    remaining: zod_1.z.number(),
    exceeded: zod_1.z.boolean(),
    percentage: zod_1.z.number(),
});
