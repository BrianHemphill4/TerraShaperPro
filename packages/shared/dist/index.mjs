// src/types/team.ts
import { z } from "zod";
var UserRoleEnum = z.enum(["owner", "admin", "designer", "member", "viewer"]);
var UserSchema = z.object({
  id: z.string().uuid(),
  clerk_id: z.string(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  organization_id: z.string().uuid(),
  role: UserRoleEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});
var InvitationSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleEnum,
  invited_by: z.string().uuid(),
  token: z.string(),
  expires_at: z.string().datetime(),
  accepted_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});
var ActivityLogSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().uuid().nullable(),
  metadata: z.record(z.any()).default({}),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string().datetime()
});
var CreateInvitationSchema = z.object({
  email: z.string().email(),
  role: UserRoleEnum
});
var UpdateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: UserRoleEnum
});
var AcceptInvitationSchema = z.object({
  token: z.string()
});
var roleHierarchy = {
  owner: 5,
  admin: 4,
  designer: 3,
  member: 2,
  viewer: 1
};
function hasPermission(userRole, requiredRole) {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
var ActivityActions = {
  // User management
  USER_INVITED: "user.invited",
  USER_JOINED: "user.joined",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_REMOVED: "user.removed",
  // Project actions
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_DELETED: "project.deleted",
  PROJECT_SHARED: "project.shared",
  // Render actions
  RENDER_STARTED: "render.started",
  RENDER_COMPLETED: "render.completed",
  RENDER_FAILED: "render.failed",
  // Organization actions
  ORG_SETTINGS_UPDATED: "org.settings_updated",
  ORG_SUBSCRIPTION_CHANGED: "org.subscription_changed"
};

// src/types/client-portal.ts
import { z as z2 } from "zod";
var ClientPermissionsSchema = z2.object({
  view: z2.boolean().default(true),
  comment: z2.boolean().default(true),
  approve: z2.boolean().default(false)
});
var ClientAccessLinkSchema = z2.object({
  id: z2.string().uuid(),
  project_id: z2.string().uuid(),
  created_by: z2.string().uuid(),
  token: z2.string(),
  client_email: z2.string().email().nullable(),
  client_name: z2.string().nullable(),
  permissions: ClientPermissionsSchema,
  expires_at: z2.string().datetime().nullable(),
  last_accessed_at: z2.string().datetime().nullable(),
  access_count: z2.number().int().default(0),
  is_active: z2.boolean().default(true),
  created_at: z2.string().datetime(),
  updated_at: z2.string().datetime()
});
var ApprovalStatusEnum = z2.enum(["pending", "approved", "rejected", "revision_requested"]);
var ProjectApprovalSchema = z2.object({
  id: z2.string().uuid(),
  project_id: z2.string().uuid(),
  version_id: z2.string().uuid().nullable(),
  requested_by: z2.string().uuid(),
  approved_by: z2.string().nullable(),
  client_access_link_id: z2.string().uuid().nullable(),
  status: ApprovalStatusEnum,
  notes: z2.string().nullable(),
  approved_at: z2.string().datetime().nullable(),
  created_at: z2.string().datetime(),
  updated_at: z2.string().datetime()
});
var CommentPositionSchema = z2.object({
  x: z2.number(),
  y: z2.number()
});
var ProjectCommentSchema = z2.object({
  id: z2.string().uuid(),
  project_id: z2.string().uuid(),
  parent_id: z2.string().uuid().nullable(),
  author_id: z2.string().uuid().nullable(),
  author_email: z2.string().email().nullable(),
  author_name: z2.string().nullable(),
  client_access_link_id: z2.string().uuid().nullable(),
  content: z2.string(),
  position: CommentPositionSchema.nullable(),
  attachments: z2.array(z2.any()).default([]),
  is_resolved: z2.boolean().default(false),
  resolved_by: z2.string().uuid().nullable(),
  resolved_at: z2.string().datetime().nullable(),
  created_at: z2.string().datetime(),
  updated_at: z2.string().datetime()
});
var CreateClientAccessLinkSchema = z2.object({
  projectId: z2.string().uuid(),
  clientEmail: z2.string().email().optional(),
  clientName: z2.string().optional(),
  permissions: ClientPermissionsSchema.optional(),
  expiresIn: z2.number().int().optional()
  // Hours until expiration
});
var CreateProjectApprovalSchema = z2.object({
  projectId: z2.string().uuid(),
  versionId: z2.string().uuid().optional(),
  notes: z2.string().optional()
});
var UpdateApprovalStatusSchema = z2.object({
  approvalId: z2.string().uuid(),
  status: ApprovalStatusEnum,
  notes: z2.string().optional()
});
var CreateProjectCommentSchema = z2.object({
  projectId: z2.string().uuid(),
  content: z2.string(),
  parentId: z2.string().uuid().optional(),
  position: CommentPositionSchema.optional(),
  clientAccessToken: z2.string().optional()
  // For client comments
});
var ResolveCommentSchema = z2.object({
  commentId: z2.string().uuid(),
  resolved: z2.boolean()
});

// src/types/billing.ts
import { z as z3 } from "zod";
var SubscriptionTierEnum = z3.enum(["starter", "professional", "growth", "enterprise"]);
var SubscriptionStatusEnum = z3.enum([
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid"
]);
var PaymentStatusEnum = z3.enum(["succeeded", "failed", "pending", "refunded"]);
var InvoiceStatusEnum = z3.enum(["draft", "open", "paid", "void", "uncollectible"]);
var SubscriptionPlanSchema = z3.object({
  id: z3.string().uuid(),
  name: z3.string(),
  stripe_price_id: z3.string(),
  tier: SubscriptionTierEnum,
  price_monthly: z3.number(),
  price_yearly: z3.number().nullable(),
  render_credits_monthly: z3.number(),
  max_projects: z3.number().nullable(),
  max_team_members: z3.number().nullable(),
  features: z3.record(z3.any()),
  is_active: z3.boolean()
});
var PaymentMethodSchema = z3.object({
  id: z3.string().uuid(),
  organization_id: z3.string().uuid(),
  stripe_payment_method_id: z3.string(),
  type: z3.string(),
  brand: z3.string().nullable(),
  last4: z3.string().nullable(),
  exp_month: z3.number().nullable(),
  exp_year: z3.number().nullable(),
  is_default: z3.boolean(),
  created_at: z3.string().datetime(),
  updated_at: z3.string().datetime()
});
var InvoiceSchema = z3.object({
  id: z3.string().uuid(),
  organization_id: z3.string().uuid(),
  stripe_invoice_id: z3.string(),
  invoice_number: z3.string().nullable(),
  status: InvoiceStatusEnum,
  amount_due: z3.number(),
  amount_paid: z3.number(),
  currency: z3.string(),
  due_date: z3.string().datetime().nullable(),
  paid_at: z3.string().datetime().nullable(),
  period_start: z3.string().datetime().nullable(),
  period_end: z3.string().datetime().nullable(),
  stripe_hosted_invoice_url: z3.string().nullable(),
  stripe_invoice_pdf: z3.string().nullable(),
  metadata: z3.record(z3.any()),
  created_at: z3.string().datetime()
});
var PaymentHistorySchema = z3.object({
  id: z3.string().uuid(),
  organization_id: z3.string().uuid(),
  invoice_id: z3.string().uuid().nullable(),
  stripe_payment_intent_id: z3.string().nullable(),
  stripe_charge_id: z3.string().nullable(),
  amount: z3.number(),
  currency: z3.string(),
  status: PaymentStatusEnum,
  payment_method_id: z3.string().uuid().nullable(),
  failure_code: z3.string().nullable(),
  failure_message: z3.string().nullable(),
  refunded_amount: z3.number(),
  metadata: z3.record(z3.any()),
  created_at: z3.string().datetime()
});
var CreateCheckoutSessionSchema = z3.object({
  priceId: z3.string(),
  successUrl: z3.string(),
  cancelUrl: z3.string()
});
var CreatePortalSessionSchema = z3.object({
  returnUrl: z3.string()
});
var UpdateSubscriptionSchema = z3.object({
  priceId: z3.string(),
  prorationBehavior: z3.enum(["create_prorations", "none", "always_invoice"]).optional()
});
var CancelSubscriptionSchema = z3.object({
  cancelAtPeriodEnd: z3.boolean().default(true),
  reason: z3.string().optional()
});
var AddPaymentMethodSchema = z3.object({
  paymentMethodId: z3.string(),
  setAsDefault: z3.boolean().default(false)
});
var StripeWebhookEventSchema = z3.object({
  id: z3.string(),
  type: z3.string(),
  data: z3.object({
    object: z3.record(z3.any())
  }),
  created: z3.number()
});
var PlanFeatures = {
  starter: {
    watermark: true,
    exportFormats: ["png", "jpg"],
    support: "community",
    customBranding: false,
    apiAccess: false,
    sso: false,
    maxStorageGb: 5,
    maxRendersPerMonth: 25,
    renderResolution: "standard",
    canvasSizeLimit: "2000x2000",
    versionHistoryDays: 7,
    prioritySupport: false,
    whiteLabel: false,
    bulkExport: false,
    advancedAnalytics: false,
    clientPortal: false,
    teamCollaboration: false
  },
  professional: {
    watermark: false,
    exportFormats: ["png", "jpg", "svg", "pdf"],
    support: "email",
    customBranding: true,
    apiAccess: false,
    sso: false,
    maxStorageGb: 50,
    maxRendersPerMonth: 100,
    renderResolution: "high",
    canvasSizeLimit: "5000x5000",
    versionHistoryDays: 30,
    prioritySupport: false,
    whiteLabel: false,
    bulkExport: true,
    advancedAnalytics: false,
    clientPortal: true,
    teamCollaboration: true
  },
  growth: {
    watermark: false,
    exportFormats: ["png", "jpg", "svg", "pdf", "dxf"],
    support: "priority",
    customBranding: true,
    apiAccess: true,
    sso: false,
    maxStorageGb: 200,
    maxRendersPerMonth: 500,
    renderResolution: "ultra",
    canvasSizeLimit: "10000x10000",
    versionHistoryDays: 90,
    prioritySupport: true,
    whiteLabel: true,
    bulkExport: true,
    advancedAnalytics: true,
    clientPortal: true,
    teamCollaboration: true
  },
  enterprise: {
    watermark: false,
    exportFormats: ["png", "jpg", "svg", "pdf", "dxf", "dwg"],
    support: "dedicated",
    customBranding: true,
    apiAccess: true,
    sso: true,
    maxStorageGb: -1,
    // Unlimited
    maxRendersPerMonth: -1,
    // Unlimited
    renderResolution: "ultra",
    canvasSizeLimit: "unlimited",
    versionHistoryDays: -1,
    // Unlimited
    prioritySupport: true,
    whiteLabel: true,
    bulkExport: true,
    advancedAnalytics: true,
    clientPortal: true,
    teamCollaboration: true,
    customContract: true,
    dedicatedAccountManager: true,
    sla: true,
    customIntegrations: true
  }
};
var PlanLimitsSchema = z3.object({
  maxProjects: z3.number().nullable(),
  maxTeamMembers: z3.number().nullable(),
  maxStorageGb: z3.number(),
  maxRendersPerMonth: z3.number(),
  renderCreditsMonthly: z3.number()
});
var UsageLimitCheckSchema = z3.object({
  limit: z3.number(),
  usage: z3.number(),
  remaining: z3.number(),
  exceeded: z3.boolean(),
  percentage: z3.number()
});

// src/types/onboarding.ts
var ONBOARDING_FLOWS = {
  INITIAL_SETUP: "initial-setup",
  DASHBOARD_TOUR: "dashboard-tour",
  DESIGN_CANVAS_INTRO: "design-canvas-intro",
  DRAWING_TOOLS: "drawing-tools",
  PLANT_LIBRARY: "plant-library",
  LAYERS_AND_PROPERTIES: "layers-and-properties",
  EXPORT_AND_SHARE: "export-and-share"
};

// src/services/feature-gate.service.ts
var FeatureGateService = class {
  /**
   * Check if a feature is available for a given subscription tier
   */
  static hasFeature(tier, featureName) {
    const currentTier = tier || "starter";
    const features = PlanFeatures[currentTier];
    if (!features) {
      return false;
    }
    const featureValue = features[featureName];
    if (typeof featureValue === "boolean") {
      return featureValue;
    }
    if (typeof featureValue === "number") {
      return featureValue > 0 || featureValue === -1;
    }
    if (typeof featureValue === "string") {
      return featureValue.length > 0;
    }
    if (Array.isArray(featureValue)) {
      return featureValue.length > 0;
    }
    return featureValue != null;
  }
  /**
   * Check if a usage limit is exceeded
   */
  static checkUsageLimit(tier, limitType, currentUsage) {
    const currentTier = tier || "starter";
    const features = PlanFeatures[currentTier];
    if (!features) {
      return {
        limit: 0,
        usage: currentUsage,
        remaining: 0,
        exceeded: true,
        percentage: 100
      };
    }
    const limit = features[limitType];
    const isUnlimited = limit === -1;
    return {
      limit,
      usage: currentUsage,
      remaining: isUnlimited ? -1 : Math.max(0, limit - currentUsage),
      exceeded: !isUnlimited && currentUsage > limit,
      percentage: isUnlimited ? 0 : Math.round(currentUsage / limit * 100)
    };
  }
  /**
   * Get all features for a given tier
   */
  static getFeaturesForTier(tier) {
    const currentTier = tier || "starter";
    return PlanFeatures[currentTier] || PlanFeatures.starter;
  }
  /**
   * Compare features between two tiers
   */
  static compareFeatures(fromTier, toTier) {
    const fromFeatures = PlanFeatures[fromTier];
    const toFeatures = PlanFeatures[toTier];
    const comparison = [];
    const allFeatureKeys = /* @__PURE__ */ new Set([
      ...Object.keys(fromFeatures),
      ...Object.keys(toFeatures)
    ]);
    for (const key of allFeatureKeys) {
      const fromValue = fromFeatures[key];
      const toValue = toFeatures[key];
      let isUpgrade = false;
      if (typeof fromValue === "boolean" && typeof toValue === "boolean") {
        isUpgrade = !fromValue && toValue;
      } else if (typeof fromValue === "number" && typeof toValue === "number") {
        isUpgrade = toValue > fromValue || toValue === -1 && fromValue !== -1;
      } else if (Array.isArray(fromValue) && Array.isArray(toValue)) {
        isUpgrade = toValue.length > fromValue.length;
      } else if (typeof fromValue === "string" && typeof toValue === "string") {
        if (key === "support") {
          const supportLevels = ["community", "email", "priority", "dedicated"];
          isUpgrade = supportLevels.indexOf(toValue) > supportLevels.indexOf(fromValue);
        } else if (key === "renderResolution") {
          const resolutionLevels = ["standard", "high", "ultra"];
          isUpgrade = resolutionLevels.indexOf(toValue) > resolutionLevels.indexOf(fromValue);
        }
      }
      comparison.push({
        feature: key,
        from: fromValue,
        to: toValue,
        isUpgrade
      });
    }
    return comparison;
  }
  /**
   * Get tier ranking (for upgrade/downgrade logic)
   */
  static getTierRank(tier) {
    const ranks = {
      starter: 0,
      professional: 1,
      growth: 2,
      enterprise: 3
    };
    return ranks[tier] ?? 0;
  }
  /**
   * Check if moving from one tier to another is an upgrade
   */
  static isUpgrade(fromTier, toTier) {
    return this.getTierRank(toTier) > this.getTierRank(fromTier);
  }
  /**
   * Get available export formats for a tier
   */
  static getExportFormats(tier) {
    const features = this.getFeaturesForTier(tier);
    return [...features.exportFormats || ["png", "jpg"]];
  }
  /**
   * Check if a specific export format is available
   */
  static canExportFormat(tier, format) {
    const formats = this.getExportFormats(tier);
    return formats.includes(format.toLowerCase());
  }
  /**
   * Get render resolution for a tier
   */
  static getRenderResolution(tier) {
    const features = this.getFeaturesForTier(tier);
    return features.renderResolution || "standard";
  }
  /**
   * Check if a feature requires a specific minimum tier
   */
  static getMinimumTierForFeature(featureName) {
    const tiers = ["starter", "professional", "growth", "enterprise"];
    for (const tier of tiers) {
      if (this.hasFeature(tier, featureName)) {
        return tier;
      }
    }
    return null;
  }
};
export {
  AcceptInvitationSchema,
  ActivityActions,
  ActivityLogSchema,
  AddPaymentMethodSchema,
  ApprovalStatusEnum,
  CancelSubscriptionSchema,
  ClientAccessLinkSchema,
  ClientPermissionsSchema,
  CommentPositionSchema,
  CreateCheckoutSessionSchema,
  CreateClientAccessLinkSchema,
  CreateInvitationSchema,
  CreatePortalSessionSchema,
  CreateProjectApprovalSchema,
  CreateProjectCommentSchema,
  FeatureGateService,
  InvitationSchema,
  InvoiceSchema,
  InvoiceStatusEnum,
  ONBOARDING_FLOWS,
  PaymentHistorySchema,
  PaymentMethodSchema,
  PaymentStatusEnum,
  PlanFeatures,
  PlanLimitsSchema,
  ProjectApprovalSchema,
  ProjectCommentSchema,
  ResolveCommentSchema,
  StripeWebhookEventSchema,
  SubscriptionPlanSchema,
  SubscriptionStatusEnum,
  SubscriptionTierEnum,
  UpdateApprovalStatusSchema,
  UpdateSubscriptionSchema,
  UpdateUserRoleSchema,
  UsageLimitCheckSchema,
  UserRoleEnum,
  UserSchema,
  hasPermission,
  roleHierarchy
};
//# sourceMappingURL=index.mjs.map