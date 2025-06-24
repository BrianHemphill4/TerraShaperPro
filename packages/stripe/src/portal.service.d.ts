import type { Stripe } from 'stripe';
export declare class PortalService {
    /**
     * Create a customer portal session
     */
    createPortalSession(params: {
        customerId: string;
        returnUrl: string;
    }): Promise<Stripe.BillingPortal.Session>;
    /**
     * Configure the customer portal settings
     */
    configurePortal(params: {
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
                    options: Array<'too_expensive' | 'missing_features' | 'switched_service' | 'unused' | 'customer_service' | 'too_complex' | 'low_quality' | 'other'>;
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
    }): Promise<Stripe.BillingPortal.Configuration>;
    /**
     * Update portal configuration
     */
    updatePortalConfiguration(configurationId: string, params: Partial<Stripe.BillingPortal.ConfigurationUpdateParams>): Promise<Stripe.BillingPortal.Configuration>;
    /**
     * List portal configurations
     */
    listPortalConfigurations(params?: {
        limit?: number;
        active?: boolean;
    }): Promise<Stripe.BillingPortal.Configuration[]>;
}
