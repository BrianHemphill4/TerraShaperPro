# Shared Package

Common TypeScript types, feature-gate utilities, and small utility functions shared across all applications and packages.

## Purpose

- **Type Definitions**: Shared TypeScript interfaces and types
- **Feature Gates**: Subscription-based feature access control
- **Utilities**: Small, reusable utility functions
- **Constants**: Application-wide constants and enums
- **Dependency Prevention**: Prevents circular dependencies between packages

## Exports

### Types
- **Billing Types**: Subscription, plan, usage, and invoice interfaces
- **Team Types**: Member roles, permissions, and invitation structures  
- **Client Portal Types**: Access tokens, approval workflows, and comments
- **Onboarding Types**: Tutorial progress and user journey tracking

### Services
- **FeatureGateService**: Subscription tier and feature access validation
- **Logger Utilities**: Standardized logging across services

### Constants
- **Subscription Tiers**: Plan limits and feature availability
- **Error Codes**: Standardized error classification
- **Event Types**: System event definitions

## Usage

```typescript
import { 
  SubscriptionTier, 
  TeamMemberRole,
  FeatureGateService 
} from '@terrashaper/shared'

// Type-safe interfaces
interface UserData {
  subscription: SubscriptionTier
  role: TeamMemberRole
}

// Feature gating
const featureGate = new FeatureGateService()
const canAccess = featureGate.canAccessFeature(
  user.subscription,
  'advanced-analytics'
)

// Utility functions
import { formatCurrency, validateEmail } from '@terrashaper/shared'
```

## Key Features

- **Zero Dependencies**: Minimal external dependencies to avoid version conflicts
- **Type Safety**: Comprehensive TypeScript definitions
- **Tree Shaking**: Optimized for bundle size with proper exports
- **Validation**: Zod schemas for runtime type checking
- **Documentation**: JSDoc comments for all public APIs

## Structure

```
src/
├── types/
│   ├── billing.ts       # Subscription and payment types
│   ├── team.ts          # Team and collaboration types
│   ├── client-portal.ts # Client access and approval types
│   └── onboarding.ts    # User journey and tutorial types
├── services/
│   └── feature-gate.service.ts # Feature access control
├── utils/
│   └── logger.ts        # Logging utilities
└── index.ts             # Main exports
```

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm run test

# Type check
npm run typecheck
```

## Dependencies

- **Zod**: Runtime validation schemas
- **TypeScript**: Type definitions only