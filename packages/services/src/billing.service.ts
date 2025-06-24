import { supabase } from '@terrashaper/db';
import {
  CustomerService,
  InvoiceService,
  PaymentService,
  PortalService,
  SubscriptionService,
} from '@terrashaper/stripe';
import type { Stripe } from 'stripe';

export interface BillingService {
  createCustomer(userId: string, email: string): Promise<Stripe.Customer>;
  getSubscription(customerId: string): Promise<Stripe.Subscription | null>;
  updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
  getUsage(customerId: string, period: { start: Date; end: Date }): Promise<UsageData>;
  createPaymentIntent(amount: number, customerId: string): Promise<Stripe.PaymentIntent>;
  getPlans(): Promise<SubscriptionPlan[]>;
  getCurrentSubscription(organizationId: string): Promise<CurrentSubscription | null>;
  getInvoices(customerId: string, limit?: number): Promise<Invoice[]>;
  getBillingAlerts(organizationId: string): Promise<BillingAlert[]>;
}

export interface UsageData {
  renders: { used: number; limit: number };
  storage: { used: number; limit: number };
  credits: { used: number; remaining: number };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  price_yearly?: number;
  stripe_price_id: string;
  render_credits_monthly: number;
  max_projects: number;
  max_team_members: number;
  features: Record<string, any>;
}

export interface CurrentSubscription {
  id: string;
  status: string;
  plan: SubscriptionPlan | null;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface Invoice {
  id: string;
  invoice_number?: string | null;
  stripe_invoice_id: string;
  created_at: string;
  amount_due: number;
  currency: string;
  status: string;
  stripe_hosted_invoice_url?: string | null;
  stripe_invoice_pdf?: string | null;
}

export interface BillingAlert {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
}

export class BillingServiceImpl implements BillingService {
  private customerService = new CustomerService();
  private subscriptionService = new SubscriptionService();
  private paymentService = new PaymentService();
  private invoiceService = new InvoiceService();
  private portalService = new PortalService();

  async createCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    return this.customerService.createCustomer({
      organizationId: userId, // Using userId as organizationId for compatibility
      email,
      metadata: { userId },
    });
  }

  async getSubscription(customerId: string): Promise<Stripe.Subscription | null> {
    // Note: This would need to be implemented differently as the stripe service
    // doesn't have a list method. For now, returning null
    // TODO: Implement proper subscription listing by customer
    return null;
  }

  async updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription> {
    return this.subscriptionService.updateSubscription(subscriptionId, {
      priceId,
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.subscriptionService.cancelSubscription(subscriptionId);
  }

  async getUsage(customerId: string, period: { start: Date; end: Date }): Promise<UsageData> {
    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('*, subscriptions(*)')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!org) {
      throw new Error('Organization not found');
    }

    // Get usage metrics
    const { data: renderUsage } = await supabase
      .from('renders')
      .select('id')
      .eq('organization_id', org.id)
      .gte('created_at', period.start.toISOString())
      .lte('created_at', period.end.toISOString());

    const { data: storageData } = await supabase.rpc('get_organization_storage_usage', {
      org_id: org.id,
    });

    const subscription = org.subscriptions?.[0];
    const plan = subscription?.subscription_plans;

    return {
      renders: {
        used: renderUsage?.length || 0,
        limit: plan?.render_credits_monthly || 0,
      },
      storage: {
        used: storageData?.total_bytes || 0,
        limit: plan?.max_storage_gb ? plan.max_storage_gb * 1024 * 1024 * 1024 : 0,
      },
      credits: {
        used: renderUsage?.length || 0,
        remaining: Math.max(0, (plan?.render_credits_monthly || 0) - (renderUsage?.length || 0)),
      },
    };
  }

  async createPaymentIntent(amount: number, customerId: string): Promise<Stripe.PaymentIntent> {
    return this.paymentService.createPaymentIntent({
      customerId,
      amount,
      currency: 'usd',
    });
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    return plans || [];
  }

  async getCurrentSubscription(organizationId: string): Promise<CurrentSubscription | null> {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (!org || !org.stripe_customer_id || !org.stripe_subscription_id) {
      return null;
    }

    const subscription = await this.subscriptionService.getSubscription(org.stripe_subscription_id);
    
    if (!subscription) {
      return null;
    }
    
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', (subscription as any).items.data[0]?.price.id)
      .single();

    return {
      id: subscription.id,
      status: subscription.status,
      plan: plan || null,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
    };
  }

  async getInvoices(customerId: string, limit: number = 10): Promise<Invoice[]> {
    const invoices = await this.invoiceService.listInvoices(customerId, {
      limit,
    });

    return invoices.map((invoice: any) => ({
      id: invoice.id,
      invoice_number: invoice.number,
      stripe_invoice_id: invoice.id,
      created_at: new Date(invoice.created * 1000).toISOString(),
      amount_due: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status || 'draft',
      stripe_hosted_invoice_url: invoice.hosted_invoice_url,
      stripe_invoice_pdf: invoice.invoice_pdf,
    }));
  }

  async getBillingAlerts(organizationId: string): Promise<BillingAlert[]> {
    const alerts: BillingAlert[] = [];

    // Get organization and subscription data
    const { data: org } = await supabase
      .from('organizations')
      .select('*, subscriptions(*, subscription_plans(*))')
      .eq('id', organizationId)
      .single();

    if (!org) return alerts;

    // Check for payment failures
    if (org.stripe_customer_id) {
      const invoices = await this.invoiceService.listInvoices(org.stripe_customer_id, {
        status: 'open',
      });

      if (invoices.some((inv: any) => inv.attempted && !inv.paid)) {
        alerts.push({
          id: 'payment_failed',
          type: 'payment_failed',
          severity: 'error',
          title: 'Payment Failed',
          message: 'Your last payment attempt failed. Please update your payment method.',
          action: {
            label: 'Update Payment Method',
            url: '/settings/billing/payment-methods',
          },
        });
      }
    }

    // Check subscription expiry
    const subscription = org.subscriptions?.[0];
    if (subscription && subscription.cancel_at_period_end) {
      const daysUntilExpiry = Math.ceil(
        (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 7) {
        alerts.push({
          id: 'subscription_expiring',
          type: 'subscription_expiring',
          severity: 'warning',
          title: 'Subscription Expiring Soon',
          message: `Your subscription will expire in ${daysUntilExpiry} days.`,
          action: {
            label: 'Renew Subscription',
            url: '/settings/billing',
          },
        });
      }
    }

    // Check usage limits
    const usage = await this.getUsage(org.stripe_customer_id!, {
      start: new Date(subscription?.current_period_start || Date.now()),
      end: new Date(),
    });

    const plan = subscription?.subscription_plans;
    if (plan && usage.renders.used >= plan.render_credits_monthly * 0.9) {
      alerts.push({
        id: 'usage_limit',
        type: 'usage_limit',
        severity: 'warning',
        title: 'Approaching Render Limit',
        message: `You've used ${usage.renders.used} of ${plan.render_credits_monthly} renders this month.`,
        action: {
          label: 'Upgrade Plan',
          url: '/settings/billing',
        },
      });
    }

    return alerts;
  }
}

export const billingService = new BillingServiceImpl();