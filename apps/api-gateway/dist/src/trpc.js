"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderProcedure = exports.authProcedure = exports.protectedProcedure = exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const sentry_1 = require("./lib/sentry");
const metrics_1 = require("./middleware/metrics");
const rate_limit_1 = require("./middleware/rate-limit");
const t = server_1.initTRPC.context().create({
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof zod_1.ZodError ? error.cause.flatten() : null,
            },
        };
    },
});
// Middleware to catch and report errors to Sentry
const sentryMiddleware = t.middleware(async ({ next, path, type }) => {
    try {
        const result = await next();
        return result;
    }
    catch (error) {
        // Only capture non-client errors
        if (error instanceof server_1.TRPCError && error.code !== 'BAD_REQUEST') {
            (0, sentry_1.captureException)(error, {
                path,
                type,
                code: error.code,
            });
        }
        else if (!(error instanceof server_1.TRPCError)) {
            (0, sentry_1.captureException)(error, {
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
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
        });
    }
    return next();
});
// Rate limiting middleware
const publicRateLimitMiddleware = rate_limit_1.rateLimiter.middleware(rate_limit_1.rateLimits.public);
const apiRateLimitMiddleware = rate_limit_1.rateLimiter.middleware(rate_limit_1.rateLimits.api);
exports.router = t.router;
exports.publicProcedure = t.procedure
    .use(publicRateLimitMiddleware)
    .use(metrics_1.metricsMiddleware)
    .use(sentryMiddleware);
exports.protectedProcedure = t.procedure
    .use(apiRateLimitMiddleware)
    .use(metrics_1.metricsMiddleware)
    .use(sentryMiddleware)
    .use(authMiddleware);
// Specialized procedures with different rate limits
exports.authProcedure = t.procedure
    .use(rate_limit_1.rateLimiter.middleware(rate_limit_1.rateLimits.auth))
    .use(metrics_1.metricsMiddleware)
    .use(sentryMiddleware);
exports.renderProcedure = t.procedure
    .use(rate_limit_1.rateLimiter.middleware(rate_limit_1.rateLimits.render))
    .use(metrics_1.metricsMiddleware)
    .use(sentryMiddleware)
    .use(authMiddleware);
