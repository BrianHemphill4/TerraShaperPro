# TerraShaperPro

AI-powered landscape design SaaS for Texas contractors. Features sub-60-second 4K renders using Google Imagen and OpenAI image generation.

## Monorepo Structure

This project is organized as a monorepo with the following structure:

### Apps
- **`apps/web`** – Customer-facing Next.js 14 application that contains the landscape design canvas, user dashboard, landing & marketing pages, and all client-side logic.
- **`apps/api-gateway`** – Fastify server that exposes a type-safe tRPC API. Acts as the backend-for-frontend, handling authentication/authorization, input validation, business orchestration, and real-time subscriptions.
- **`apps/render-worker`** – Background BullMQ worker that dequeues render jobs from Redis, invokes AI providers (Google Imagen, OpenAI) to generate 4K images, stores the artefacts in Google Cloud Storage, and publishes status events.

### Packages
- **`packages/ui`** – Reusable React components and the TerraShaper Pro design system built with Tailwind & Radix primitives. Used by `apps/web` and Storybook.
- **`packages/hooks`** – Type-safe React hooks for API calls, form handling, feature flags, and performance instrumentation.
- **`packages/services`** – Stateless business logic (auth, billing, render, team) that can run in both the API gateway and background workers.
- **`packages/shared`** – Common TypeScript types, feature-gate helper, and small utility functions that would otherwise cause circular deps.
- **`packages/storage`** – Thin wrapper around Google Cloud Storage for uploads, signed URLs, and image manipulation (sharp, exif stripping).
- **`packages/queue`** – BullMQ queue definitions, events, and helpers for dispatching jobs to `apps/render-worker` and future workers.
- **`packages/stripe`** – Stripe client helpers for customer lifecycle, webhooks, invoices, and subscription-tier enforcement.
- **`packages/db`** – Drizzle ORM setup, database schema definitions, and migration helpers targeting Supabase/Postgres.
- **`packages/ai-service`** – Provider-agnostic abstraction over AI image generation with adapters for Google Imagen & OpenAI DALL·E.
- **`packages/scripts`** – One-off or scheduled scripts (e.g., seed plant database) that run via ts-node.
- **`packages/sentry`** – Thin wrapper that standardises Sentry initialisation across web, API, and worker contexts.

## Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui
- **API Gateway**: tRPC with Fastify for type-safe APIs
- **Render Worker**: BullMQ job processor with Redis
- **Database**: PostgreSQL with Drizzle ORM (Supabase)
- **Storage**: Google Cloud Storage for images and assets
- **Auth**: Clerk for authentication and user management
- **Payments**: Stripe for subscription billing
- **AI**: Google Imagen and OpenAI for landscape rendering
- **Monitoring**: Sentry for error tracking and performance

## Package Management

This monorepo uses npm workspaces with Turbo for build orchestration:

```bash
# Install all dependencies
npm install

# Build all packages and apps
npm run build

# Run development servers for all apps
npm run dev

# Lint all packages and apps
npm run lint

# Run tests across all packages and apps
npm run test

# Type check all packages and apps
npm run typecheck
```

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   cp apps/api-gateway/.env.example apps/api-gateway/.env
   cp apps/render-worker/.env.example apps/render-worker/.env
   ```

3. **Start Redis (required for BullMQ)**
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

4. **Run database migrations**
   ```bash
   # Apply migrations to your Supabase instance
   psql $DATABASE_URL < migrations/0001_init_schema.sql
   psql $DATABASE_URL < migrations/0002_seed_plants.sql
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## Development URLs

- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Render Worker**: Background service (no URL)

## Package Dependencies

The packages have the following dependency relationships:

```
apps/web
├── @terrashaper/ui
├── @terrashaper/hooks
├── @terrashaper/services
├── @terrashaper/shared
└── @terrashaper/stripe

apps/api-gateway
├── @terrashaper/db
├── @terrashaper/queue
├── @terrashaper/services
├── @terrashaper/shared
├── @terrashaper/storage
└── @terrashaper/stripe

apps/render-worker
├── @terrashaper/ai-service
├── @terrashaper/queue
├── @terrashaper/storage
└── @terrashaper/shared
```

## Development Workflow

1. **Adding new features**: Create components in `packages/ui`, hooks in `packages/hooks`, and business logic in `packages/services`
2. **Database changes**: Add migrations to `migrations/` and update schema in `packages/db`
3. **API changes**: Update tRPC routers in `apps/api-gateway` and corresponding services in `packages/services`
4. **Testing**: Each package has its own test suite, run `npm test` from the root to test everything

## TypeScript Configuration

The monorepo uses path aliases for clean imports:

```typescript
// Instead of relative imports
// Use clean package imports
import { Button } from '@terrashaper/ui'

import { Button } from '../../../packages/ui/src/button'
```

## Project Status

- ✅ Phase 1: Backend infrastructure and monorepo setup
- ✅ Phase 2: Authentication and CRUD APIs
- 🚧 Phase 3: Frontend development and UI components
- 📋 Phase 4: Production deployment and monitoring

See [docs/TerraShaper Pro Technical Requirements.pdf](docs/TerraShaper%20Pro%20Technical%20Requirements.pdf) for detailed specifications.

## Contributing

1. Create feature branches from `main`
2. Follow conventional commit format
3. Ensure all tests pass: `npm run test`
4. Ensure code is properly formatted: `npm run lint:fix`
5. Create pull request with detailed description