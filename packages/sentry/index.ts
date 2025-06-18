import * as Sentry from '@sentry/nextjs';
import type { User } from '@clerk/nextjs/server';

export type SentryLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export interface ErrorContext {
  level?: SentryLevel;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: Partial<User>;
  fingerprint?: string[];
}

/**
 * Capture an exception with context
 */
export function captureException(error: Error | unknown, context?: ErrorContext): string {
  const { level = 'error', tags, extra, user, fingerprint } = context || {};
  
  // Set user context if provided
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      username: user.username || undefined,
    });
  }
  
  // Configure scope
  const eventId = Sentry.withScope((scope) => {
    // Set level
    scope.setLevel(level);
    
    // Set tags
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    // Set extra context
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Set fingerprint for grouping
    if (fingerprint) {
      scope.setFingerprint(fingerprint);
    }
    
    // Capture the exception
    return Sentry.captureException(error);
  });
  
  return eventId;
}

/**
 * Capture a message with context
 */
export function captureMessage(message: string, context?: ErrorContext): string {
  const { level = 'info', tags, extra, user, fingerprint } = context || {};
  
  // Set user context if provided
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      username: user.username || undefined,
    });
  }
  
  // Configure scope
  const eventId = Sentry.withScope((scope) => {
    // Set level
    scope.setLevel(level);
    
    // Set tags
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    // Set extra context
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Set fingerprint for grouping
    if (fingerprint) {
      scope.setFingerprint(fingerprint);
    }
    
    // Capture the message
    return Sentry.captureMessage(message, level);
  });
  
  return eventId;
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>,
  level: Sentry.SeverityLevel = 'info'
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Create a transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string,
  data?: Record<string, any>
): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op,
    data,
  });
}

/**
 * Profile a function execution
 */
export async function profileAsync<T>(
  fn: () => Promise<T>,
  name: string,
  op: string = 'function'
): Promise<T> {
  const transaction = startTransaction(name, op);
  
  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * Set user context for all events
 */
export function setUserContext(user: Partial<User> | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      username: user.username || undefined,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Clear all context
 */
export function clearContext(): void {
  Sentry.configureScope((scope) => {
    scope.clear();
  });
}

/**
 * Flush all pending events
 */
export async function flush(timeout: number = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}

// Re-export Sentry for convenience
export { Sentry };