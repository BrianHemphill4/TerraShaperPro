import Stripe, { Stripe as Stripe$1 } from 'stripe';

declare const stripe: Stripe;
declare const STRIPE_WEBHOOK_SECRET: string;

declare class CustomerService {
    /**
     * Create a new Stripe customer for an organization
     */
    createCustomer(params: {
        organizationId: string;
        email: string;
        name?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe$1.Customer>;
    /**
     * Retrieve a customer by Stripe customer ID
     */
    getCustomer(customerId: string): Promise<Stripe$1.Customer | null>;
    /**
     * Update customer details
     */
    updateCustomer(customerId: string, params: {
        email?: string;
        name?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe$1.Customer>;
    /**
     * Delete a customer (soft delete in Stripe)
     */
    deleteCustomer(customerId: string): Promise<Stripe$1.DeletedCustomer>;
    /**
     * List all payment methods for a customer
     */
    listPaymentMethods(customerId: string, type?: 'card' | 'us_bank_account'): Promise<Stripe$1.PaymentMethod[]>;
    /**
     * Get the default payment method for a customer
     */
    getDefaultPaymentMethod(customerId: string): Promise<Stripe$1.PaymentMethod | null>;
    /**
     * Set default payment method for a customer
     */
    setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe$1.Customer>;
    /**
     * Attach a payment method to a customer
     */
    attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe$1.PaymentMethod>;
    /**
     * Detach a payment method from a customer
     */
    detachPaymentMethod(paymentMethodId: string): Promise<Stripe$1.PaymentMethod>;
}

declare class SubscriptionService {
    /**
     * Create a new subscription for a customer
     */
    createSubscription(params: {
        customerId: string;
        priceId: string;
        trialDays?: number;
        metadata?: Record<string, string>;
    }): Promise<Stripe$1.Subscription>;
    /**
     * Retrieve a subscription
     */
    getSubscription(subscriptionId: string): Promise<Stripe$1.Subscription | null>;
    /**
     * Update a subscription (change plan)
     */
    updateSubscription(subscriptionId: string, params: {
        priceId?: string;
        quantity?: number;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
        metadata?: Record<string, string>;
    }): Promise<Stripe$1.Subscription>;
    /**
     * Cancel a subscription
     */
    cancelSubscription(subscriptionId: string, params?: {
        cancelAtPeriodEnd?: boolean;
        cancellationReason?: string;
    }): Promise<Stripe$1.Subscription>;
    /**
     * Reactivate a canceled subscription (if still in period)
     */
    reactivateSubscription(subscriptionId: string): Promise<Stripe$1.Subscription>;
    /**
     * Pause a subscription
     */
    pauseSubscription(subscriptionId: string, params: {
        behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
        resumes_at?: number;
    }): Promise<Stripe$1.Subscription>;
    /**
     * Resume a paused subscription
     */
    resumeSubscription(subscriptionId: string): Promise<Stripe$1.Subscription>;
    /**
     * List all subscriptions for a customer
     */
    listSubscriptions(customerId: string, params?: {
        status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'trialing';
        limit?: number;
    }): Promise<Stripe$1.Subscription[]>;
    /**
     * Get the active subscription for a customer
     */
    getActiveSubscription(customerId: string): Promise<Stripe$1.Subscription | null>;
    /**
     * Create a subscription schedule for future changes
     */
    createSubscriptionSchedule(params: {
        customerId: string;
        phases: Array<{
            priceId: string;
            quantity?: number;
            duration?: number;
            trial?: boolean;
        }>;
        startDate?: number;
    }): Promise<Stripe$1.SubscriptionSchedule>;
    /**
     * Preview proration for a subscription change
     */
    previewProration(subscriptionId: string, params: {
        priceId: string;
        quantity?: number;
    }): Promise<Stripe$1.Invoice>;
}

declare class PaymentService {
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
    }): Promise<Stripe$1.Checkout.Session>;
    /**
     * Create a setup intent for adding payment methods
     */
    createSetupIntent(params: {
        customerId: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe$1.SetupIntent>;
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
    }): Promise<Stripe$1.PaymentIntent>;
    /**
     * Confirm a payment intent
     */
    confirmPaymentIntent(paymentIntentId: string, params: {
        paymentMethodId?: string;
        returnUrl?: string;
    }): Promise<Stripe$1.PaymentIntent>;
    /**
     * Retrieve a payment intent
     */
    getPaymentIntent(paymentIntentId: string): Promise<Stripe$1.PaymentIntent | null>;
    /**
     * Create a refund
     */
    createRefund(params: {
        paymentIntentId?: string;
        chargeId?: string;
        amount?: number;
        reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
        metadata?: Record<string, string>;
    }): Promise<Stripe$1.Refund>;
    /**
     * List charges for a customer
     */
    listCharges(customerId: string, params?: {
        limit?: number;
        starting_after?: string;
    }): Promise<Stripe$1.Charge[]>;
    /**
     * Retrieve a charge
     */
    getCharge(chargeId: string): Promise<Stripe$1.Charge | null>;
}

declare class InvoiceService {
    /**
     * Retrieve an invoice
     */
    getInvoice(invoiceId: string): Promise<Stripe$1.Invoice | null>;
    /**
     * List invoices for a customer
     */
    listInvoices(customerId: string, params?: {
        status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
        limit?: number;
        starting_after?: string;
    }): Promise<Stripe$1.Invoice[]>;
    /**
     * Create a manual invoice
     */
    createInvoice(params: {
        customerId: string;
        description?: string;
        metadata?: Record<string, string>;
        auto_advance?: boolean;
    }): Promise<Stripe$1.Invoice>;
    /**
     * Add line items to an invoice
     */
    addInvoiceItem(params: {
        customerId: string;
        invoiceId?: string;
        amount: number;
        currency?: string;
        description: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe$1.InvoiceItem>;
    /**
     * Finalize an invoice (make it ready for payment)
     */
    finalizeInvoice(invoiceId: string, params?: {
        auto_advance?: boolean;
    }): Promise<Stripe$1.Invoice>;
    /**
     * Send an invoice to the customer
     */
    sendInvoice(invoiceId: string): Promise<Stripe$1.Invoice>;
    /**
     * Pay an invoice manually
     */
    payInvoice(invoiceId: string, params?: {
        paymentMethodId?: string;
        source?: string;
    }): Promise<Stripe$1.Invoice>;
    /**
     * Void an invoice
     */
    voidInvoice(invoiceId: string): Promise<Stripe$1.Invoice>;
    /**
     * Mark an invoice as uncollectible
     */
    markUncollectible(invoiceId: string): Promise<Stripe$1.Invoice>;
    /**
     * Retrieve upcoming invoice (preview next invoice)
     */
    getUpcomingInvoice(customerId: string, params?: {
        subscriptionId?: string;
    }): Promise<Stripe$1.UpcomingInvoice | null>;
    /**
     * Download invoice PDF
     */
    getInvoicePdfUrl(invoiceId: string): Promise<string | null>;
}

declare class PortalService {
    /**
     * Create a customer portal session
     */
    createPortalSession(params: {
        customerId: string;
        returnUrl: string;
    }): Promise<Stripe$1.BillingPortal.Session>;
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
    }): Promise<Stripe$1.BillingPortal.Configuration>;
    /**
     * Update portal configuration
     */
    updatePortalConfiguration(configurationId: string, params: Partial<Stripe$1.BillingPortal.ConfigurationUpdateParams>): Promise<Stripe$1.BillingPortal.Configuration>;
    /**
     * List portal configurations
     */
    listPortalConfigurations(params?: {
        limit?: number;
        active?: boolean;
    }): Promise<Stripe$1.BillingPortal.Configuration[]>;
}

declare class WebhookService {
    /**
     * Verify webhook signature and construct event
     */
    constructEvent(payload: string | Buffer, signature: string): Promise<Stripe$1.Event>;
    /**
     * Handle customer.created event
     */
    handleCustomerCreated(customer: Stripe$1.Customer): Promise<void>;
    /**
     * Handle customer.subscription.created event
     */
    handleSubscriptionCreated(subscription: Stripe$1.Subscription): Promise<void>;
    /**
     * Handle customer.subscription.updated event
     */
    handleSubscriptionUpdated(subscription: Stripe$1.Subscription): Promise<void>;
    /**
     * Handle customer.subscription.deleted event
     */
    handleSubscriptionDeleted(subscription: Stripe$1.Subscription): Promise<void>;
    /**
     * Handle invoice.paid event
     */
    handleInvoicePaid(invoice: Stripe$1.Invoice): Promise<void>;
    /**
     * Handle invoice.payment_failed event
     */
    handleInvoicePaymentFailed(invoice: Stripe$1.Invoice): Promise<void>;
    /**
     * Handle payment_intent.succeeded event
     */
    handlePaymentIntentSucceeded(paymentIntent: Stripe$1.PaymentIntent): Promise<void>;
    /**
     * Handle payment_method.attached event
     */
    handlePaymentMethodAttached(paymentMethod: Stripe$1.PaymentMethod): Promise<void>;
    /**
     * Main webhook handler
     */
    handleWebhook(event: Stripe$1.Event): Promise<void>;
}

export { CustomerService, InvoiceService, PaymentService, PortalService, STRIPE_WEBHOOK_SECRET, SubscriptionService, WebhookService, stripe };
