import type { Stripe } from 'stripe';
export declare class WebhookService {
    /**
     * Verify webhook signature and construct event
     */
    constructEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event>;
    /**
     * Handle customer.created event
     */
    handleCustomerCreated(customer: Stripe.Customer): Promise<void>;
    /**
     * Handle customer.subscription.created event
     */
    handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void>;
    /**
     * Handle customer.subscription.updated event
     */
    handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void>;
    /**
     * Handle customer.subscription.deleted event
     */
    handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void>;
    /**
     * Handle invoice.paid event
     */
    handleInvoicePaid(invoice: Stripe.Invoice): Promise<void>;
    /**
     * Handle invoice.payment_failed event
     */
    handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void>;
    /**
     * Handle payment_intent.succeeded event
     */
    handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void>;
    /**
     * Handle payment_method.attached event
     */
    handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void>;
    /**
     * Main webhook handler
     */
    handleWebhook(event: Stripe.Event): Promise<void>;
}
