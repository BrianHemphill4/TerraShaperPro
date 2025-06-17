import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
    
    integrations: [
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      nodeProfilingIntegration(),
    ],
    
    // Set transaction name source
    beforeSend(event, hint) {
      // Sanitize any sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
    
    // Configure error filtering
    ignoreErrors: [
      // Ignore common browser errors
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Ignore specific HTTP status codes
      /^4\d{2}$/,
    ],
  });
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export function setJobContext(jobId: string, jobData: any) {
  Sentry.setContext('job', {
    id: jobId,
    type: jobData.type,
    userId: jobData.userId,
    projectId: jobData.projectId,
  });
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op });
}

export function withSentry<T extends (...args: any[]) => any>(
  fn: T,
  options?: { name?: string; op?: string }
): T {
  return ((...args: Parameters<T>) => {
    return Sentry.startSpan(
      {
        name: options?.name || fn.name || 'anonymous',
        op: options?.op || 'function',
      },
      () => fn(...args)
    );
  }) as T;
}