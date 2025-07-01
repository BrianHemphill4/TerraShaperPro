# Developer Guide

Architecture decisions, refactoring conventions, and development practices for TerraShaper Pro.

## Architecture Decisions

### Monorepo Structure Decision

**Decision**: Use npm workspaces with Turbo for build orchestration
**Rationale**: 
- Shared code reuse across applications
- Coordinated releases and dependency management
- Type safety across package boundaries
- Single repository for all related code

**Implementation**:
```
apps/
├── web/              # Next.js frontend
├── api-gateway/      # tRPC API server
└── render-worker/    # Background processor

packages/
├── ui/               # Design system
├── hooks/            # React hooks
├── services/         # Business logic
├── shared/           # Common utilities
├── storage/          # Cloud storage
├── queue/            # Job management
├── stripe/           # Payments
├── db/               # Database layer
├── ai-service/       # AI providers
└── scripts/          # Utilities
```

### Service-Oriented Architecture

**Decision**: Decompose large files into focused service classes
**Rationale**:
- Single responsibility principle
- Easier testing and mocking
- Improved maintainability
- Clear dependency injection

**Example**: Render worker refactoring
```typescript
// Before: 400+ line renderProcessor.ts
// After: Focused services
class RenderCoordinator {
  constructor(
    private creditService: CreditService,
    private qualityService: RenderQualityService,
    private storageService: RenderStorageService
  ) {}
}
```

### Type-Safe API Layer

**Decision**: Use tRPC for full-stack type safety
**Rationale**:
- End-to-end type safety
- Automatic client generation
- Runtime validation with Zod
- Excellent developer experience

**Implementation**:
```typescript
// Router definition with validation
export const projectRouter = router({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ input, ctx }) => {
      return await projectService.create(input, ctx.user)
    })
})
```

### Database Strategy

**Decision**: Drizzle ORM with Supabase PostgreSQL
**Rationale**:
- Type-safe SQL queries
- Edge runtime compatibility
- Row-level security policies
- Built-in storage and auth

**Schema Organization**:
```typescript
// Organized by domain
packages/db/src/schema/
├── core.ts          # Users, organizations
├── app.ts           # Projects, renders
├── auth.ts          # Authentication
└── quality.ts       # Quality assurance
```

### AI Provider Abstraction

**Decision**: Provider-agnostic AI service layer
**Rationale**:
- Vendor independence
- Failover capabilities
- Cost optimization
- Future provider additions

**Interface**:
```typescript
type AIProvider = {
  generateImage: (params: GenerationParams) => Promise<GenerationResult>
  validateConfig: () => Promise<boolean>
  getProviderInfo: () => ProviderInfo
}
```

### Testing Strategy

**Decision**: Multi-tier testing approach
**Rationale**:
- Comprehensive coverage
- Fast feedback loops
- Confidence in deployments
- Regression prevention

**Test Pyramid**:
- Unit tests (70%): Individual functions and components
- Integration tests (20%): API endpoints and services  
- E2E tests (10%): Critical user workflows

## Refactoring Conventions

### Service Extraction Pattern

When a file exceeds 200 lines or handles multiple concerns:

1. **Identify Responsibilities**: List distinct concerns in the file
2. **Extract Services**: Create focused service classes
3. **Dependency Injection**: Pass dependencies via constructor
4. **Update Tests**: Create focused test suites for each service

**Example Refactoring**:
```typescript
// Before: Large processor file
export async function processRender(job: Job) {
  // Credit consumption logic
  // AI provider coordination  
  // Quality validation
  // Storage operations
  // Progress tracking
}

// After: Coordinated services
export class RenderCoordinator {
  constructor(
    private creditService: CreditService,
    private aiService: AIService,
    private qualityService: QualityService,
    private storageService: StorageService,
    private progressService: ProgressService
  ) {}

  async processRender(job: Job): Promise<void> {
    await this.creditService.consumeCredits(job.organizationId, job.settings)
    const result = await this.aiService.generateImage(job.prompt)
    const isValid = await this.qualityService.validateImage(result.image)
    await this.storageService.storeRender(result, job.metadata)
    await this.progressService.markComplete(job.id)
  }
}
```

### Component Extraction

Extract components when JSX exceeds 100 lines or when reused:

```typescript
// Before: Large component
export function Dashboard() {
  return (
    <div>
      {/* 200+ lines of JSX */}
      {/* Project list section */}
      {/* Analytics section */}
      {/* Team activity section */}
    </div>
  )
}

// After: Composed components
export function Dashboard() {
  return (
    <div>
      <ProjectList />
      <AnalyticsDashboard />
      <TeamActivity />
    </div>
  )
}
```

### Type Extraction

