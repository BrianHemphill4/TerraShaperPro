# TerraShaper Pro API Documentation

## Overview

TerraShaper Pro provides a comprehensive tRPC API for integrating with our landscape design platform. This documentation covers authentication, endpoints, and usage examples.

## Base URL

```
Production: https://api.terrashaperpro.com/trpc
Development: http://localhost:3001/trpc
```

## Authentication

All API requests require authentication using Clerk JWT tokens.

### Headers
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Getting a Token
Tokens are automatically managed when using our SDK. For direct API access:
1. Sign in to TerraShaper Pro
2. Access your API settings
3. Generate an API key
4. Exchange API key for JWT token

## Rate Limiting

| Endpoint Type | Rate Limit | Window |
|--------------|------------|---------|
| Public endpoints | 20 req/min | 60s |
| Authenticated endpoints | 100 req/min | 60s |
| Render endpoints | 10 req/min | 60s |
| Upload endpoints | 5 req/5min | 300s |

## Response Format

All responses follow the tRPC format:

### Success Response
```json
{
  "result": {
    "data": {
      // Response data
    }
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Error description",
    "data": {
      "zodError": { /* Validation errors */ }
    }
  }
}
```

## Available Procedures

### Projects
- [project.list](./endpoints/project.md#list) - List all projects
- [project.get](./endpoints/project.md#get) - Get project details
- [project.create](./endpoints/project.md#create) - Create new project
- [project.update](./endpoints/project.md#update) - Update project
- [project.delete](./endpoints/project.md#delete) - Delete project

### Plants
- [plant.search](./endpoints/plant.md#search) - Search plant library
- [plant.get](./endpoints/plant.md#get) - Get plant details
- [plant.categories](./endpoints/plant.md#categories) - List categories

### Rendering
- [render.create](./endpoints/render.md#create) - Create render job
- [render.status](./endpoints/render.md#status) - Check render status
- [render.list](./endpoints/render.md#list) - List renders

### Teams
- [team.members](./endpoints/team.md#members) - List team members
- [team.invite](./endpoints/team.md#invite) - Invite member
- [team.remove](./endpoints/team.md#remove) - Remove member

### Storage
- [storage.upload](./endpoints/storage.md#upload) - Upload file
- [storage.list](./endpoints/storage.md#list) - List files
- [storage.delete](./endpoints/storage.md#delete) - Delete file

## Quick Start

### Using the tRPC Client

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@terrashaper/api-gateway';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://api.terrashaperpro.com/trpc',
      headers() {
        return {
          authorization: `Bearer ${getAuthToken()}`,
        };
      },
    }),
  ],
});

// List projects
const projects = await client.project.list.query({
  page: 1,
  limit: 20,
});

// Create a render
const render = await client.render.create.mutate({
  projectId: 'project-id',
  annotations: [...],
  settings: {
    resolution: '1920x1080',
    quality: 75,
  },
});
```

### Direct HTTP Requests

```bash
# List projects
curl -X POST https://api.terrashaperpro.com/trpc/project.list \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"json": {"page": 1, "limit": 20}}'

# Get plant details
curl -X POST https://api.terrashaperpro.com/trpc/plant.get \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"json": {"id": "plant-id"}}'
```

## Webhooks

Configure webhooks to receive real-time updates:

### Available Events
- `render.completed` - Render job finished
- `render.failed` - Render job failed
- `project.shared` - Project shared with you
- `team.invited` - Invited to team

### Webhook Payload
```json
{
  "event": "render.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "renderId": "render-123",
    "projectId": "project-456",
    "imageUrl": "https://...",
    "duration": 45000
  }
}
```

### Webhook Security
All webhooks include a signature header:
```
X-TerraShaper-Signature: sha256=<signature>
```

Verify using your webhook secret:
```typescript
const crypto = require('crypto');

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expected}` === signature;
}
```

## SDK

### Installation
```bash
npm install @terrashaper/sdk
```

### Usage
```typescript
import { TerraShaper } from '@terrashaper/sdk';

const client = new TerraShaper({
  apiKey: 'YOUR_API_KEY',
  environment: 'production', // or 'development'
});

// List projects
const projects = await client.projects.list();

// Create a render
const render = await client.renders.create({
  projectId: 'project-123',
  settings: {
    quality: 'high',
    resolution: '1920x1080',
  },
});

// Upload an image
const upload = await client.storage.upload({
  file: fileBuffer,
  type: 'project-asset',
});
```

## Error Codes

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid request parameters |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (e.g., duplicate) |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | Server error |

## Best Practices

1. **Batch Requests**: Use tRPC's batching to combine multiple requests
2. **Error Handling**: Always handle errors gracefully
3. **Rate Limiting**: Implement exponential backoff for retries
4. **Caching**: Cache responses when appropriate
5. **Pagination**: Use pagination for list endpoints

## Support

- **API Status**: [status.terrashaperpro.com](https://status.terrashaperpro.com)
- **Developer Forum**: [developers.terrashaperpro.com](https://developers.terrashaperpro.com)
- **Email**: api@terrashaperpro.com

---

*API Version: v1*  
*Last Updated: January 2024*