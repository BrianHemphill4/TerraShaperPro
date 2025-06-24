import { z } from 'zod';

/**
 * Enum schema for subscription tiers available in the application.
 * Defines the hierarchy of subscription plans from starter to enterprise.
 */
export const SubscriptionTierEnum = z.enum(['starter', 'professional', 'growth', 'enterprise']);

/**
 * Type definition for subscription tiers.
 * Represents the different levels of service offering.
 */
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;

/**
 * Enum schema for subscription status values.
 * Covers all possible states a subscription can be in.
 */
export const SubscriptionStatusEnum = z.enum([
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
]);

/**
 * Type definition for subscription status.
 * Indicates the current state of a user's subscription.
 */
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

/**
 * Enum schema for payment status values.
 * Represents the outcome of payment processing attempts.
 */
export const PaymentStatusEnum = z.enum(['succeeded', 'failed', 'pending', 'refunded']);

/**
 * Type definition for payment status.
 * Indicates the result of a payment transaction.
 */
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

/**
 * Enum schema for invoice status values.
 * Tracks the lifecycle state of billing invoices.
 */
export const InvoiceStatusEnum = z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']);

/**
 * Type definition for invoice status.
 * Represents the current state of a billing invoice.
 */
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

/**
 * Zod schema for subscription plan data.
 * Defines the structure of a subscription plan with pricing and features.
 */
export const SubscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  stripe_price_id: z.string(),
  tier: SubscriptionTierEnum,
  price_monthly: z.number(),
  price_yearly: z.number().nullable(),
  render_credits_monthly: z.number(),
  max_projects: z.number().nullable(),
  max_team_members: z.number().nullable(),
  features: z.record(z.any()),
  is_active: z.boolean(),
});

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  stripe_payment_method_id: z.string(),
  type: z.string(),
  brand: z.string().nullable(),
  last4: z.string().nullable(),
  exp_month: z.number().nullable(),
  exp_year: z.number().nullable(),
  is_default: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  stripe_invoice_id: z.string(),
  invoice_number: z.string().nullable(),
  status: InvoiceStatusEnum,
  amount_due: z.number(),
  amount_paid: z.number(),
  currency: z.string(),
  due_date: z.string().datetime().nullable(),
  paid_at: z.string().datetime().nullable(),
  period_start: z.string().datetime().nullable(),
  period_end: z.string().datetime().nullable(),
  stripe_hosted_invoice_url: z.string().nullable(),
  stripe_invoice_pdf: z.string().nullable(),
  metadata: z.record(z.any()),
  created_at: z.string().datetime(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const PaymentHistorySchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  invoice_id: z.string().uuid().nullable(),
  stripe_payment_intent_id: z.string().nullable(),
  stripe_charge_id: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  status: PaymentStatusEnum,
  payment_method_id: z.string().uuid().nullable(),
  failure_code: z.string().nullable(),
  failure_message: z.string().nullable(),
  refunded_amount: z.number(),
  metadata: z.record(z.any()),
  created_at: z.string().datetime(),
});

export type PaymentHistory = z.infer<typeof PaymentHistorySchema>;

// Input schemas for API operations
export const CreateCheckoutSessionSchema = z.object({
  priceId: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;

export const CreatePortalSessionSchema = z.object({
  returnUrl: z.string(),
});

export type CreatePortalSessionInput = z.infer<typeof CreatePortalSessionSchema>;

export const UpdateSubscriptionSchema = z.object({
  priceId: z.string(),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
});

export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;

export const CancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
  reason: z.string().optional(),
});

export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionSchema>;

export const AddPaymentMethodSchema = z.object({
  paymentMethodId: z.string(),
  setAsDefault: z.boolean().default(false),
});

export type AddPaymentMethodInput = z.infer<typeof AddPaymentMethodSchema>;

// Webhook event types
export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.any()),
  }),
  created: z.number(),
});

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;

// Subscription features
export const PlanFeatures = {
  starter: {
    watermark: true,
    exportFormats: ['png', 'jpg'],
    support: 'community',
    customBranding: false,
    apiAccess: false,
    sso: false,
    maxStorageGb: 5,
    maxRendersPerMonth: 25,
    renderResolution: 'standard' as const,
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
    renderResolution: 'high' as const,
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
    renderResolution: 'ultra' as const,
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
    renderResolution: 'ultra' as const,
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
} as const;

// Plan limits type
export const PlanLimitsSchema = z.object({
  maxProjects: z.number().nullable(),
  maxTeamMembers: z.number().nullable(),
  maxStorageGb: z.number(),
  maxRendersPerMonth: z.number(),
  renderCreditsMonthly: z.number(),
});

export type PlanLimits = z.infer<typeof PlanLimitsSchema>;

// Usage limit check result
export const UsageLimitCheckSchema = z.object({
  limit: z.number(),
  usage: z.number(),
  remaining: z.number(),
  exceeded: z.boolean(),
  percentage: z.number(),
});

export type UsageLimitCheck = z.infer<typeof UsageLimitCheckSchema>;