Move types to dedicated files when:
- More than 5 interfaces in a file
- Types are reused across modules
- Complex type definitions (>20 lines)

```typescript
// types/project.ts
// services/project.service.ts
import type { Project } from '../types/project'

export type Project = {
  id: string
  name: string
  ownerId: string
  // ... other fields
}
```

### Utility Function Organization

Group utilities by domain and extract when:
- Function is used in 3+ places
- Function is >50 lines
- Function has complex logic

```typescript
// lib/validation.ts
export function validateProjectName(name: string): boolean {
  return name.length >= 3 && name.length <= 100
}

// lib/formatting.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
```

## File Naming Conventions

### Extensions
- `.ts` - TypeScript files (utilities, services, types)
- `.tsx` - React components and pages
- `.test.ts/.test.tsx` - Test files
- `.d.ts` - Type definitions only

### Component Files
- **PascalCase** for React components: `ProjectCard.tsx`
- **Descriptive names**: `RenderProgressDialog.tsx`
- **Domain prefixes** when needed: `BillingOverview.tsx`

### Utility Files
- **camelCase** for utilities: `formatUtils.ts`
- **Descriptive names**: `validationHelpers.ts`
- **Domain prefixes**: `projectUtils.ts`

### Service Files
- **PascalCase class + .service.ts**: `ProjectService.ts`
- **camelCase functions + .ts**: `authHelpers.ts`

### Type Files
- **camelCase + .types.ts**: `project.types.ts`
- **Domain-specific**: `billing.types.ts`

## Code Organization Patterns

### Directory Structure
```
src/
├── components/
│   ├── ui/              # Base components
│   ├── billing/         # Domain components
│   └── projects/        # Domain components
├── hooks/
│   ├── api/             # API hooks
│   ├── ui/              # UI hooks
│   └── domain/          # Business logic hooks
├── lib/
│   ├── utils/           # General utilities
│   ├── validation/      # Validation logic
│   └── formatting/      # Display formatting
├── services/
│   ├── api/             # API services
│   ├── storage/         # Storage services
│   └── auth/            # Auth services
├── types/
│   ├── api.ts           # API types
│   ├── ui.ts            # UI types
│   └── domain/          # Business types
└── __tests__/
    ├── unit/            # Unit tests
    ├── integration/     # Integration tests
    └── e2e/             # E2E tests
```

### Import Organization
```typescript
// 1. Node modules
import { useProject } from '@terrashaper/hooks'
// 2. Internal packages
import { Button } from '@terrashaper/ui'
import { NextPage } from 'next'
import React from 'react'

import { validateProject } from '../lib/validation'
import type { Project } from '../types/project'
// 3. Relative imports (closest to farthest)
import { ProjectCard } from './ProjectCard'
```

## Error Handling Patterns

### Service Layer Errors
```typescript
export class ProjectService {
  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const project = await this.db.insert(projects).values(data).returning()
      return project[0]
    } catch (error) {
      if (error.code === '23505') { // Unique constraint
        throw new ProjectExistsError('Project name already exists')
      }
      throw new ProjectServiceError('Failed to create project', { cause: error })
    }
  }
}
```

### API Layer Errors
```typescript
export const projectRouter = router({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await projectService.create(input, ctx.user)
      } catch (error) {
        if (error instanceof ProjectExistsError) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: error.message
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create project'
        })
      }
    })
})
```

### Frontend Error Handling
```typescript
export function useCreateProject() {
  return useMutation({
    mutationFn: (data: CreateProjectData) => api.project.create.mutate(data),
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error('Project name already exists')
      } else {
        toast.error('Failed to create project')
      }
    }
  })
}
```

## Performance Guidelines

### Bundle Optimization
- **Code splitting**: Use dynamic imports for large components
- **Tree shaking**: Export only what's needed
- **Lazy loading**: Load components on demand

```typescript
// Dynamic imports for large components
const DesignCanvas = lazy(() => import('./DesignCanvas'))

// Conditional exports
export { ProjectService } from './project.service'
export type { CreateProjectData,Project } from './project.types'
```

### Database Optimization
- **Indexes**: Add indexes for frequently queried columns
- **Query optimization**: Use joins instead of N+1 queries
- **Connection pooling**: Limit database connections

```typescript
// Good: Single query with join
const projectsWithRenders = await db
  .select()
  .from(projects)
  .leftJoin(renders, eq(renders.projectId, projects.id))
  .where(eq(projects.ownerId, userId))

// Bad: N+1 queries
const projects = await db.select().from(projects).where(eq(projects.ownerId, userId))
for (const project of projects) {
  const renders = await db.select().from(renders).where(eq(renders.projectId, project.id))
}
```

