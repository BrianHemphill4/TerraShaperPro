import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  
  // Performance Monitoring
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Set sampling rules
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (SENTRY_ENVIRONMENT === 'production' && !hint.originalException) {
      return null;
    }
    
    // Don't send events in development unless explicitly enabled
    if (SENTRY_ENVIRONMENT === 'development' && !process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
      return null;
    }
    
    // Don't send if user has opted out
    if (typeof window !== 'undefined' && window.localStorage?.getItem('disable-error-tracking') === 'true') {
      return null;
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    new Sentry.BrowserTracing({
      // Navigation transactions
      routingInstrumentation: Sentry.nextRouterInstrumentation,
      
      // Set transaction names
      beforeNavigate: (context) => {
        return {
          ...context,
          name: context.name.replace(/\[[\w-]+\]/g, '[param]'),
        };
      },
    }),
    new Sentry.Replay({
      // Mask all text content by default
      maskAllText: true,
      maskAllInputs: true,
      
      // Block certain DOM elements
      blockSelector: '[data-sentry-block]',
      
      // Ignore certain DOM elements
      ignoreSelector: '[data-sentry-ignore]',
      
      // Privacy settings
      blockAllMedia: true,
      
      // Network recording
      networkDetailAllowUrls: [window.location.origin],
      networkCaptureBodies: false,
      networkRequestHeaders: ['X-Transaction-ID'],
    }),
  ],
  
  // Additional options
  attachStacktrace: true,
  autoSessionTracking: true,
  sendDefaultPii: false,
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    
    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    'The request is not allowed by the user agent',
    
    // User-caused errors
    'AbortError',
    'User cancelled',
    'Request aborted',
    
    // React errors we handle gracefully
    'ChunkLoadError',
    'Loading chunk',
    
    // Third-party errors
    'Script error',
    'Cross origin',
  ],
  
  // Deny list for transactions
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    
    // Other browsers
    /^safari-extension:\/\//i,
    /^safari-web-extension:\/\//i,
    
    // Common crawlers
    /bot|crawler|spider|crawling/i,
    
    // Development tools
    /localhost:[\d]+\/__nextjs/i,
  ],
  
  // Transport options
  transportOptions: {
    // Keep connections alive
    keepalive: true,
  },
});