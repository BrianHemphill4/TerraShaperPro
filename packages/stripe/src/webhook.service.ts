import { stripe, STRIPE_WEBHOOK_SECRET } from './stripe-client';
import type { Stripe } from 'stripe';
import { createServiceLogger } from '@terrashaper/shared';

const logger = createServiceLogger('stripe-webhook');

export class WebhookService {
  /**
   * Verify webhook signature and construct event
   */
  async constructEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', error as Error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle customer.created event
   */
  async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    logger.info('Customer created', { customerId: customer.id });
    // Update database with Stripe customer ID
  }

  /**
   * Handle customer.subscription.created event
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription created', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
    });
    // Update organization with subscription details
  }

  /**
   * Handle customer.subscription.updated event
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription updated', {
      subscriptionId: subscription.id,
      status: subscription.status,
    });
    // Update organization subscription status
  }

  /**
   * Handle customer.subscription.deleted event
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription deleted', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
    });
    // Handle subscription cancellation
  }

  /**
   * Handle invoice.paid event
   */
  async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Invoice paid', {
      invoiceId: invoice.id,
      amountPaid: invoice.amount_paid,
      customerId: invoice.customer,
    });
    // Record payment in database
  }

  /**
   * Handle invoice.payment_failed event
   */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.warn('Invoice payment failed', {
      invoiceId: invoice.id,
      attemptCount: invoice.attempt_count,
      customerId: invoice.customer,
    });
    // Handle failed payment
  }

  /**
   * Handle payment_intent.succeeded event
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info('Payment intent succeeded', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    });
    // Record successful payment
  }

  /**
   * Handle payment_method.attached event
   */
  async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    logger.info('Payment method attached', {
      paymentMethodId: paymentMethod.id,
      type: paymentMethod.type,
      customerId: paymentMethod.customer,
    });
    // Store payment method details
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.created':
        await this.handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_method.attached':
        await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case 'checkout.session.completed':
        // Handle checkout session completion
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info('Checkout session completed', {
          sessionId: session.id,
          customerId: session.customer,
        });
        break;

      default:
        logger.debug('Unhandled webhook event type', { eventType: event.type, eventId: event.id });
    }
  }
}
