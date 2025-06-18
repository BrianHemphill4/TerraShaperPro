# Vercel Deployment Guide

This guide walks through deploying the TerraShaperPro web application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. Access to all required environment variables
4. GitHub repository connected to Vercel

## Step 1: Initial Setup

### 1.1 Login to Vercel CLI
```bash
vercel login
```

### 1.2 Link Project
From the root of the repository:
```bash
vercel link
```

Select:
- Link to existing project? **No** (first time) or **Yes** (if already created)
- What's your project's name? **terrashaper-pro**
- In which directory is your code located? **./apps/web**

## Step 2: Configure Environment Variables

### 2.1 Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add the following variables:

#### Public Variables (all environments)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_API_URL` (set to your API gateway URL)

#### Secret Variables (all environments)
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `REDIS_URL`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_CLOUD_STORAGE_BUCKET`

### 2.2 Via CLI
```bash
# Add a single variable
vercel env add VARIABLE_NAME

# Pull environment variables locally
vercel env pull .env.local
```

## Step 3: Configure Build Settings

The build settings are already configured in `vercel.json`, but verify:

1. **Framework Preset**: Next.js
2. **Build Command**: `cd ../.. && npm run build -- --filter=web`
3. **Output Directory**: `.next`
4. **Install Command**: `cd ../.. && npm install`
5. **Root Directory**: `apps/web`

## Step 4: Deploy

### 4.1 Preview Deployment
```bash
vercel
```

This creates a preview deployment with a unique URL.

### 4.2 Production Deployment
```bash
vercel --prod
```

Or push to the `main` branch to trigger automatic deployment.

## Step 5: Configure Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add your domain: `terrashaperpro.com`
3. Add www subdomain: `www.terrashaperpro.com`
4. Configure DNS records as instructed

### DNS Configuration
Add these records to your DNS provider:

```
Type  Name    Value
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

## Step 6: Post-Deployment

### 6.1 Verify Deployment
- Check https://your-app.vercel.app
- Test authentication flow
- Verify API connections
- Check Sentry error reporting

### 6.2 Monitor Performance
- Enable Vercel Analytics
- Set up Speed Insights
- Configure Web Vitals monitoring

### 6.3 Set up Deployment Protection
1. Settings → Deployment Protection
2. Enable for production branch
3. Configure password or Vercel Authentication

## Troubleshooting

### Build Failures
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set
4. Check for TypeScript errors: `npm run type-check`

### Runtime Errors
1. Check Function logs in Vercel dashboard
2. Verify API routes are working
3. Check browser console for client-side errors
4. Ensure CORS is properly configured

### Environment Variable Issues
- Use `vercel env ls` to list variables
- Ensure variables are set for correct environment
- Check for typos in variable names
- Verify secret rotation if needed

## CI/CD Integration

The GitHub Actions workflow automatically deploys on push to main:

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v20
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback Procedure

1. Via Dashboard: Deployments → Select previous deployment → Promote to Production
2. Via CLI: `vercel rollback [deployment-url]`

## Monitoring and Alerts

1. Set up Vercel Integrations:
   - Sentry for error tracking
   - Slack for deployment notifications
   - GitHub for PR previews

2. Configure Alert Policies:
   - Build failures
   - Function errors
   - Performance degradation

## Security Best Practices

1. Enable Deployment Protection
2. Use Environment Variables for secrets
3. Enable HTTPS (automatic with Vercel)
4. Configure CSP headers in vercel.json
5. Regular security audits with `npm audit`

## Cost Optimization

1. Monitor usage in Vercel Dashboard
2. Optimize image delivery with next/image
3. Enable ISR for static pages
4. Use Edge Functions where appropriate
5. Configure appropriate cache headers