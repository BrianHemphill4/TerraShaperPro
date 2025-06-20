"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AcceptInvitationSchema: () => AcceptInvitationSchema,
  ActivityActions: () => ActivityActions,
  ActivityLogSchema: () => ActivityLogSchema,
  AddPaymentMethodSchema: () => AddPaymentMethodSchema,
  ApprovalStatusEnum: () => ApprovalStatusEnum,
  CancelSubscriptionSchema: () => CancelSubscriptionSchema,
  ClientAccessLinkSchema: () => ClientAccessLinkSchema,
  ClientPermissionsSchema: () => ClientPermissionsSchema,
  CommentPositionSchema: () => CommentPositionSchema,
  CreateCheckoutSessionSchema: () => CreateCheckoutSessionSchema,
  CreateClientAccessLinkSchema: () => CreateClientAccessLinkSchema,
  CreateInvitationSchema: () => CreateInvitationSchema,
  CreatePortalSessionSchema: () => CreatePortalSessionSchema,
  CreateProjectApprovalSchema: () => CreateProjectApprovalSchema,
  CreateProjectCommentSchema: () => CreateProjectCommentSchema,
  FeatureGateService: () => FeatureGateService,
  InvitationSchema: () => InvitationSchema,
  InvoiceSchema: () => InvoiceSchema,
  InvoiceStatusEnum: () => InvoiceStatusEnum,
  ONBOARDING_FLOWS: () => ONBOARDING_FLOWS,
  PaymentHistorySchema: () => PaymentHistorySchema,
  PaymentMethodSchema: () => PaymentMethodSchema,
  PaymentStatusEnum: () => PaymentStatusEnum,
  PlanFeatures: () => PlanFeatures,
  PlanLimitsSchema: () => PlanLimitsSchema,
  ProjectApprovalSchema: () => ProjectApprovalSchema,
  ProjectCommentSchema: () => ProjectCommentSchema,
  ResolveCommentSchema: () => ResolveCommentSchema,
  StripeWebhookEventSchema: () => StripeWebhookEventSchema,
  SubscriptionPlanSchema: () => SubscriptionPlanSchema,
  SubscriptionStatusEnum: () => SubscriptionStatusEnum,
  SubscriptionTierEnum: () => SubscriptionTierEnum,
  UpdateApprovalStatusSchema: () => UpdateApprovalStatusSchema,
  UpdateSubscriptionSchema: () => UpdateSubscriptionSchema,
  UpdateUserRoleSchema: () => UpdateUserRoleSchema,
  UsageLimitCheckSchema: () => UsageLimitCheckSchema,
  UserRoleEnum: () => UserRoleEnum,
  UserSchema: () => UserSchema,
  hasPermission: () => hasPermission,
  roleHierarchy: () => roleHierarchy
});
module.exports = __toCommonJS(index_exports);

