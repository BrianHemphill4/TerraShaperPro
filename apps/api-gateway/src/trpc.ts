import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { captureException } from './lib/sentry';
import { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

// Middleware to catch and report errors to Sentry
const sentryMiddleware = t.middleware(async ({ next, ctx, path, type }) => {
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

export const router = t.router;
export const publicProcedure = t.procedure.use(sentryMiddleware); 