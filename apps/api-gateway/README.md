# API Gateway

Fastify-based backend service that provides a type-safe tRPC API for the TerraShaper Pro application.

## Purpose

- **API Layer**: Centralized backend-for-frontend exposing all business operations via tRPC
- **Authentication**: JWT validation and user/organization authorization
- **Business Orchestration**: Coordinates between services, databases, and external APIs
- **Input Validation**: Comprehensive request validation using Zod schemas
- **Real-time Communication**: WebSocket subscriptions for render progress and team updates

## Architecture

- **Framework**: Fastify with tRPC for type-safe APIs
- **Database**: Drizzle ORM with PostgreSQL (Supabase)
- **Queue**: BullMQ integration for background job dispatch
- **Authentication**: Clerk JWT validation
- **Monitoring**: Sentry error tracking and metrics collection

## Key Features

- Type-safe API endpoints with full TypeScript inference
- Rate limiting and usage enforcement by subscription tier
- Comprehensive input validation and sanitization
- Real-time subscriptions for live updates
- Integrated billing and credit system
- Team collaboration and permission management
- Security middleware with CORS, CSP, and request logging

## API Routes

- `/api/trpc/project.*` - Project CRUD operations
- `/api/trpc/render.*` - Render job management
- `/api/trpc/plant.*` - Plant database queries
- `/api/trpc/team.*` - Team and collaboration features
- `/api/trpc/billing.*` - Subscription and billing operations
- `/api/trpc/storage.*` - File upload and management

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run integration tests
npm run test:integration

# Type check
npm run typecheck

# Lint and format
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Authentication validation
- `REDIS_URL` - Queue and caching
- `SENTRY_DSN` - Error tracking
- `GOOGLE_CLOUD_CREDENTIALS` - Storage access

## Dependencies

- `@terrashaper/db` - Database schema and connections
- `@terrashaper/queue` - Background job management
- `@terrashaper/services` - Business logic layer
- `@terrashaper/shared` - Common types and utilities
- `@terrashaper/storage` - File and image management
- `@terrashaper/stripe` - Payment processing