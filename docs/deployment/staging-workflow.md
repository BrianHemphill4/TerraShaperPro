# Staging Environment Workflow

## Overview

The staging environment provides a safe testing ground before deploying to production.

## Branch Structure

- **main**: Production branch (auto-deploys to production)
- **staging**: Staging branch (auto-deploys to preview environment)
- **feature/***: Development branches

## Deployment Flow

1. **Development**: Create feature branches from `staging`
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/my-feature
   ```

2. **Testing**: Push to staging for testing
   ```bash
   git checkout staging
   git merge feature/my-feature
   git push origin staging
   ```

3. **Production**: After verification, merge to main
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

## Environment Variables

Vercel automatically uses different environment variables for:
- **Production**: Variables marked for "Production" environment
- **Preview** (Staging): Variables marked for "Preview" environment

## Accessing Staging

After pushing to the staging branch:
1. Check GitHub Actions for build status
2. Visit Vercel dashboard for the preview URL
3. The URL format will be: `terrashaperpro-git-staging-[team].vercel.app`

## Best Practices

1. **Always test on staging first** before merging to main
2. **Keep staging in sync** with main by regularly merging main into staging
3. **Use feature flags** for experimental features
4. **Monitor staging logs** in Vercel dashboard

## Rollback Procedure

If issues are found in staging:
```bash
git checkout staging
git reset --hard origin/main
git push --force-with-lease origin staging
```

## Environment-Specific Configuration

Add environment checks in your code:
```typescript
const isStaging = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === 'staging';
const isProduction = process.env.VERCEL_ENV === 'production';
```