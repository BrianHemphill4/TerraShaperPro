import { TRPCError } from '@trpc/server';
import * as Sentry from '@sentry/node';
import { apiMetrics } from '../lib/metrics';
import type { Context } from '../context';

export const metricsMiddleware = async ({
  ctx,
  next,
  path,
  type,
}: {
  ctx: Context;
  next: () => Promise<any>;
  path: string;
  type: 'query' | 'mutation' | 'subscription';
}) => {
  const start = performance.now();
  let success = true;
  let errorCode: string | undefined;
  
  // Start Sentry transaction
  const transaction = Sentry.startTransaction({
    name: `trpc.${path}`,
    op: `trpc.${type}`,
    tags: {
      'trpc.path': path,
      'trpc.type': type,
      'user.id': ctx.user?.id || 'anonymous',
    },
  });
  
  Sentry.getCurrentHub().configureScope(scope => {
    scope.setSpan(transaction);
  });
  
  try {
    const result = await next();
    return result;
  } catch (error) {
    success = false;
    if (error instanceof TRPCError) {
      errorCode = error.code;
    }
    throw error;
  } finally {
    const duration = performance.now() - start;
    
    // Record metrics
    apiMetrics.recordTrpcCall(path, duration, success, {
      type,
      userId: ctx.user?.id || 'anonymous',
      errorCode: errorCode || '',
    });
    
    // Finish transaction
    transaction.setStatus(success ? 'ok' : 'internal_error');
    transaction.finish();
  }
};