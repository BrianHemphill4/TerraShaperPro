# Vercel Deployment Checklist

Use this checklist before deploying to Vercel to ensure everything is configured correctly.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passing (`npm run lint`)
- [ ] Tests passing (`npm run test`)
- [ ] Build succeeds locally (`npm run build -- --filter=web`)
- [ ] No console.log statements in production code
- [ ] Environment variables documented

### Configuration Files
- [ ] `vercel.json` configured correctly
- [ ] `next.config.js` optimized for production
- [ ] `.env.example` updated with all required variables
- [ ] `.vercelignore` file created (if needed)

### Security
- [ ] No secrets in code
- [ ] API keys in environment variables
- [ ] CORS properly configured
- [ ] CSP headers configured
- [ ] Authentication working

### Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90

## Vercel Setup Checklist

### Initial Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project created in Vercel dashboard
- [ ] Team configured (if applicable)

### Environment Variables
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set
- [ ] `CLERK_SECRET_KEY` set
- [ ] `DATABASE_URL` set
- [ ] `DIRECT_URL` set
- [ ] `REDIS_URL` set
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set
- [ ] `SENTRY_AUTH_TOKEN` set
- [ ] `GOOGLE_CLOUD_PROJECT_ID` set
- [ ] All other required variables set

### Build Configuration
- [ ] Framework preset: Next.js
- [ ] Build command correct
- [ ] Output directory: `.next`
- [ ] Install command handles monorepo
- [ ] Node.js version specified

### Domain Configuration
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] www redirect configured

## Post-Deployment Checklist

### Verification
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] API endpoints responding
- [ ] Images loading
- [ ] Forms submitting

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Speed Insights configured
- [ ] Sentry receiving errors
- [ ] Alerts configured
- [ ] Logs accessible

### Performance
- [ ] TTFB < 200ms
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Page size < 1MB

### SEO
- [ ] Robots.txt accessible
- [ ] Sitemap.xml generated
- [ ] Meta tags present
- [ ] Open Graph tags configured
- [ ] Structured data valid

## Rollback Plan
- [ ] Previous deployment URL noted
- [ ] Database migration rollback ready
- [ ] Team notified of deployment
- [ ] Monitoring dashboard open
- [ ] Rollback procedure documented

## Common Issues and Solutions

### Build Failures
- Check Node.js version matches
- Verify all dependencies installed
- Check for missing environment variables
- Review build logs for specific errors

### Runtime Errors
- Check Function logs
- Verify API routes
- Check client-side console
- Ensure database connectivity

### Performance Issues
- Enable caching headers
- Optimize images
- Reduce bundle size
- Use ISR for static pages
- Enable Edge Functions

### Domain Issues
- Verify DNS propagation
- Check SSL certificate
- Ensure proper redirects
- Clear CDN cache