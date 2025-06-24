import type { Stripe } from 'stripe';
export declare class SubscriptionService {
    /**
     * Create a new subscription for a customer
     */
    createSubscription(params: {
        customerId: string;
        priceId: string;
        trialDays?: number;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Subscription>;
    /**
     * Retrieve a subscription
     */
    getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null>;
    /**
     * Update a subscription (change plan)
     */
    updateSubscription(subscriptionId: string, params: {
        priceId?: string;
        quantity?: number;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
        metadata?: Record<string, string>;
    }): Promise<Stripe.Subscription>;
    /**
     * Cancel a subscription
     */
    cancelSubscription(subscriptionId: string, params?: {
        cancelAtPeriodEnd?: boolean;
        cancellationReason?: string;
    }): Promise<Stripe.Subscription>;
    /**
     * Reactivate a canceled subscription (if still in period)
     */
    reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
    /**
     * Pause a subscription
     */
    pauseSubscription(subscriptionId: string, params: {
        behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
        resumes_at?: number;
    }): Promise<Stripe.Subscription>;
    /**
     * Resume a paused subscription
     */
    resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
    /**
     * List all subscriptions for a customer
     */
    listSubscriptions(customerId: string, params?: {
        status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'trialing';
        limit?: number;
    }): Promise<Stripe.Subscription[]>;
    /**
     * Get the active subscription for a customer
     */
    getActiveSubscription(customerId: string): Promise<Stripe.Subscription | null>;
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
    }): Promise<Stripe.SubscriptionSchedule>;
    /**
     * Preview proration for a subscription change
     */
    previewProration(subscriptionId: string, params: {
        priceId: string;
        quantity?: number;
    }): Promise<Stripe.Invoice>;
}
