'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.appRouter = void 0;
const zod_1 = require('zod');
const trpc_1 = require('./trpc');
const healthRouter = (0, trpc_1.router)({
  healthz: trpc_1.publicProcedure.query(() => 'yay!'),
});
exports.appRouter = (0, trpc_1.router)({
  health: healthRouter,
  hello: trpc_1.publicProcedure
    .input(
      zod_1.z.object({
        name: zod_1.z.string(),
      })
    )
    .query(({ input }) => {
      return {
        text: `hello ${input.name}`,
      };
    }),
});
