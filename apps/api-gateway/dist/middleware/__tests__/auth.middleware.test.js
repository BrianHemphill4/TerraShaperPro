"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@trpc/server");
const vitest_1 = require("vitest");
const context_1 = require("../../context");
const trpc_1 = require("../../trpc");
const appRouter = (0, trpc_1.router)({
    ping: trpc_1.protectedProcedure.query(() => 'pong'),
});
(0, vitest_1.describe)('Auth Middleware', () => {
    (0, vitest_1.it)('should allow authenticated requests', async () => {
        const ctx = (0, context_1.createContext)({});
        const caller = appRouter.createCaller(ctx);
        await (0, vitest_1.expect)(caller.ping()).resolves.toBe('pong');
    });
    (0, vitest_1.it)('should reject unauthenticated requests', async () => {
        const ctx = (0, context_1.createContext)({});
        // Remove session to simulate unauthenticated user
        // @ts-expect-error: deliberately unset session for test
        ctx.session = undefined;
        const caller = appRouter.createCaller(ctx);
        await (0, vitest_1.expect)(caller.ping()).rejects.toBeInstanceOf(server_1.TRPCError);
    });
});
