# TerraShaper Pro - How to Run Guide

## Prerequisites

### Required Software
- **Node.js** v20.x or higher
- **npm** v10.x or higher
- **Git** for version control
- **Docker** (optional, for local Redis/PostgreSQL)

### Development Environment
- **Code Editor**: VS Code (recommended) with TypeScript and ESLint extensions
- **Terminal**: Any modern terminal (Windows Terminal, iTerm2, etc.)
- **Browser**: Chrome or Firefox with React Developer Tools

## Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/your-org/terrashaper-pro.git
cd terrashaper-pro
npm install
```

### 2. Environment Setup
```bash
# Copy environment templates
cp apps/web/.env.example apps/web/.env.local
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/render-worker/.env.example apps/render-worker/.env

# Configure required environment variables (see Environment Configuration section)
```

### 3. Database Setup
```bash
# Start local development database (if using Docker)
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development Servers
```bash
# Start all services concurrently
npm run dev

# Or start services individually:
npm run dev:web      # Frontend (localhost:3000)
npm run dev:api      # API Gateway (localhost:4000)
npm run dev:worker   # Render Worker (background)
```

### 5. Access the Application
- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:4000/trpc-panel

## Detailed Setup

### Environment Configuration

#### Core Services (.env files)

**apps/web/.env.local**:
```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API
NEXT_PUBLIC_API_URL=http://localhost:4000/trpc

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

**apps/api-gateway/.env**:
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Authentication
CLERK_SECRET_KEY=sk_test_...

# Billing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis (for caching and rate limiting)
REDIS_URL=redis://localhost:6379
```

**apps/render-worker/.env**:
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Services
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
GOOGLE_CLOUD_PROJECT=your-project-id

# Storage
GCS_BUCKET_NAME=terrashaper-assets
GOOGLE_APPLICATION_CREDENTIALS=./gcs_keys.json

# Queue
REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=5
```

### Service-Specific Setup

#### 1. Authentication (Clerk)
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Copy API keys to environment files
4. Configure redirect URLs in Clerk dashboard

#### 2. Database (Supabase)
1. Create project at [supabase.com](https://supabase.com)
2. Get project URL and API keys
3. Enable Row Level Security (RLS)
4. Run migrations: `npm run db:migrate`

#### 3. AI Services Setup
**OpenAI**:
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `OPENAI_API_KEY` environment variable

**Google Imagen**:
1. Enable Vertex AI API in Google Cloud Console
2. Create service account and download JSON key
3. Save as `gcs_keys.json` in project root

#### 4. Storage (Google Cloud Storage)
1. Create GCS bucket in Google Cloud Console
2. Set bucket permissions for public read access
3. Configure CORS for web uploads

#### 5. Billing (Stripe)
1. Create Stripe account
2. Get API keys from dashboard
3. Configure webhook endpoints for billing events
4. Set up products and pricing in Stripe dashboard

## Development Commands

### Building and Testing
```bash
# Build all packages
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
npm run lint:fix

# Run tests
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
```

### Database Operations
```bash
# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback

# Generate migration
npm run db:generate

# Seed database
npm run db:seed

# Reset database (development only)
npm run db:reset
```

### Package Management
```bash
# Install dependency in specific workspace
npm install package-name --workspace=@terrashaper/web

# Add development dependency
npm install -D package-name --workspace=@terrashaper/api-gateway

# Update all dependencies
npm update

# Check for outdated packages
npm outdated
```

## Service Ports

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Web App | 3000 | http://localhost:3000 | Frontend application |
| API Gateway | 4000 | http://localhost:4000 | tRPC API server |
| tRPC Panel | 4000 | http://localhost:4000/trpc-panel | API documentation |
| Render Worker | - | Background process | Job processing |
| PostgreSQL | 5432 | localhost:5432 | Database |
| Redis | 6379 | localhost:6379 | Cache & queues |

## Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear all node_modules and reinstall
npm run clean
npm install
```

#### Database connection issues
```bash
# Check if database is running
docker ps

# Restart database services
docker-compose restart postgres redis

# Check environment variables
echo $SUPABASE_URL
```

#### TypeScript errors
```bash
# Rebuild all packages
npm run build

# Check for type issues
npm run type-check
```

#### Port already in use
```bash
# Find process using port
lsof -i :3000

# Kill process (replace PID)
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev:web
```

### Performance Issues

#### Slow build times
- Clear `.turbo` cache: `rm -rf .turbo`
- Update Node.js to latest LTS version
- Increase Node.js memory: `export NODE_OPTIONS="--max_old_space_size=4096"`

#### Memory issues during development
- Restart development servers periodically
- Reduce worker concurrency in render-worker
- Close unused browser tabs and applications

### Environment Issues

#### Missing environment variables
1. Check `.env.example` files for required variables
2. Verify environment file names match expectations
3. Restart development servers after changes

#### API connection issues
1. Verify API gateway is running on correct port
2. Check CORS configuration
3. Verify authentication tokens are valid

## Production Deployment

### Prerequisites
- Vercel account for web deployment
- Google Cloud account for worker deployment
- Domain name (optional)

### Deployment Steps
1. **Frontend (Vercel)**:
   ```bash
   npm run build:web
   vercel --prod
   ```

2. **API Gateway (Vercel)**:
   ```bash
   npm run build:api
   vercel --prod --cwd apps/api-gateway
   ```

3. **Render Worker (Google Cloud Run)**:
   ```bash
   npm run build:worker
   gcloud run deploy render-worker --source apps/render-worker
   ```

### Environment Variables for Production
- Set all environment variables in deployment platforms
- Use production API keys and database URLs
- Enable monitoring and error tracking

## Getting Help

### Documentation
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/api/README.md)
- [Contributing Guide](./CONTRIBUTING.md)

### Community & Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Discord**: Real-time community support (link in README)

### Development Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

*This guide is maintained by the TerraShaper Pro team. If you find any issues or have suggestions, please create an issue or submit a pull request.*