// src/types/team.ts
var import_zod = require("zod");
var UserRoleEnum = import_zod.z.enum(["owner", "admin", "designer", "member", "viewer"]);
var UserSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  clerk_id: import_zod.z.string(),
  email: import_zod.z.string().email(),
  full_name: import_zod.z.string().nullable(),
  organization_id: import_zod.z.string().uuid(),
  role: UserRoleEnum,
  created_at: import_zod.z.string().datetime(),
  updated_at: import_zod.z.string().datetime()
});
var InvitationSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  organization_id: import_zod.z.string().uuid(),
  email: import_zod.z.string().email(),
  role: UserRoleEnum,
  invited_by: import_zod.z.string().uuid(),
  token: import_zod.z.string(),
  expires_at: import_zod.z.string().datetime(),
  accepted_at: import_zod.z.string().datetime().nullable(),
  created_at: import_zod.z.string().datetime(),
  updated_at: import_zod.z.string().datetime()
});
var ActivityLogSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  organization_id: import_zod.z.string().uuid(),
  user_id: import_zod.z.string().uuid().nullable(),
  action: import_zod.z.string(),
  entity_type: import_zod.z.string(),
  entity_id: import_zod.z.string().uuid().nullable(),
  metadata: import_zod.z.record(import_zod.z.any()).default({}),
  ip_address: import_zod.z.string().nullable(),
  user_agent: import_zod.z.string().nullable(),
  created_at: import_zod.z.string().datetime()
});
var CreateInvitationSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  role: UserRoleEnum
});
var UpdateUserRoleSchema = import_zod.z.object({
  userId: import_zod.z.string().uuid(),
  role: UserRoleEnum
});
var AcceptInvitationSchema = import_zod.z.object({
  token: import_zod.z.string()
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
var import_zod2 = require("zod");
var ClientPermissionsSchema = import_zod2.z.object({
  view: import_zod2.z.boolean().default(true),
  comment: import_zod2.z.boolean().default(true),
  approve: import_zod2.z.boolean().default(false)
});
var ClientAccessLinkSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  project_id: import_zod2.z.string().uuid(),
  created_by: import_zod2.z.string().uuid(),
  token: import_zod2.z.string(),
  client_email: import_zod2.z.string().email().nullable(),
  client_name: import_zod2.z.string().nullable(),
  permissions: ClientPermissionsSchema,
  expires_at: import_zod2.z.string().datetime().nullable(),
  last_accessed_at: import_zod2.z.string().datetime().nullable(),
  access_count: import_zod2.z.number().int().default(0),
  is_active: import_zod2.z.boolean().default(true),
  created_at: import_zod2.z.string().datetime(),
  updated_at: import_zod2.z.string().datetime()
});
var ApprovalStatusEnum = import_zod2.z.enum(["pending", "approved", "rejected", "revision_requested"]);
var ProjectApprovalSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  project_id: import_zod2.z.string().uuid(),
  version_id: import_zod2.z.string().uuid().nullable(),
  requested_by: import_zod2.z.string().uuid(),
  approved_by: import_zod2.z.string().nullable(),
  client_access_link_id: import_zod2.z.string().uuid().nullable(),
  status: ApprovalStatusEnum,
  notes: import_zod2.z.string().nullable(),
  approved_at: import_zod2.z.string().datetime().nullable(),
  created_at: import_zod2.z.string().datetime(),
  updated_at: import_zod2.z.string().datetime()
});
var CommentPositionSchema = import_zod2.z.object({
  x: import_zod2.z.number(),
  y: import_zod2.z.number()
});
var ProjectCommentSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  project_id: import_zod2.z.string().uuid(),
  parent_id: import_zod2.z.string().uuid().nullable(),
  author_id: import_zod2.z.string().uuid().nullable(),
  author_email: import_zod2.z.string().email().nullable(),
  author_name: import_zod2.z.string().nullable(),
  client_access_link_id: import_zod2.z.string().uuid().nullable(),
  content: import_zod2.z.string(),
  position: CommentPositionSchema.nullable(),
  attachments: import_zod2.z.array(import_zod2.z.any()).default([]),
  is_resolved: import_zod2.z.boolean().default(false),
  resolved_by: import_zod2.z.string().uuid().nullable(),
  resolved_at: import_zod2.z.string().datetime().nullable(),
  created_at: import_zod2.z.string().datetime(),
  updated_at: import_zod2.z.string().datetime()
});
var CreateClientAccessLinkSchema = import_zod2.z.object({
  projectId: import_zod2.z.string().uuid(),
  clientEmail: import_zod2.z.string().email().optional(),
  clientName: import_zod2.z.string().optional(),
  permissions: ClientPermissionsSchema.optional(),
  expiresIn: import_zod2.z.number().int().optional()
  // Hours until expiration
});
var CreateProjectApprovalSchema = import_zod2.z.object({
  projectId: import_zod2.z.string().uuid(),
  versionId: import_zod2.z.string().uuid().optional(),
  notes: import_zod2.z.string().optional()
});
var UpdateApprovalStatusSchema = import_zod2.z.object({
  approvalId: import_zod2.z.string().uuid(),
  status: ApprovalStatusEnum,
  notes: import_zod2.z.string().optional()
});
var CreateProjectCommentSchema = import_zod2.z.object({
  projectId: import_zod2.z.string().uuid(),
  content: import_zod2.z.string(),
  parentId: import_zod2.z.string().uuid().optional(),
  position: CommentPositionSchema.optional(),
  clientAccessToken: import_zod2.z.string().optional()
  // For client comments
});
var ResolveCommentSchema = import_zod2.z.object({
  commentId: import_zod2.z.string().uuid(),
  resolved: import_zod2.z.boolean()
});

