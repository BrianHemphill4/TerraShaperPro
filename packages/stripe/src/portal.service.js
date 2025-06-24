"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalService = void 0;
const stripe_client_1 = require("./stripe-client");
class PortalService {
    /**
     * Create a customer portal session
     */
    async createPortalSession(params) {
        const session = await stripe_client_1.stripe.billingPortal.sessions.create({
            customer: params.customerId,
            return_url: params.returnUrl,
        });
        return session;
    }
    /**
     * Configure the customer portal settings
     */
    async configurePortal(params) {
        const configuration = await stripe_client_1.stripe.billingPortal.configurations.create({
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
            }),
        });
        return configuration;
    }
    /**
     * Update portal configuration
     */
    async updatePortalConfiguration(configurationId, params) {
        const configuration = await stripe_client_1.stripe.billingPortal.configurations.update(configurationId, params);
        return configuration;
    }
    /**
     * List portal configurations
     */
    async listPortalConfigurations(params = {}) {
        const configurations = await stripe_client_1.stripe.billingPortal.configurations.list({
            limit: params.limit || 10,
            active: params.active,
        });
        return configurations.data;
    }
}
exports.PortalService = PortalService;
