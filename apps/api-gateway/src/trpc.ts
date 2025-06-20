import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';

import type { Context } from './context';
import { captureException } from './lib/sentry';
import { metricsMiddleware } from './middleware/metrics';
import { rateLimiter, rateLimits } from './middleware/rate-limit';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Middleware to catch and report errors to Sentry
const sentryMiddleware = t.middleware(async ({ next, path, type }) => {
  try {
    const result = await next();
    return result;
  } catch (error) {
    // Only capture non-client errors
    if (error instanceof TRPCError && error.code !== 'BAD_REQUEST') {
      captureException(error, {
        path,
        type,
        code: error.code,
      });
    } else if (!(error instanceof TRPCError)) {
      captureException(error as Error, {
        path,
        type,
      });
    }
    throw error;
  }
});

// Authentication middleware
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return next();
});

// Rate limiting middleware
const publicRateLimitMiddleware = rateLimiter.middleware(rateLimits.public);
const apiRateLimitMiddleware = rateLimiter.middleware(rateLimits.api);

export const router = t.router;
export const publicProcedure = t.procedure
  .use(publicRateLimitMiddleware)
  .use(metricsMiddleware)
  .use(sentryMiddleware);
export const protectedProcedure = t.procedure
  .use(apiRateLimitMiddleware)
  .use(metricsMiddleware)
  .use(sentryMiddleware)
  .use(authMiddleware);

// Specialized procedures with different rate limits
export const authProcedure = t.procedure
  .use(rateLimiter.middleware(rateLimits.auth))
  .use(metricsMiddleware)
  .use(sentryMiddleware);

export const renderProcedure = t.procedure
  .use(rateLimiter.middleware(rateLimits.render))
  .use(metricsMiddleware)
  .use(sentryMiddleware)
  .use(authMiddleware);
