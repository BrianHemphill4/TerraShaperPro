# Web App

Next.js 14 frontend application that provides the customer-facing interface for TerraShaper Pro.

## Purpose

- **Design Canvas**: Interactive landscape design canvas using Fabric.js for creating and editing landscape plans
- **User Dashboard**: Comprehensive dashboard for managing projects, credits, billing, and team collaboration  
- **Landing Pages**: Marketing website with pricing, features, and onboarding flows
- **Authentication**: Clerk-powered user authentication and organization management
- **Real-time Updates**: Live render progress tracking and team collaboration features

## Architecture

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and Zustand stores
- **Authentication**: Clerk for user and organization management
- **API**: tRPC client connecting to api-gateway
- **Monitoring**: Sentry for error tracking and performance monitoring

## Key Features

- Interactive design canvas with parametric drawing tools
- Plant database with 400+ native Texas species
- Real-time render progress with queue position display
- Team collaboration with roles and permissions
- Client portal for project approvals and comments
- Comprehensive billing and subscription management
- Performance monitoring and analytics dashboard

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Type check
npm run typecheck

# Lint and format
npm run lint
npm run lint:fix
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `CLERK_SECRET_KEY` - Clerk authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `NEXT_PUBLIC_TRPC_URL` - API gateway URL
- `SENTRY_DSN` - Error tracking

## Deployment

Deployed on Vercel with automatic builds from `main` branch.

## Dependencies

- `@terrashaper/ui` - Design system components
- `@terrashaper/hooks` - Custom React hooks
- `@terrashaper/services` - Business logic services
- `@terrashaper/shared` - Shared types and utilities
- `@terrashaper/stripe` - Billing integration