// src/types/billing.ts
var import_zod3 = require("zod");
var SubscriptionTierEnum = import_zod3.z.enum(["starter", "professional", "growth", "enterprise"]);
var SubscriptionStatusEnum = import_zod3.z.enum([
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid"
]);
var PaymentStatusEnum = import_zod3.z.enum(["succeeded", "failed", "pending", "refunded"]);
var InvoiceStatusEnum = import_zod3.z.enum(["draft", "open", "paid", "void", "uncollectible"]);
var SubscriptionPlanSchema = import_zod3.z.object({
  id: import_zod3.z.string().uuid(),
  name: import_zod3.z.string(),
  stripe_price_id: import_zod3.z.string(),
  tier: SubscriptionTierEnum,
  price_monthly: import_zod3.z.number(),
  price_yearly: import_zod3.z.number().nullable(),
  render_credits_monthly: import_zod3.z.number(),
  max_projects: import_zod3.z.number().nullable(),
  max_team_members: import_zod3.z.number().nullable(),
  features: import_zod3.z.record(import_zod3.z.any()),
  is_active: import_zod3.z.boolean()
});
var PaymentMethodSchema = import_zod3.z.object({
  id: import_zod3.z.string().uuid(),
  organization_id: import_zod3.z.string().uuid(),
  stripe_payment_method_id: import_zod3.z.string(),
  type: import_zod3.z.string(),
  brand: import_zod3.z.string().nullable(),
  last4: import_zod3.z.string().nullable(),
  exp_month: import_zod3.z.number().nullable(),
  exp_year: import_zod3.z.number().nullable(),
  is_default: import_zod3.z.boolean(),
  created_at: import_zod3.z.string().datetime(),
  updated_at: import_zod3.z.string().datetime()
});
var InvoiceSchema = import_zod3.z.object({
  id: import_zod3.z.string().uuid(),
  organization_id: import_zod3.z.string().uuid(),
  stripe_invoice_id: import_zod3.z.string(),
  invoice_number: import_zod3.z.string().nullable(),
  status: InvoiceStatusEnum,
  amount_due: import_zod3.z.number(),
  amount_paid: import_zod3.z.number(),
  currency: import_zod3.z.string(),
  due_date: import_zod3.z.string().datetime().nullable(),
  paid_at: import_zod3.z.string().datetime().nullable(),
  period_start: import_zod3.z.string().datetime().nullable(),
  period_end: import_zod3.z.string().datetime().nullable(),
  stripe_hosted_invoice_url: import_zod3.z.string().nullable(),
  stripe_invoice_pdf: import_zod3.z.string().nullable(),
  metadata: import_zod3.z.record(import_zod3.z.any()),
  created_at: import_zod3.z.string().datetime()
});
var PaymentHistorySchema = import_zod3.z.object({
  id: import_zod3.z.string().uuid(),
  organization_id: import_zod3.z.string().uuid(),
  invoice_id: import_zod3.z.string().uuid().nullable(),
  stripe_payment_intent_id: import_zod3.z.string().nullable(),
  stripe_charge_id: import_zod3.z.string().nullable(),
  amount: import_zod3.z.number(),
  currency: import_zod3.z.string(),
  status: PaymentStatusEnum,
  payment_method_id: import_zod3.z.string().uuid().nullable(),
  failure_code: import_zod3.z.string().nullable(),
  failure_message: import_zod3.z.string().nullable(),
  refunded_amount: import_zod3.z.number(),
  metadata: import_zod3.z.record(import_zod3.z.any()),
  created_at: import_zod3.z.string().datetime()
});
var CreateCheckoutSessionSchema = import_zod3.z.object({
  priceId: import_zod3.z.string(),
  successUrl: import_zod3.z.string(),
  cancelUrl: import_zod3.z.string()
});
var CreatePortalSessionSchema = import_zod3.z.object({
  returnUrl: import_zod3.z.string()
});
var UpdateSubscriptionSchema = import_zod3.z.object({
  priceId: import_zod3.z.string(),
  prorationBehavior: import_zod3.z.enum(["create_prorations", "none", "always_invoice"]).optional()
});
var CancelSubscriptionSchema = import_zod3.z.object({
  cancelAtPeriodEnd: import_zod3.z.boolean().default(true),
  reason: import_zod3.z.string().optional()
});
var AddPaymentMethodSchema = import_zod3.z.object({
  paymentMethodId: import_zod3.z.string(),
  setAsDefault: import_zod3.z.boolean().default(false)
});
var StripeWebhookEventSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  type: import_zod3.z.string(),
  data: import_zod3.z.object({
    object: import_zod3.z.record(import_zod3.z.any())
  }),
  created: import_zod3.z.number()
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
var PlanLimitsSchema = import_zod3.z.object({
  maxProjects: import_zod3.z.number().nullable(),
  maxTeamMembers: import_zod3.z.number().nullable(),
  maxStorageGb: import_zod3.z.number(),
  maxRendersPerMonth: import_zod3.z.number(),
  renderCreditsMonthly: import_zod3.z.number()
});
var UsageLimitCheckSchema = import_zod3.z.object({
  limit: import_zod3.z.number(),
  usage: import_zod3.z.number(),
  remaining: import_zod3.z.number(),
  exceeded: import_zod3.z.boolean(),
  percentage: import_zod3.z.number()
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.js.map