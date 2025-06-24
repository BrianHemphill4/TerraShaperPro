"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@trpc/server");
const vitest_1 = require("vitest");
const zod_1 = require("zod");
const context_1 = require("../../context");
const trpc_1 = require("../../trpc");
const appRouter = (0, trpc_1.router)({
    echo: trpc_1.publicProcedure
        .input(zod_1.z.object({ message: zod_1.z.string() }))
        .mutation(({ input }) => input.message),
});
(0, vitest_1.describe)('Validation Middleware / Error Formatter', () => {
    (0, vitest_1.it)('should return BAD_REQUEST with zodError for invalid input', async () => {
        const caller = appRouter.createCaller((0, context_1.createContext)({}));
        let error;
        try {
            // @ts-expect-error: intentionally passing wrong type
            await caller.echo({ message: 123 });
        }
        catch (err) {
            error = err;
        }
        (0, vitest_1.expect)(error).toBeInstanceOf(server_1.TRPCError);
        if (error instanceof server_1.TRPCError) {
            (0, vitest_1.expect)(error.code).toBe('BAD_REQUEST');
            // The formatted error is available on error.shape in tRPC, but we test data presence
            // @ts-expect-error: TRPCError may not have cause.flatten in types
            (0, vitest_1.expect)(error.cause.flatten || error.cause).toBeTruthy();
        }
    });
});
