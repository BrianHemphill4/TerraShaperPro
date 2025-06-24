# Stripe Package

Stripe integration providing customer lifecycle management, subscription billing, payment processing, and webhook handling.

## Purpose

- **Payment Processing**: Secure payment handling with PCI compliance
- **Subscription Management**: Recurring billing with multiple plan tiers
- **Customer Portal**: Self-service billing portal for customers
- **Usage Tracking**: Metered billing and overage handling
- **Webhook Processing**: Real-time event handling from Stripe

## Core Services

### CustomerService
Customer lifecycle management:

```typescript
import { CustomerService } from '@terrashaper/stripe'

const customerService = new CustomerService()

// Create customer
const customer = await customerService.createCustomer({
  email: 'user@example.com',
  name: 'John Doe',
  organizationId: 'org_123'
})

// Update customer
await customerService.updateCustomer(customerId, {
  email: 'newemail@example.com'
})
```

### SubscriptionService  
Subscription and plan management:

```typescript
import { SubscriptionService } from '@terrashaper/stripe'

const subscriptionService = new SubscriptionService()

// Create subscription
const subscription = await subscriptionService.createSubscription({
  customerId: 'cus_123',
  priceId: 'price_pro_monthly',
  organizationId: 'org_456'
})

// Upgrade/downgrade
await subscriptionService.changeSubscription(subscriptionId, {
  newPriceId: 'price_growth_monthly'
})
```

### PaymentService
Payment method and transaction handling:

```typescript
import { PaymentService } from '@terrashaper/stripe'

const paymentService = new PaymentService()

// Process payment
const paymentIntent = await paymentService.createPaymentIntent({
  amount: 2999, // $29.99
  currency: 'usd',
  customerId: 'cus_123'
})
```

### InvoiceService
Invoice generation and management:

```typescript
import { InvoiceService } from '@terrashaper/stripe'

const invoiceService = new InvoiceService()

// Create usage-based invoice
await invoiceService.createUsageRecord({
  subscriptionItemId: 'si_123',
  quantity: 25, // 25 renders this month
  action: 'increment'
})
```

## Subscription Tiers

### Starter Plan
- $19/month
- 50 renders included
- Basic features
- Email support

### Pro Plan  
- $49/month
- 200 renders included
- Advanced features
- Priority support

### Growth Plan
- $99/month
- 500 renders included
- Premium features
- Phone support

## Webhook Handling

```typescript
import { WebhookService } from '@terrashaper/stripe'

const webhookService = new WebhookService()

// Handle subscription events
webhookService.handleEvent('customer.subscription.updated', async (event) => {
  const subscription = event.data.object
  // Update local subscription data
})

webhookService.handleEvent('invoice.payment_succeeded', async (event) => {
  const invoice = event.data.object
  // Grant service access
})
```

## Usage Tracking

Metered billing for renders and storage:

```typescript
// Track render usage
await usageService.recordUsage({
  organizationId: 'org_123',
  feature: 'renders',
  quantity: 1,
  timestamp: new Date()
})

// Track storage usage  
await usageService.recordUsage({
  organizationId: 'org_123',
  feature: 'storage_gb',
  quantity: 0.5,
  timestamp: new Date()
})
```

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Test webhooks with Stripe CLI
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Type check
npm run typecheck
```

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_GROWTH=price_...
```

## Dependencies

- **Stripe**: Official Stripe SDK
- **@terrashaper/db**: Database integration
- **@terrashaper/shared**: Common types