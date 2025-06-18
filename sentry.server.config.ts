import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  
  // Performance Monitoring
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  
  // Profiling
  profilesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Set sampling rules
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (SENTRY_ENVIRONMENT === 'production' && !hint.originalException) {
      return null;
    }
    
    // Don't send events in development unless explicitly enabled
    if (SENTRY_ENVIRONMENT === 'development' && !process.env.SENTRY_ENABLED) {
      return null;
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    // Default integrations will be added automatically
  ],
  
  // Keep default integrations
  
  // Additional options
  attachStacktrace: true,
  autoSessionTracking: true,
  sendDefaultPii: false,
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    
    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    
    // User-caused errors
    'AbortError',
    'User cancelled',
  ],
  
  // Deny list for transactions
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    
    // Common crawlers
    /bot|crawler|spider|crawling/i,
  ],
});