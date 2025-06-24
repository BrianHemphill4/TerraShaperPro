import type { Stripe } from 'stripe';
export declare class PaymentService {
    /**
     * Create a checkout session for new subscriptions
     */
    createCheckoutSession(params: {
        customerId?: string;
        customerEmail?: string;
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        trialDays?: number;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Checkout.Session>;
    /**
     * Create a setup intent for adding payment methods
     */
    createSetupIntent(params: {
        customerId: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.SetupIntent>;
    /**
     * Create a payment intent for one-time payments
     */
    createPaymentIntent(params: {
        customerId: string;
        amount: number;
        currency?: string;
        paymentMethodId?: string;
        confirm?: boolean;
        metadata?: Record<string, string>;
    }): Promise<Stripe.PaymentIntent>;
    /**
     * Confirm a payment intent
     */
    confirmPaymentIntent(paymentIntentId: string, params: {
        paymentMethodId?: string;
        returnUrl?: string;
    }): Promise<Stripe.PaymentIntent>;
    /**
     * Retrieve a payment intent
     */
    getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null>;
    /**
     * Create a refund
     */
    createRefund(params: {
        paymentIntentId?: string;
        chargeId?: string;
        amount?: number;
        reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
        metadata?: Record<string, string>;
    }): Promise<Stripe.Refund>;
    /**
     * List charges for a customer
     */
    listCharges(customerId: string, params?: {
        limit?: number;
        starting_after?: string;
    }): Promise<Stripe.Charge[]>;
    /**
     * Retrieve a charge
     */
    getCharge(chargeId: string): Promise<Stripe.Charge | null>;
}
