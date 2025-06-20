export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    const { nodeProfilingIntegration } = await import('@sentry/profiling-node');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 1.0,
      
      // Integrations
      integrations: [
        nodeProfilingIntegration(),
        // Database query monitoring
        Sentry.prismaIntegration({
          client: await import('@terrashaper/db').then(m => m.prisma),
        }),
        // HTTP monitoring
        Sentry.httpIntegration({
          tracing: true,
          breadcrumbs: true,
        }),
        // Console monitoring
        Sentry.captureConsoleIntegration({
          levels: ['error', 'warn'],
        }),
      ],
      
      // Performance monitoring options
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/api\.terrashaper\.com/,
        /^https:\/\/.+\.terrashaper\.com/,
      ],
      
      // Enhanced transaction sampling
      tracesSampler: (samplingContext) => {
        // Always sample critical transactions
        if (samplingContext.name?.includes('/api/render') || 
            samplingContext.name?.includes('/api/billing')) {
          return 1.0;
        }
        // Sample 50% of authenticated user transactions
        if (samplingContext.request?.headers?.authorization) {
          return 0.5;
        }
        // Default sampling rate
        return process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
      },
      
      // Before send hook for additional filtering
      beforeSend(event, hint) {
        // Skip development errors in production
        if (process.env.NODE_ENV === 'production' && 
            event.exception?.values?.[0]?.value?.includes('development')) {
          return null;
        }
        return event;
      },
      
      // Transaction filtering
      beforeTransaction(transaction) {
        // Add custom tags
        transaction.setTag('runtime', process.env.NEXT_RUNTIME);
        transaction.setTag('deployment', process.env.VERCEL_ENV || 'local');
        
        return transaction;
      },
    });
  }
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
  }
}