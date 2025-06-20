# Webhooks

Receive real-time notifications about events in your TerraShaper Pro account.

## Overview

Webhooks allow you to build integrations that subscribe to certain events. When one of those events is triggered, we'll send an HTTP POST payload to the webhook's configured URL.

## Setting Up Webhooks

### Via API

```typescript
// Create a webhook
const webhook = await client.webhooks.create.mutate({
  url: 'https://your-server.com/webhooks/terrashaper',
  events: ['render.completed', 'project.shared'],
  secret: 'your-webhook-secret',
  active: true
});

// List webhooks
const webhooks = await client.webhooks.list.query();

// Update webhook
await client.webhooks.update.mutate({
  id: 'webhook-id',
  events: ['render.completed', 'render.failed']
});

// Delete webhook
await client.webhooks.delete.mutate({
  id: 'webhook-id'
});
```

### Via Dashboard

1. Go to Settings → Developer → Webhooks
2. Click "Create Webhook"
3. Enter your endpoint URL
4. Select events to subscribe to
5. Save and copy the webhook secret

## Webhook Events

### Render Events

#### render.completed
Triggered when a render job completes successfully.

```json
{
  "id": "evt_1234567890",
  "type": "render.completed",
  "created": "2024-01-15T10:30:00Z",
  "data": {
    "renderId": "rnd_abc123",
    "projectId": "proj_xyz789",
    "userId": "user_123456",
    "organizationId": "org_789012",
    "status": "completed",
    "imageUrl": "https://storage.terrashaperpro.com/renders/...",
    "thumbnailUrl": "https://storage.terrashaperpro.com/thumbs/...",
    "resolution": "1920x1080",
    "fileSize": 2457600,
    "processingTime": 45000,
    "creditsUsed": 2,
    "qualityScore": 95
  }
}
```

#### render.failed
Triggered when a render job fails.

```json
{
  "id": "evt_1234567891",
  "type": "render.failed",
  "created": "2024-01-15T10:31:00Z",
  "data": {
    "renderId": "rnd_abc124",
    "projectId": "proj_xyz789",
    "userId": "user_123456",
    "organizationId": "org_789012",
    "status": "failed",
    "error": {
      "code": "PROVIDER_ERROR",
      "message": "Image generation failed",
      "details": "Invalid prompt format"
    },
    "creditsRefunded": 2,
    "retryable": true
  }
}
```

### Project Events

#### project.created
Triggered when a new project is created.

```json
{
  "id": "evt_1234567892",
  "type": "project.created",
  "created": "2024-01-15T10:32:00Z",
  "data": {
    "projectId": "proj_new123",
    "name": "Smith Residence",
    "createdBy": {
      "userId": "user_123456",
      "name": "John Designer"
    },
    "organizationId": "org_789012"
  }
}
```

#### project.shared
Triggered when a project is shared with you.

```json
{
  "id": "evt_1234567893",
  "type": "project.shared",
  "created": "2024-01-15T10:33:00Z",
  "data": {
    "projectId": "proj_xyz789",
    "projectName": "Garden Redesign",
    "sharedBy": {
      "userId": "user_654321",
      "name": "Jane Architect"
    },
    "sharedWith": {
      "userId": "user_123456",
      "email": "john@example.com"
    },
    "permission": "editor",
    "message": "Please review the latest changes"
  }
}
```

#### project.deleted
Triggered when a project is deleted.

```json
{
  "id": "evt_1234567894",
  "type": "project.deleted",
  "created": "2024-01-15T10:34:00Z",
  "data": {
    "projectId": "proj_old123",
    "name": "Old Project",
    "deletedBy": {
      "userId": "user_123456",
      "name": "John Designer"
    },
    "organizationId": "org_789012"
  }
}
```

### Team Events

#### team.member.invited
Triggered when a new team member is invited.

```json
{
  "id": "evt_1234567895",
  "type": "team.member.invited",
  "created": "2024-01-15T10:35:00Z",
  "data": {
    "invitationId": "inv_abc123",
    "email": "newdesigner@example.com",
    "role": "designer",
    "invitedBy": {
      "userId": "user_123456",
      "name": "John Admin"
    },
    "organizationId": "org_789012",
    "expiresAt": "2024-01-22T10:35:00Z"
  }
}
```

