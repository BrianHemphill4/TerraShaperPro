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
      ...Sentry.getDefaultIntegrations({}),
      nodeProfilingIntegration(),
    ],

    // Set transaction name source
    beforeSend(event, _hint) {
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

export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

export function clearUser() {
  Sentry.setUser(null);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
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
