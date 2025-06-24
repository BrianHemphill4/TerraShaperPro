'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.billingRouter = void 0;
const trpc_1 = require('../trpc');
const zod_1 = require('zod');
const server_1 = require('@trpc/server');
const shared_1 = require('@terrashaper/shared');
const stripe_1 = require('@terrashaper/stripe');
const customerService = new stripe_1.CustomerService();
const subscriptionService = new stripe_1.SubscriptionService();
const paymentService = new stripe_1.PaymentService();
const invoiceService = new stripe_1.InvoiceService();
const portalService = new stripe_1.PortalService();
exports.billingRouter = (0, trpc_1.router)({
  // Get subscription plans
  getPlans: trpc_1.publicProcedure.query(async ({ ctx }) => {
    const { data: plans } = await ctx.supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    return plans || [];
  }),
  // Get current subscription
  getCurrentSubscription: trpc_1.protectedProcedure.query(async ({ ctx }) => {
    const { data: org } = await ctx.supabase
      .from('organizations')
      .select('*')
      .eq('id', ctx.session.organizationId)
      .single();
    if (!org || !org.stripe_customer_id || !org.stripe_subscription_id) {
      return null;
    }
    try {
      const subscription = await subscriptionService.getSubscription(org.stripe_subscription_id);
      return subscription;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }),
  // Create checkout session for new subscription
  createCheckoutSession: trpc_1.protectedProcedure
    .input(shared_1.CreateCheckoutSessionSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();
      if (!currentUser || !(0, shared_1.hasPermission)(currentUser.role, 'admin')) {
        throw new server_1.TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can manage subscriptions',
        });
      }
      // Get or create Stripe customer
      const { data: org } = await ctx.supabase
        .from('organizations')
        .select('*')
        .eq('id', ctx.session.organizationId)
        .single();
      if (!org) {
        throw new server_1.TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }
      let customerId = org.stripe_customer_id;
      if (!customerId) {
        // Create Stripe customer
        const { data: user } = await ctx.supabase
          .from('users')
          .select('email, full_name')
          .eq('id', ctx.session.userId)
          .single();
        const customer = await customerService.createCustomer({
          organizationId: ctx.session.organizationId,
          email: user?.email || '',
          name: org.name,
          metadata: {
            organizationId: ctx.session.organizationId,
          },
        });
        customerId = customer.id;
        // Update organization with Stripe customer ID
        await ctx.supabase
          .from('organizations')
          .update({ stripe_customer_id: customerId })
          .eq('id', ctx.session.organizationId);
      }
      // Create checkout session
      const session = await paymentService.createCheckoutSession({
        customerId,
        priceId: input.priceId,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        metadata: {
          organizationId: ctx.session.organizationId,
          userId: ctx.session.userId,
        },
      });
      // Log activity
      await ctx.supabase.from('activity_logs').insert({
        organization_id: ctx.session.organizationId,
        user_id: ctx.session.userId,
        action: shared_1.ActivityActions.ORG_SUBSCRIPTION_CHANGED,
        entity_type: 'subscription',
        metadata: { action: 'checkout_started', priceId: input.priceId },
      });
      return {
        sessionId: session.id,
        url: session.url,
      };
    }),
  // Create customer portal session
  createPortalSession: trpc_1.protectedProcedure
    .input(shared_1.CreatePortalSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: org } = await ctx.supabase
        .from('organizations')
        .select('stripe_customer_id')
        .eq('id', ctx.session.organizationId)
        .single();
      if (!org?.stripe_customer_id) {
        throw new server_1.TRPCError({
          code: 'NOT_FOUND',
          message: 'No billing account found',
        });
      }
      const session = await portalService.createPortalSession({
        customerId: org.stripe_customer_id,
        returnUrl: input.returnUrl,
      });
      return {
        url: session.url,
      };
    }),
  // Update subscription (change plan)
  updateSubscription: trpc_1.protectedProcedure
    .input(shared_1.UpdateSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();
      if (!currentUser || !(0, shared_1.hasPermission)(currentUser.role, 'admin')) {
        throw new server_1.TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can manage subscriptions',
        });
      }
      const { data: org } = await ctx.supabase
        .from('organizations')
        .select('stripe_subscription_id, subscription_tier')
        .eq('id', ctx.session.organizationId)
        .single();
      if (!org?.stripe_subscription_id) {
        throw new server_1.TRPCError({
          code: 'NOT_FOUND',
          message: 'No active subscription found',
        });
      }
      // Update subscription
      const subscription = await subscriptionService.updateSubscription(
        org.stripe_subscription_id,
        {
          priceId: input.priceId,
          prorationBehavior: input.prorationBehavior,
        }
      );
      // Log activity
      await ctx.supabase.from('activity_logs').insert({
        organization_id: ctx.session.organizationId,
        user_id: ctx.session.userId,
        action: shared_1.ActivityActions.ORG_SUBSCRIPTION_CHANGED,
        entity_type: 'subscription',
        metadata: {
          action: 'plan_changed',
          newPriceId: input.priceId,
          oldTier: org.subscription_tier,
        },
      });
      return subscription;
    }),
  // Cancel subscription
  cancelSubscription: trpc_1.protectedProcedure
    .input(shared_1.CancelSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();
      if (!currentUser || !(0, shared_1.hasPermission)(currentUser.role, 'owner')) {
        throw new server_1.TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owners can cancel subscriptions',
        });
      }
      const { data: org } = await ctx.supabase
        .from('organizations')
        .select('stripe_subscription_id')
        .eq('id', ctx.session.organizationId)
        .single();
      if (!org?.stripe_subscription_id) {
        throw new server_1.TRPCError({
          code: 'NOT_FOUND',
          message: 'No active subscription found',
        });
      }
      // Cancel subscription
      const subscription = await subscriptionService.cancelSubscription(
        org.stripe_subscription_id,
        {
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
          cancellationReason: input.reason,
        }
      );
      // Update organization
      await ctx.supabase
        .from('organizations')
        .update({
          stripe_cancel_at: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : null,
          stripe_canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        })
        .eq('id', ctx.session.organizationId);
      // Log activity
      await ctx.supabase.from('activity_logs').insert({
        organization_id: ctx.session.organizationId,
        user_id: ctx.session.userId,
        action: shared_1.ActivityActions.ORG_SUBSCRIPTION_CHANGED,
        entity_type: 'subscription',
        metadata: {
          action: 'subscription_canceled',
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
          reason: input.reason,
        },
      });
      return subscription;
    }),
  // Get payment methods
  getPaymentMethods: trpc_1.protectedProcedure.query(async ({ ctx }) => {
    const { data: org } = await ctx.supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', ctx.session.organizationId)
      .single();
    if (!org?.stripe_customer_id) {
      return [];
    }
    const paymentMethods = await customerService.listPaymentMethods(org.stripe_customer_id);
    // Also get from database
    const { data: dbPaymentMethods } = await ctx.supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', ctx.session.organizationId)
      .order('created_at', { ascending: false });
    return paymentMethods.map((pm) => ({
      id: pm.id,
      type: pm.type,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault:
        dbPaymentMethods?.find((db) => db.stripe_payment_method_id === pm.id)?.is_default || false,
    }));
  }),
  // Add payment method
  addPaymentMethod: trpc_1.protectedProcedure
    .input(shared_1.AddPaymentMethodSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();
      if (!currentUser || !(0, shared_1.hasPermission)(currentUser.role, 'admin')) {
        throw new server_1.TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can manage payment methods',
        });
      }
      const { data: org } = await ctx.supabase
        .from('organizations')
        .select('stripe_customer_id')
        .eq('id', ctx.session.organizationId)
        .single();
      if (!org?.stripe_customer_id) {
        throw new server_1.TRPCError({
          code: 'NOT_FOUND',
          message: 'No billing account found',
        });
      }
      // Attach payment method to customer
      const paymentMethod = await customerService.attachPaymentMethod(
        org.stripe_customer_id,
        input.paymentMethodId
      );
      // Save to database
      await ctx.supabase.from('payment_methods').insert({
        organization_id: ctx.session.organizationId,
        stripe_payment_method_id: paymentMethod.id,
        type: paymentMethod.type,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year,
        is_default: input.setAsDefault,
      });
      if (input.setAsDefault) {
        await customerService.setDefaultPaymentMethod(org.stripe_customer_id, paymentMethod.id);
        // Update other payment methods to not be default
        await ctx.supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('organization_id', ctx.session.organizationId)
          .neq('stripe_payment_method_id', paymentMethod.id);
      }
      return paymentMethod;
    }),
  // Get invoices
  getInvoices: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(10),
        offset: zod_1.z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: invoices } = await ctx.supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', ctx.session.organizationId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);
      const { count } = await ctx.supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', ctx.session.organizationId);
      return {
        invoices: invoices || [],
        total: count || 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),
  // Get usage summary
  getUsageSummary: trpc_1.protectedProcedure.query(async ({ ctx }) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { data: usage } = await ctx.supabase
      .from('usage_records')
      .select('record_type, quantity')
      .eq('organization_id', ctx.session.organizationId)
      .gte('created_at', startOfMonth.toISOString());
    const summary = {
      renders: 0,
      storage: 0,
      apiCalls: 0,
    };
    usage?.forEach((record) => {
      switch (record.record_type) {
        case 'render':
          summary.renders += record.quantity;
          break;
        case 'storage':
          summary.storage += record.quantity;
          break;
        case 'api_call':
          summary.apiCalls += record.quantity;
          break;
      }
    });
    // Get organization limits
    const { data: org } = await ctx.supabase
      .from('organizations')
      .select('subscription_tier, render_credits')
      .eq('id', ctx.session.organizationId)
      .single();
    return {
      usage: summary,
      limits: {
        renders: org?.render_credits || 0,
        // Add other limits based on subscription tier
      },
      period: {
        start: startOfMonth.toISOString(),
        end: new Date().toISOString(),
      },
    };
  }),
  // Get subscription info for feature gating
  getSubscription: trpc_1.protectedProcedure.query(async ({ ctx }) => {
    const { data: org } = await ctx.supabase
      .from('organizations')
      .select(
        `
        *,
        subscription_plans!organizations_stripe_price_id_fkey (*)
      `
      )
      .eq('id', ctx.session.organizationId)
      .single();
    if (!org) {
      throw new server_1.TRPCError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      });
    }
    // Get current plan details
    let currentPlan = null;
    if (org.stripe_price_id) {
      const { data: plan } = await ctx.supabase
        .from('subscription_plans')
        .select('*')
        .eq('stripe_price_id', org.stripe_price_id)
        .single();
      currentPlan = plan;
    }
    // If no plan or inactive subscription, default to starter
    const effectiveTier =
      (org.stripe_subscription_status === 'active' && currentPlan?.tier) || 'starter';
    return {
      organization: org,
      subscription: {
        id: org.stripe_subscription_id,
        status: org.stripe_subscription_status || 'inactive',
        currentPeriodEnd: org.stripe_current_period_end,
        cancelAt: org.stripe_cancel_at,
        canceledAt: org.stripe_canceled_at,
        tier: effectiveTier,
        plan: currentPlan,
      },
    };
  }),
  // Check feature access
  checkFeature: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        feature: zod_1.z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: result } = await ctx.supabase.rpc('check_feature_access', {
        org_id: ctx.session.organizationId,
        feature_name: input.feature,
      });
      return {
        hasAccess: result || false,
        feature: input.feature,
      };
    }),
  // Check usage limit
  checkUsageLimit: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        limitType: zod_1.z.enum(['projects', 'team_members', 'renders', 'storage_gb']),
        currentUsage: zod_1.z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let usage = input.currentUsage;
      // Get current usage if not provided
      if (usage === undefined) {
        switch (input.limitType) {
          case 'projects': {
            const { count } = await ctx.supabase
              .from('projects')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', ctx.session.organizationId);
            usage = count || 0;
            break;
          }
          case 'team_members': {
            const { count } = await ctx.supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', ctx.session.organizationId);
            usage = count || 0;
            break;
          }
          case 'renders': {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const { data } = await ctx.supabase
              .from('usage_records')
              .select('quantity')
              .eq('organization_id', ctx.session.organizationId)
              .eq('record_type', 'render')
              .gte('created_at', startOfMonth.toISOString());
            usage = data?.reduce((sum, record) => sum + record.quantity, 0) || 0;
            break;
          }
          case 'storage_gb': {
            // This would need to be implemented with actual storage calculation
            usage = 0;
            break;
          }
        }
      }
      const { data: result } = await ctx.supabase.rpc('check_usage_limit', {
        org_id: ctx.session.organizationId,
        limit_type: input.limitType,
        current_usage: usage || 0,
      });
      return (
        result || {
          limit: 0,
          usage: usage || 0,
          remaining: 0,
          exceeded: true,
          percentage: 100,
        }
      );
    }),
  // Get current overage charges
  getCurrentOverages: trpc_1.protectedProcedure.query(async ({ ctx }) => {
    const { data: overages } = await ctx.supabase.rpc('get_current_overages', {
      p_organization_id: ctx.session.organizationId,
    });
    return overages || [];
  }),
  // Get overage history
  getOverageHistory: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(12),
        offset: zod_1.z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: charges, error } = await ctx.supabase
        .from('overage_charges')
        .select('*')
        .eq('organization_id', ctx.session.organizationId)
        .order('billing_period_start', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);
      if (error) {
        throw new server_1.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch overage history',
        });
      }
      const { count } = await ctx.supabase
        .from('overage_charges')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', ctx.session.organizationId);
      return {
        charges: charges || [],
        total: count || 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),
});
