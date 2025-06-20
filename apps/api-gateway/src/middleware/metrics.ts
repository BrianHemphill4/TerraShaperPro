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
  
  // Set Sentry tags for this operation
  Sentry.setTag('trpc.path', path);
  Sentry.setTag('trpc.type', type);
  Sentry.setTag('user.id', ctx.session?.userId || 'anonymous');
  
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
      userId: ctx.session?.userId || 'anonymous',
      errorCode: errorCode || '',
    });
    
    // Report performance metric
    if (!success && errorCode) {
      Sentry.setTag('error.code', errorCode);
    }
  }
};