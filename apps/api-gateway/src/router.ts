import { z } from 'zod';

import { renderRouter } from './routers/render.router';
import { storageRouter } from './routers/storage.router';
import { publicProcedure, router } from './trpc';

const healthRouter = router({
  healthz: publicProcedure.query(() => 'yay!'),
});

export const appRouter = router({
  health: healthRouter,
  render: renderRouter,
  storage: storageRouter,
  hello: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        text: `hello ${input.name}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
