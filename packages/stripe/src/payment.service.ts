import { stripe } from './stripe-client';
import type { Stripe } from 'stripe';

export class PaymentService {
  /**
   * Create a checkout session for new subscriptions
   */
  async createCheckoutSession(params: {
    customerId?: string;
    customerEmail?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: params.priceId,
        quantity: 1,
      }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      subscription_data: {
        trial_period_days: params.trialDays,
      },
    };

    if (params.customerId) {
      sessionParams.customer = params.customerId;
    } else if (params.customerEmail) {
      sessionParams.customer_email = params.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return session;
  }

  /**
   * Create a setup intent for adding payment methods
   */
  async createSetupIntent(params: {
    customerId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.SetupIntent> {
    const setupIntent = await stripe.setupIntents.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      metadata: params.metadata,
    });

    return setupIntent;
  }

  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent(params: {
    customerId: string;
    amount: number;
    currency?: string;
    paymentMethodId?: string;
    confirm?: boolean;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
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
  async confirmPaymentIntent(
    paymentIntentId: string,
    params: {
      paymentMethodId?: string;
      returnUrl?: string;
    }
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: params.paymentMethodId,
      return_url: params.returnUrl,
    });

    return paymentIntent;
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(params: {
    paymentIntentId?: string;
    chargeId?: string;
    amount?: number;
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata?: Record<string, string>;
  }): Promise<Stripe.Refund> {
    const refundParams: Stripe.RefundCreateParams = {
      amount: params.amount,
      reason: params.reason,
      metadata: params.metadata,
    };

    if (params.paymentIntentId) {
      refundParams.payment_intent = params.paymentIntentId;
    } else if (params.chargeId) {
      refundParams.charge = params.chargeId;
    }

    const refund = await stripe.refunds.create(refundParams);
    return refund;
  }

  /**
   * List charges for a customer
   */
  async listCharges(
    customerId: string,
    params: {
      limit?: number;
      starting_after?: string;
    } = {}
  ): Promise<Stripe.Charge[]> {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: params.limit || 10,
      starting_after: params.starting_after,
    });

    return charges.data;
  }

  /**
   * Retrieve a charge
   */
  async getCharge(chargeId: string): Promise<Stripe.Charge | null> {
    try {
      const charge = await stripe.charges.retrieve(chargeId);
      return charge;
    } catch (error) {
      console.error('Error retrieving charge:', error);
      return null;
    }
  }
}