# Vercel Development Environment Setup

## Prerequisites: Gather Environment Variables

Before setting up Vercel, collect all required environment variables from your services:

### 1. Clerk Authentication
**Where to find:**
- Go to [Clerk Dashboard](https://dashboard.clerk.com/)
- Select your application
- Go to **Developers > API Keys**

**Variables needed:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Copy from "Publishable key" (starts with `pk_`)
- `CLERK_SECRET_KEY` - Copy from "Secret key" (starts with `sk_`)

### 2. Database (Supabase/PostgreSQL)
**Where to find:**
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to **Settings > Database**

**Variables needed:**
- `DATABASE_URL` - Connection pooling URL (starts with `postgresql://`)
- `DIRECT_URL` - Direct connection URL (starts with `postgresql://`)

### 3. Sentry Error Monitoring
**Where to find DSN:**
- Go to [Sentry Dashboard](https://sentry.io/)
- Select your project
- Go to **Settings > Client Keys (DSN)**

**Where to find Auth Token:**
- Go to [Sentry Settings > Auth Tokens](https://sentry.io/settings/auth-tokens/)
- Click **"Create New Token"**
- Name it "Vercel Deployment"
- Select scopes: `project:releases`, `org:read`
- Copy the token immediately

**Variables needed:**
- `NEXT_PUBLIC_SENTRY_DSN` - Format: `https://xxx@xxx.ingest.sentry.io/xxx`
- `SENTRY_ORG` - Your organization slug (from URL: sentry.io/organizations/YOUR_ORG/)
- `SENTRY_PROJECT` - Your project slug (from project settings)
- `SENTRY_AUTH_TOKEN` - The token you just created

### 4. Google Cloud Platform
**Where to find:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project
- Go to **Cloud Storage > Buckets**

**Variables needed:**
- `GOOGLE_CLOUD_PROJECT_ID` - Your GCP project ID (from project selector)
- `GOOGLE_CLOUD_STORAGE_BUCKET` - Your bucket name

### 5. Redis Database
**Where to find:**
- If using Upstash: [Upstash Console](https://console.upstash.com/)
- If using Railway: [Railway Dashboard](https://railway.app/)
- If using Redis Labs: [Redis Labs Console](https://app.redislabs.com/)

**Variables needed:**
- `REDIS_URL` - Format: `redis://username:password@host:port` or `rediss://` for SSL

## Step 1: Login to Vercel
```bash
cd apps/web
npx vercel login
```

## Step 2: Link Your Project
```bash
npx vercel link
```
- Choose your team/scope
- Link to existing project or create new one
- Confirm the settings

## Step 3: Add Environment Variables
```bash
# Add for development environment
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development
npx vercel env add CLERK_SECRET_KEY development
npx vercel env add DATABASE_URL development
npx vercel env add DIRECT_URL development
npx vercel env add NEXT_PUBLIC_SENTRY_DSN development
npx vercel env add SENTRY_ORG development
npx vercel env add SENTRY_PROJECT development
npx vercel env add SENTRY_AUTH_TOKEN development
npx vercel env add GOOGLE_CLOUD_PROJECT_ID development
npx vercel env add GOOGLE_CLOUD_STORAGE_BUCKET development
npx vercel env add REDIS_URL development
```

## Step 4: Deploy to Development
```bash
npx vercel --prod=false
```

## Step 5: Set Up Automatic Deployments
Your project will automatically deploy:
- **Development**: When you push to any branch
- **Production**: When you push to `main` branch

## Environment Configuration
Your `vercel.json` is already configured with:
- Proper build commands for monorepo
- Security headers
- API rewrites to your backend
- Function configurations

## Next Steps
1. Run the commands above
2. Verify deployment works
3. Test your application in the development environment
4. Configure any additional environment-specific settings