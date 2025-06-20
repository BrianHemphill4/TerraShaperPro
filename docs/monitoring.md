# Performance Monitoring & Alerting

This document describes the performance monitoring and alerting setup for TerraShaper Pro.

## Overview

TerraShaper Pro uses Sentry for Application Performance Monitoring (APM), custom metrics tracking, and alerting. The system tracks performance budgets, records detailed metrics, and alerts on violations.

## Components

### 1. Sentry APM Integration

- **Web App**: Configured in `apps/web/instrumentation.ts`
- **API Gateway**: Initialized in `apps/api-gateway/src/lib/sentry.ts`
- **Render Worker**: Initialized in `apps/render-worker/src/lib/sentry.ts`

### 2. Custom Metrics

#### Web Application Metrics
- **Web Vitals**: FCP, LCP, CLS, FID, TTFB, INP
- **Component render times**
- **API call durations**
- **Canvas operations**
- **Memory usage**
- **Network conditions**

#### API Gateway Metrics
- **tRPC endpoint response times**
- **Database query performance**
- **External service calls**
- **Queue operations**

#### Render Worker Metrics
- **Job processing times**
- **Queue sizes and throughput**
- **Memory and CPU usage**
- **Success/failure rates**

### 3. Performance Budgets

Default budgets are configured for:

```javascript
// Page load budgets
page.load: 3000ms
page.interactive: 5000ms
page.firstPaint: 1500ms

// API response budgets
api.response: 200ms
api.render.create: 500ms
api.plant.search: 100ms

// Resource budgets
bundle.size.main: 300kb
bundle.size.vendor: 500kb
image.size.max: 200kb

// Canvas performance budgets
canvas.render: 16ms (60fps)
canvas.interaction: 50ms

// Render job budgets
render.generate: 60000ms (1 minute)
render.upscale: 30000ms
image.optimize: 5000ms
image.thumbnail: 2000ms
```

### 4. Alert Policies

Alerts are configured in `.sentryrc.json` and can be deployed using:

```bash
npm run setup:alerts
```

Alert types include:
- **High Error Rate**: >10 errors in 5 minutes
- **Performance Budget Violations**: When any budget is exceeded
- **Critical API Errors**: >5 API errors in 1 minute
- **Render Job Failures**: >3 failures in 10 minutes
- **Memory Leak Detection**: Memory usage >500MB
- **Transaction Duration**: Transactions >5 seconds
- **P95 Response Time**: >1 second
- **Apdex Score**: <0.8
- **Error Rate**: >5%
- **Throughput Drop**: <100 requests/minute

## Usage

### In React Components

```typescript
import { useMetrics } from '@/hooks/useMetrics';

function MyComponent() {
  const { trackInteraction, trackApiCall, trackTiming } = useMetrics({
    componentName: 'MyComponent',
    trackRender: true,
    trackInteractions: true,
  });

  const handleClick = () => {
    trackInteraction('button-click', { buttonId: 'submit' });
  };

  const fetchData = async () => {
    return trackApiCall('/api/data', async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### In API Routes

```typescript
import { apiMetrics } from '@/lib/metrics';

// Metrics are automatically tracked via middleware
// Manual tracking for custom operations:
apiMetrics.recordDatabaseQuery('select', 'users', 45, 100);
apiMetrics.recordExternalCall('openai', 'generate', 2500, true);
apiMetrics.recordCustom('cache.hit.rate', 0.85, 'ratio');
```

### In Worker Jobs

```typescript
import { workerMetrics } from '@/lib/metrics';

// Metrics are automatically tracked in processRenderJob
// Manual tracking for custom operations:
workerMetrics.recordJobStart(jobId, 'custom.job');
workerMetrics.recordJobComplete({
  jobId,
  jobType: 'custom.job',
  duration: 1000,
  success: true,
  metadata: { customField: 'value' }
});
```

## Performance Dashboard

Access the performance dashboard at `/monitoring` (requires authentication).

The dashboard displays:
- System health status
- Performance budget violations
- Real-time metrics with statistical analysis
- API performance metrics
- Frontend performance metrics

## Environment Variables

Required environment variables:

```env
# Sentry Configuration
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug

# Optional: Slack Integration
SLACK_WEBHOOK_URL=your-slack-webhook
```

## Debugging

### Enable Debug Mode

Set `SENTRY_DEBUG=true` in development to see detailed Sentry logs.

### View Metrics Locally

In development, metrics are logged to the console when `NODE_ENV=development`.

### Test Alerts

Use the Sentry UI to test alert rules or trigger them manually:

```typescript
// Trigger a test alert
Sentry.captureMessage('Performance budget exceeded: test.metric', 'warning');
```

## Best Practices

1. **Set Realistic Budgets**: Start with generous budgets and tighten based on actual performance
2. **Track Key User Journeys**: Focus metrics on critical user paths
3. **Monitor Trends**: Look for gradual degradation over time
4. **Act on Alerts**: Investigate and fix performance issues promptly
5. **Regular Reviews**: Review and adjust budgets quarterly

## Troubleshooting

### Metrics Not Appearing
- Ensure Sentry is initialized before any metrics are recorded
- Check that transactions are being created and finished
- Verify environment variables are set correctly

### Alerts Not Firing
- Check alert configuration in Sentry UI
- Verify thresholds are appropriate
- Ensure notification channels are configured

### Performance Issues
- Use the performance dashboard to identify bottlenecks
- Check for budget violations
- Review transaction traces in Sentry