import { publicProcedure, router } from './trpc';
import { z } from 'zod';

const healthRouter = router({
  healthz: publicProcedure.query(() => 'yay!'),
});

export const appRouter = router({
  health: healthRouter,
  hello: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ input }) => {
      return {
        text: `hello ${input.name}`,
      };
    }),
});

export type AppRouter = typeof appRouter; 