# TerraShaperPro

AI-powered landscape design SaaS for Texas contractors. Features sub-60-second 4K renders using Google Imagen and OpenAI image generation.

## Architecture

- **Frontend**: Next.js 14 with shadcn/ui
- **API Gateway**: tRPC with Fastify
- **Render Worker**: BullMQ job processor
- **Database**: PostgreSQL (Supabase)
- **Storage**: Google Cloud Storage
- **Auth**: Clerk

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

## Services

- **Web**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Render Worker**: Background job processor

## Project Status

- ✅ Phase 1: Backend infrastructure setup
- 🚧 Phase 2: Authentication and CRUD APIs
- 📋 Phase 3: Frontend development
- 📋 Phase 4: Deployment

See [docs/TerraShaper Pro Technical Requirements.pdf](docs/TerraShaper%20Pro%20Technical%20Requirements.pdf) for detailed specifications.