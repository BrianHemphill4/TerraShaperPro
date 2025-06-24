"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_client_1 = require("./stripe-client");
class PaymentService {
    /**
     * Create a checkout session for new subscriptions
     */
    async createCheckoutSession(params) {
        const sessionParams = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
            subscription_data: {
                trial_period_days: params.trialDays,
            },
        };
        if (params.customerId) {
            sessionParams.customer = params.customerId;
        }
        else if (params.customerEmail) {
            sessionParams.customer_email = params.customerEmail;
        }
        const session = await stripe_client_1.stripe.checkout.sessions.create(sessionParams);
        return session;
    }
    /**
     * Create a setup intent for adding payment methods
     */
    async createSetupIntent(params) {
        const setupIntent = await stripe_client_1.stripe.setupIntents.create({
            customer: params.customerId,
            payment_method_types: ['card'],
            metadata: params.metadata,
        });
        return setupIntent;
    }
    /**
     * Create a payment intent for one-time payments
     */
    async createPaymentIntent(params) {
        const paymentIntent = await stripe_client_1.stripe.paymentIntents.create({
            customer: params.customerId,
            amount: params.amount,
            currency: params.currency || 'usd',
            payment_method: params.paymentMethodId,
            confirm: params.confirm,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: params.metadata,
        });
        return paymentIntent;
    }
    /**
     * Confirm a payment intent
     */
    async confirmPaymentIntent(paymentIntentId, params) {
        const paymentIntent = await stripe_client_1.stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: params.paymentMethodId,
            return_url: params.returnUrl,
        });
        return paymentIntent;
    }
    /**
     * Retrieve a payment intent
     */
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe_client_1.stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            console.error('Error retrieving payment intent:', error);
            return null;
        }
    }
    /**
     * Create a refund
     */
    async createRefund(params) {
        const refundParams = {
            amount: params.amount,
            reason: params.reason,
            metadata: params.metadata,
        };
        if (params.paymentIntentId) {
            refundParams.payment_intent = params.paymentIntentId;
        }
        else if (params.chargeId) {
            refundParams.charge = params.chargeId;
        }
        const refund = await stripe_client_1.stripe.refunds.create(refundParams);
        return refund;
    }
    /**
     * List charges for a customer
     */
    async listCharges(customerId, params = {}) {
        const charges = await stripe_client_1.stripe.charges.list({
            customer: customerId,
            limit: params.limit || 10,
            starting_after: params.starting_after,
        });
        return charges.data;
    }
    /**
     * Retrieve a charge
     */
    async getCharge(chargeId) {
        try {
            const charge = await stripe_client_1.stripe.charges.retrieve(chargeId);
            return charge;
        }
        catch (error) {
            console.error('Error retrieving charge:', error);
            return null;
        }
    }
}
exports.PaymentService = PaymentService;
