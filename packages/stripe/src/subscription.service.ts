import { stripe } from './stripe-client';
import type { Stripe } from 'stripe';

export class SubscriptionService {
  /**
   * Create a new subscription for a customer
   */
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: params.trialDays,
      metadata: params.metadata,
    });

    return subscription;
  }

  /**
   * Retrieve a subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  /**
   * Update a subscription (change plan)
   */
  async updateSubscription(
    subscriptionId: string,
    params: {
      priceId?: string;
      quantity?: number;
      prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updateParams: Stripe.SubscriptionUpdateParams = {
      metadata: params.metadata,
      proration_behavior: params.prorationBehavior || 'create_prorations',
    };

    // If changing price, we need to update the subscription items
    if (params.priceId && subscription.items.data.length > 0) {
      updateParams.items = [
        {
          id: subscription.items.data[0].id,
          price: params.priceId,
          quantity: params.quantity,
        },
      ];
    }

    const updated = await stripe.subscriptions.update(subscriptionId, updateParams);
    return updated;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    params: {
      cancelAtPeriodEnd?: boolean;
      cancellationReason?: string;
    } = {}
  ): Promise<Stripe.Subscription> {
    if (params.cancelAtPeriodEnd) {
      // Cancel at end of billing period
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        cancellation_details: {
          comment: params.cancellationReason,
        },
      });
      return subscription;
    } else {
      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(subscriptionId, {
        cancellation_details: {
          comment: params.cancellationReason,
        },
      });
      return subscription;
    }
  }

  /**
   * Reactivate a canceled subscription (if still in period)
   */
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(
    subscriptionId: string,
    params: {
      behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
      resumes_at?: number;
    }
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: params.behavior,
        resumes_at: params.resumes_at,
      },
    });
    return subscription;
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
    });
    return subscription;
  }

  /**
   * List all subscriptions for a customer
   */
  async listSubscriptions(
    customerId: string,
    params: {
      status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'trialing';
      limit?: number;
    } = {}
  ): Promise<Stripe.Subscription[]> {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: params.status,
      limit: params.limit || 10,
    });

    return subscriptions.data;
  }

  /**
   * Get the active subscription for a customer
   */
  async getActiveSubscription(customerId: string): Promise<Stripe.Subscription | null> {
    const subscriptions = await this.listSubscriptions(customerId, { status: 'active' });
    return subscriptions.length > 0 ? subscriptions[0] : null;
  }

  /**
   * Create a subscription schedule for future changes
   */
  async createSubscriptionSchedule(params: {
    customerId: string;
    phases: Array<{
      priceId: string;
      quantity?: number;
      duration?: number; // in months
      trial?: boolean;
    }>;
    startDate?: number;
  }): Promise<Stripe.SubscriptionSchedule> {
    const phases = params.phases.map((phase, index) => ({
      items: [{ price: phase.priceId, quantity: phase.quantity || 1 }],
      iterations: phase.duration || 1,
      trial: phase.trial || false,
    }));

    const schedule = await stripe.subscriptionSchedules.create({
      customer: params.customerId,
      start_date: params.startDate || 'now',
      phases,
    });

    return schedule;
  }

  /**
   * Preview proration for a subscription change
   */
  async previewProration(
    subscriptionId: string,
    params: {
      priceId: string;
      quantity?: number;
    }
  ): Promise<Stripe.Invoice> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const items = [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
        quantity: params.quantity || 1,
      },
    ];

    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      subscription_items: items,
      subscription_proration_behavior: 'create_prorations',
    });

    return invoice as any;
  }
}
