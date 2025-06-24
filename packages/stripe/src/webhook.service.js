"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const stripe_client_1 = require("./stripe-client");
const shared_1 = require("@terrashaper/shared");
const logger = (0, shared_1.createServiceLogger)('stripe-webhook');
class WebhookService {
    /**
     * Verify webhook signature and construct event
     */
    async constructEvent(payload, signature) {
        try {
            const event = stripe_client_1.stripe.webhooks.constructEvent(payload, signature, stripe_client_1.STRIPE_WEBHOOK_SECRET);
            return event;
        }
        catch (error) {
            logger.error('Webhook signature verification failed', error);
            throw new Error('Invalid webhook signature');
        }
    }
    /**
     * Handle customer.created event
     */
    async handleCustomerCreated(customer) {
        logger.info('Customer created', { customerId: customer.id });
        // Update database with Stripe customer ID
    }
    /**
     * Handle customer.subscription.created event
     */
    async handleSubscriptionCreated(subscription) {
        logger.info('Subscription created', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
        });
        // Update organization with subscription details
    }
    /**
     * Handle customer.subscription.updated event
     */
    async handleSubscriptionUpdated(subscription) {
        logger.info('Subscription updated', {
            subscriptionId: subscription.id,
            status: subscription.status,
        });
        // Update organization subscription status
    }
    /**
     * Handle customer.subscription.deleted event
     */
    async handleSubscriptionDeleted(subscription) {
        logger.info('Subscription deleted', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
        });
        // Handle subscription cancellation
    }
    /**
     * Handle invoice.paid event
     */
    async handleInvoicePaid(invoice) {
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
    async handleInvoicePaymentFailed(invoice) {
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
    async handlePaymentIntentSucceeded(paymentIntent) {
        logger.info('Payment intent succeeded', {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
        });
        // Record successful payment
    }
    /**
     * Handle payment_method.attached event
     */
    async handlePaymentMethodAttached(paymentMethod) {
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
    async handleWebhook(event) {
        switch (event.type) {
            case 'customer.created':
                await this.handleCustomerCreated(event.data.object);
                break;
            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.paid':
                await this.handleInvoicePaid(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await this.handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_method.attached':
                await this.handlePaymentMethodAttached(event.data.object);
                break;
            case 'checkout.session.completed':
                // Handle checkout session completion
                const session = event.data.object;
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
exports.WebhookService = WebhookService;
