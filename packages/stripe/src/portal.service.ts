import type { Stripe } from 'stripe';

import { stripe } from './stripe-client';

export class PortalService {
  /**
   * Create a customer portal session
   */
  async createPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return session;
  }

  /**
   * Configure the customer portal settings
   */
  async configurePortal(params: {
    businessProfile: {
      headline?: string;
      privacy_policy_url?: string;
      terms_of_service_url?: string;
    };
    features?: {
      customer_update?: {
        enabled: boolean;
        allowed_updates?: Array<'email' | 'tax_id' | 'address' | 'shipping' | 'phone' | 'name'>;
      };
      invoice_history?: {
        enabled: boolean;
      };
      payment_method_update?: {
        enabled: boolean;
      };
      subscription_cancel?: {
        enabled: boolean;
        mode?: 'at_period_end' | 'immediately';
        cancellation_reason?: {
          enabled: boolean;
          options: Array<
            'too_expensive' | 'missing_features' | 'switched_service' | 
            'unused' | 'customer_service' | 'too_complex' | 'low_quality' | 'other'
          >;
        };
      };
      subscription_pause?: {
        enabled: boolean;
      };
      subscription_update?: {
        enabled: boolean;
        default_allowed_updates?: Array<'price' | 'quantity' | 'promotion_code'>;
        proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
        products?: Array<{
          product: string;
          prices: Array<string>;
        }>;
      };
    };
  }): Promise<Stripe.BillingPortal.Configuration> {
    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: params.businessProfile,
      features: (params.features || {
        customer_update: {
          enabled: true,
          allowed_updates: ['email', 'address', 'phone', 'name'],
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'customer_service',
              'too_complex',
              'low_quality',
              'other',
            ],
          },
        },
        subscription_pause: {
          enabled: false,
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price'],
          proration_behavior: 'create_prorations',
          products: [],
        },
      }) as Stripe.BillingPortal.ConfigurationCreateParams['features'],
    });

    return configuration;
  }

  /**
   * Update portal configuration
   */
  async updatePortalConfiguration(
    configurationId: string,
    params: Partial<Stripe.BillingPortal.ConfigurationUpdateParams>
  ): Promise<Stripe.BillingPortal.Configuration> {
    const configuration = await stripe.billingPortal.configurations.update(
      configurationId,
      params
    );

    return configuration;
  }

  /**
   * List portal configurations
   */
  async listPortalConfigurations(params: {
    limit?: number;
    active?: boolean;
  } = {}): Promise<Stripe.BillingPortal.Configuration[]> {
    const configurations = await stripe.billingPortal.configurations.list({
      limit: params.limit || 10,
      active: params.active,
    });

    return configurations.data;
  }
}