#### team.member.joined
Triggered when an invited member joins the team.

```json
{
  "id": "evt_1234567896",
  "type": "team.member.joined",
  "created": "2024-01-15T10:36:00Z",
  "data": {
    "userId": "user_newbie",
    "email": "newdesigner@example.com",
    "name": "New Designer",
    "role": "designer",
    "organizationId": "org_789012"
  }
}
```

### Billing Events

#### billing.payment.succeeded
Triggered when a payment is successful.

```json
{
  "id": "evt_1234567897",
  "type": "billing.payment.succeeded",
  "created": "2024-01-15T10:37:00Z",
  "data": {
    "paymentId": "pay_abc123",
    "amount": 9900,
    "currency": "usd",
    "description": "TerraShaper Pro - Professional Plan",
    "customerId": "cus_123456",
    "organizationId": "org_789012",
    "invoice": {
      "id": "inv_abc123",
      "url": "https://terrashaperpro.com/invoices/..."
    }
  }
}
```

#### billing.credits.low
Triggered when render credits are running low.

```json
{
  "id": "evt_1234567898",
  "type": "billing.credits.low",
  "created": "2024-01-15T10:38:00Z",
  "data": {
    "organizationId": "org_789012",
    "creditsRemaining": 5,
    "creditsUsedThisMonth": 95,
    "suggestedAction": "purchase_credits",
    "purchaseUrl": "https://terrashaperpro.com/credits"
  }
}
```

## Webhook Security

### Verifying Signatures

All webhook payloads include a signature in the `X-TerraShaper-Signature` header. Verify this signature to ensure the webhook is from TerraShaper Pro.

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Express.js example
app.post('/webhooks/terrashaper', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-terrashaper-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body);
  
  // Process the event
  switch (event.type) {
    case 'render.completed':
      handleRenderCompleted(event.data);
      break;
    // ... handle other events
  }
  
  res.status(200).send('OK');
});
```

### Best Practices

1. **Always verify signatures** to ensure webhooks are from TerraShaper Pro
2. **Use HTTPS** endpoints for webhook URLs
3. **Respond quickly** with a 2xx status code (process asynchronously if needed)
4. **Handle retries** - we'll retry failed webhooks up to 3 times
5. **Log events** for debugging and audit purposes
6. **Idempotency** - handle duplicate events gracefully

## Webhook Delivery

### Retry Policy

If your endpoint doesn't return a 2xx status code, we'll retry the webhook:
- 1st retry: After 1 minute
- 2nd retry: After 5 minutes
- 3rd retry: After 15 minutes

After 3 failed attempts, the webhook is marked as failed.

### Delivery Headers

All webhook requests include these headers:

```
X-TerraShaper-Signature: sha256=<signature>
X-TerraShaper-Event: <event-type>
X-TerraShaper-Delivery: <unique-delivery-id>
Content-Type: application/json
User-Agent: TerraShaper-Webhooks/1.0
```

### Testing Webhooks

Use our webhook testing tool in the dashboard:

1. Go to Settings → Developer → Webhooks
2. Click on your webhook
3. Click "Send Test Event"
4. Select event type and customize payload
5. Check your endpoint logs

You can also use [webhook.site](https://webhook.site) for testing during development.

## Event Types Reference

| Event | Description |
|-------|-------------|
| `render.completed` | Render job completed successfully |
| `render.failed` | Render job failed |
| `project.created` | New project created |
| `project.updated` | Project updated |
| `project.deleted` | Project deleted |
| `project.shared` | Project shared with user |
| `team.member.invited` | Team member invited |
| `team.member.joined` | Invited member joined |
| `team.member.removed` | Team member removed |
| `billing.payment.succeeded` | Payment successful |
| `billing.payment.failed` | Payment failed |
| `billing.credits.low` | Credits running low |
| `storage.limit.warning` | Storage limit warning |