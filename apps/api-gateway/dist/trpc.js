"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedProcedure = exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const sentry_1 = require("./lib/sentry");
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
exports.router = t.router;
exports.publicProcedure = t.procedure.use(sentryMiddleware);
exports.protectedProcedure = t.procedure.use(sentryMiddleware).use(authMiddleware);
