import { createAdminClient } from '@terrashaper/db';
import { WebhookService } from '@terrashaper/stripe';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

const webhookService = new WebhookService();
const supabase = createAdminClient();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = await webhookService.constructEvent(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { organizationId, userId } = session.metadata;

        // Update organization with subscription details
        if (session.subscription) {
          await supabase
            .from('organizations')
            .update({
              stripe_subscription_id: session.subscription,
              stripe_subscription_status: 'active',
            })
            .eq('id', organizationId);
        }

        // Log activity
        await supabase.from('activity_logs').insert({
          organization_id: organizationId,
          user_id: userId,
          action: 'org.subscription_changed',
          entity_type: 'subscription',
          metadata: {
            action: 'checkout_completed',
            subscriptionId: session.subscription,
          },
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (org) {
          // Determine tier from price ID
          const priceId = subscription.items.data[0]?.price.id;
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('tier')
            .eq('stripe_price_id', priceId)
            .single();

          await supabase
            .from('organizations')
            .update({
              stripe_subscription_id: subscription.id,
              stripe_subscription_status: subscription.status,
              subscription_tier: plan?.tier || 'free',
              stripe_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq('id', org.id);

          // Create subscription event
          await supabase.from('subscription_events').insert({
            organization_id: org.id,
            event_type: event.type === 'customer.subscription.created' ? 'created' : 'updated',
            to_tier: plan?.tier,
            to_status: subscription.status,
            metadata: { subscriptionId: subscription.id, priceId },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id, subscription_tier')
          .eq('stripe_customer_id', customerId)
          .single();

        if (org) {
          await supabase
            .from('organizations')
            .update({
              stripe_subscription_status: 'canceled',
              subscription_tier: 'free',
              stripe_subscription_id: null,
            })
            .eq('id', org.id);

          // Create subscription event
          await supabase.from('subscription_events').insert({
            organization_id: org.id,
            event_type: 'canceled',
            from_tier: org.subscription_tier,
            to_tier: 'free',
            from_status: 'active',
            to_status: 'canceled',
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (org) {
          // Save invoice to database
          await supabase.from('invoices').insert({
            organization_id: org.id,
            stripe_invoice_id: invoice.id,
            invoice_number: invoice.number,
            status: 'paid',
            amount_due: invoice.amount_due / 100, // Convert from cents
            amount_paid: invoice.amount_paid / 100,
            currency: invoice.currency,
            paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
            period_start: invoice.period_start
              ? new Date(invoice.period_start * 1000).toISOString()
              : null,
            period_end: invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : null,
            stripe_hosted_invoice_url: invoice.hosted_invoice_url,
            stripe_invoice_pdf: invoice.invoice_pdf,
          });

          // Add render credits for paid invoices
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('render_credits_monthly')
            .eq('stripe_price_id', invoice.lines.data[0]?.price.id)
            .single();

          if (plan?.render_credits_monthly) {
            await supabase
              .from('organizations')
              .update({
                render_credits: org.render_credits + plan.render_credits_monthly,
              })
              .eq('id', org.id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (org) {
          // Update subscription status
          await supabase
            .from('organizations')
            .update({
              stripe_subscription_status: 'past_due',
            })
            .eq('id', org.id);

          // Log the failed payment
          await supabase.from('payment_history').insert({
            organization_id: org.id,
            amount: invoice.amount_due / 100,
            currency: invoice.currency,
            status: 'failed',
            failure_message: 'Invoice payment failed',
            metadata: { invoiceId: invoice.id },
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const customerId = paymentIntent.customer;

        if (customerId) {
          // Get organization by customer ID
          const { data: org } = await supabase
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (org) {
            // Record successful payment
            await supabase.from('payment_history').insert({
              organization_id: org.id,
              stripe_payment_intent_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'succeeded',
              metadata: paymentIntent.metadata || {},
            });
          }
        }
        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as any;
        const customerId = paymentMethod.customer;

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (org) {
          // Save payment method
          await supabase.from('payment_methods').insert({
            organization_id: org.id,
            stripe_payment_method_id: paymentMethod.id,
            type: paymentMethod.type,
            brand: paymentMethod.card?.brand,
            last4: paymentMethod.card?.last4,
            exp_month: paymentMethod.card?.exp_month,
            exp_year: paymentMethod.card?.exp_year,
          });
        }
        break;
      }

      default:
        logger.warn('Unhandled Stripe webhook event', { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
