'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.appRouter = void 0;
const zod_1 = require('zod');
const credit_router_1 = require('./routers/credit.router');
const plant_router_1 = require('./routers/plant.router');
const render_router_1 = require('./routers/render.router');
const storage_router_1 = require('./routers/storage.router');
const trpc_1 = require('./trpc');
const healthRouter = (0, trpc_1.router)({
  healthz: trpc_1.publicProcedure.query(() => 'yay!'),
});
exports.appRouter = (0, trpc_1.router)({
  health: healthRouter,
  render: render_router_1.renderRouter,
  storage: storage_router_1.storageRouter,
  credit: credit_router_1.creditRouter,
  plant: plant_router_1.plantRouter,
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
