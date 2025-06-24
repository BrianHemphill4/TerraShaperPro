# Database Package

Drizzle ORM setup, database schema definitions, and migration helpers targeting Supabase PostgreSQL.

## Purpose

- **Schema Definition**: Type-safe database schema using Drizzle ORM
- **Migration Management**: Version-controlled database migrations
- **Connection Management**: Pooled connections with environment-based configuration
- **Query Helpers**: Common database operations and helpers
- **RLS Integration**: Row Level Security policies for Supabase

## Schema Structure

### Core Tables
- **users**: User profiles and authentication data
- **organizations**: Team/company accounts
- **projects**: Landscape design projects
- **project_versions**: Version history for projects
- **renders**: AI-generated landscape renders

### Plant Database
- **plants**: 400+ Texas native plant species
- **plant_categories**: Hierarchical plant classification
- **plant_images**: Plant photo assets and metadata

### Billing & Subscriptions
- **subscriptions**: Stripe subscription data
- **usage_records**: Metered billing tracking
- **invoices**: Invoice history and status

### Team Collaboration
- **team_members**: Organization membership
- **invitations**: Pending team invitations
- **activity_logs**: Team activity tracking

## Usage

```typescript
import { db, users, projects } from '@terrashaper/db'
import { eq, and } from 'drizzle-orm'

// Query users
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, 'user_123'))
  .limit(1)

// Create project
const project = await db
  .insert(projects)
  .values({
    name: 'Backyard Landscape',
    ownerId: 'user_123',
    organizationId: 'org_456'
  })
  .returning()

// Complex query with joins
const projectsWithRenders = await db
  .select({
    project: projects,
    renderCount: count(renders.id)
  })
  .from(projects)
  .leftJoin(renders, eq(renders.projectId, projects.id))
  .where(eq(projects.ownerId, userId))
  .groupBy(projects.id)
```

## Migration System

Migrations are managed through SQL files in the `migrations/` directory:

```bash
# Apply migrations
psql $DATABASE_URL < migrations/0001_init_schema.sql
psql $DATABASE_URL < migrations/0002_seed_plants.sql

# Generate migration from schema changes
npm run db:generate

# Push schema changes to database
npm run db:push
```

## Supabase Integration

### Row Level Security (RLS)
Comprehensive RLS policies ensure data security:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON projects
FOR SELECT USING (auth.uid()::text = owner_id);

-- Organization members can access shared projects
CREATE POLICY "Org members can view projects" ON projects
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM team_members 
    WHERE user_id = auth.uid()::text
  )
);
```

### Storage Buckets
Configured storage buckets with proper permissions:

- **renders**: AI-generated landscape images
- **uploads**: User-uploaded files
- **plants**: Plant database images
- **projects**: Project assets and exports

## Connection Configuration

```typescript
// Database connection with pooling
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production',
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}

export const db = drizzle(new Pool(dbConfig), { 
  schema: allSchemas 
})
```

## Development

```bash
# Install dependencies
npm install

# Generate types from schema
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Studio (GUI for database)
npm run db:studio

# Type check
npm run typecheck
```

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Dependencies

- **Drizzle ORM**: Type-safe SQL query builder
- **PostgreSQL**: Database driver
- **Supabase**: BaaS platform
- **Zod**: Runtime validation