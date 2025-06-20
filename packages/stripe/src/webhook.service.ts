import { stripe, STRIPE_WEBHOOK_SECRET } from './stripe-client';
import type { Stripe } from 'stripe';

export class WebhookService {
  /**
   * Verify webhook signature and construct event
   */
  async constructEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle customer.created event
   */
  async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    console.log('Customer created:', customer.id);
    // Update database with Stripe customer ID
  }

  /**
   * Handle customer.subscription.created event
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription created:', subscription.id);
    // Update organization with subscription details
  }

  /**
   * Handle customer.subscription.updated event
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription updated:', subscription.id);
    // Update organization subscription status
  }

  /**
   * Handle customer.subscription.deleted event
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription deleted:', subscription.id);
    // Handle subscription cancellation
  }

  /**
   * Handle invoice.paid event
   */
  async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice paid:', invoice.id);
    // Record payment in database
  }

  /**
   * Handle invoice.payment_failed event
   */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment failed:', invoice.id);
    // Handle failed payment
  }

  /**
   * Handle payment_intent.succeeded event
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment intent succeeded:', paymentIntent.id);
    // Record successful payment
  }

  /**
   * Handle payment_method.attached event
   */
  async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    console.log('Payment method attached:', paymentMethod.id);
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
        console.log('Checkout session completed:', session.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}