### Caching Strategy
- **React Query**: Cache API responses
- **Redis**: Cache frequently accessed data
- **Memoization**: Cache expensive computations

```typescript
// API response caching
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.project.list.query(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## Security Practices

### Input Validation
```typescript
// Validate all inputs
const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  organizationId: z.string().uuid()
})
```

### Authentication & Authorization
```typescript
// Check permissions at service layer
export class ProjectService {
  async updateProject(id: string, data: UpdateProjectData, user: User): Promise<Project> {
    const project = await this.getProject(id)
    
    if (!this.canEdit(project, user)) {
      throw new UnauthorizedError('Cannot edit this project')
    }
    
    return await this.update(id, data)
  }
}
```

### Sensitive Data Handling
```typescript
// Never log sensitive data
logger.info('User login attempt', {
  userId: user.id,
  // DON'T: password: user.password
  timestamp: new Date().toISOString()
})
```

## Deployment Considerations

### Environment Configuration
- **Separate configs** for each environment
- **Validate environment variables** at startup
- **Default to secure values**

### Rollback Procedures

#### Database Rollbacks
```bash
# Rollback last migration
npm run db:rollback

# Rollback to specific migration
npm run db:rollback --to=0010_stripe_billing.sql

# Emergency rollback with backup restore
psql $DATABASE_URL < backups/pre-deploy-$(date +%Y%m%d).sql
```

#### Application Rollbacks
```bash
# Vercel rollback (web app)
vercel --prod rollback

# Docker rollback (api-gateway, render-worker)
docker rollback terrashaper_api_gateway --to-revision 3
docker rollback terrashaper_render_worker --to-revision 2

# Feature flag emergency disable
curl -X POST https://api.terrashaper.com/admin/features/disable \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"feature": "ai-rendering-v2"}'
```

#### Pre-deployment Checklist
1. **Create database backup**:
   ```bash
   pg_dump $DATABASE_URL > backups/pre-deploy-$(date +%Y%m%d).sql
   ```

2. **Tag release**:
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3
   ```

3. **Feature flags**: Enable feature flags for gradual rollout

4. **Health checks**: Verify all services are healthy

5. **Monitoring**: Ensure alerts are active

#### Emergency Response
1. **Immediate rollback** if critical issues detected
2. **Communication** via Slack #incidents channel
3. **Post-mortem** document within 24 hours
4. **Root cause analysis** and prevention measures

### Automated Backup System

#### Pre-deployment Backup Script
```bash
#!/bin/bash
# scripts/backup-before-deploy.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Database backup
echo "Creating database backup..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/database.sql"

# Redis backup (queue state)
echo "Creating Redis backup..."
redis-cli --rdb "$BACKUP_DIR/redis.rdb"

# Environment variables backup
echo "Backing up environment configuration..."
cp .env "$BACKUP_DIR/env.backup"

# Git state backup
echo "Recording git state..."
git rev-parse HEAD > "$BACKUP_DIR/git-commit.txt"
git status --porcelain > "$BACKUP_DIR/git-status.txt"

# Storage bucket state (metadata only)
echo "Recording storage state..."
gsutil ls -l gs://terrashaper-renders > "$BACKUP_DIR/storage-state.txt"

echo "Backup completed: $BACKUP_DIR"
echo "Restore with: scripts/restore-backup.sh $BACKUP_DIR"
```

#### Automated Backup Integration
```yaml
# .github/workflows/deploy.yml
- name: Create pre-deployment backup
  run: |
    npm run backup:create
    echo "BACKUP_ID=$(date +%Y%m%d_%H%M%S)" >> $GITHUB_ENV

- name: Deploy to production
  run: npm run deploy:prod
  
- name: Rollback on failure
  if: failure()
  run: npm run backup:restore ${{ env.BACKUP_ID }}
```

### Monitoring & Alerting
- **Error tracking**: Sentry for all applications
- **Performance monitoring**: Core Web Vitals
- **Business metrics**: Custom dashboards
- **Uptime monitoring**: Checkly for critical endpoints
- **Database monitoring**: Supabase dashboard alerts

### Incident Response Plan

#### Severity Levels
- **P0 (Critical)**: System down, data loss, security breach
- **P1 (High)**: Major feature broken, significant user impact
- **P2 (Medium)**: Minor feature issues, performance degradation
- **P3 (Low)**: Cosmetic issues, minor bugs

#### Response Times
- **P0**: Immediate response, 15-minute rollback target
- **P1**: 30-minute response, 2-hour resolution target
- **P2**: 4-hour response, 24-hour resolution target
- **P3**: 24-hour response, next sprint resolution

This guide evolves with the project. Update when making significant architectural changes.