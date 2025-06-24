# Services Package

Stateless business logic layer containing core services for authentication, billing, rendering, team management, and project operations.

## Purpose

- **Business Logic**: Centralized domain logic that can run in both API gateway and background workers
- **Service Layer**: Clean separation between presentation, business logic, and data access
- **Validation**: Input validation and business rule enforcement
- **Integration**: Third-party service integration (Stripe, Clerk, AI providers)

## Services

### Core Services
- **AuthService**: User authentication, JWT validation, and organization management
- **ProjectService**: Project CRUD operations, versioning, and collaboration
- **RenderService**: Render job orchestration and AI provider coordination
- **StorageService**: File management, uploads, and cloud storage operations

### Business Services  
- **BillingService**: Subscription management, usage tracking, and invoice generation
- **TeamService**: Team member management, roles, permissions, and invitations

## Architecture

Each service follows a consistent pattern:

```typescript
export class ProjectService {
  constructor(
    private db: Database,
    private storage: StorageService,
    private auth: AuthService
  ) {}

  async createProject(params: CreateProjectParams): Promise<Project> {
    // Input validation
    // Business logic
    // Data persistence
    // Event emission
  }
}
```

## Usage

```typescript
import { ProjectService, BillingService } from '@terrashaper/services'

// Dependency injection
const projectService = new ProjectService(db, storage, auth)
const billingService = new BillingService(stripe, db)

// Service operations
const project = await projectService.create({
  name: 'New Landscape Design',
  ownerId: 'user_123'
})

const usage = await billingService.trackUsage({
  organizationId: 'org_456',
  feature: 'renders',
  quantity: 1
})
```

## Key Features

- **Dependency Injection**: Services accept dependencies via constructor
- **Error Handling**: Consistent error types and handling patterns
- **Validation**: Input validation using Zod schemas
- **Transactions**: Database transaction support where needed
- **Events**: Service events for decoupled communication
- **Testing**: Easily mockable for unit testing

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

- **@terrashaper/db**: Database access and schema
- **@terrashaper/shared**: Common types and utilities
- **@terrashaper/stripe**: Payment processing
- **Zod**: Runtime validation