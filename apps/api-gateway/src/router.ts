import { z } from 'zod';

import { billingRouter } from './routers/billing.router';
import { clientPortalRouter } from './routers/client-portal.router';
import { creditRouter } from './routers/credit.router';
import { exportRouter } from './routers/export.router';
import { maskRouter } from './routers/mask.router';
import { plantRouter } from './routers/plant.router';
import { projectRouter } from './routers/project.router';
import { renderRouter } from './routers/render.router';
import { sceneRouter } from './routers/scene.router';
import { storageRouter } from './routers/storage.router';
import { teamRouter } from './routers/team.router';
import { publicProcedure, router } from './trpc';

const healthRouter = router({
  healthz: publicProcedure.query(() => 'yay!'),
});

export const appRouter = router({
  health: healthRouter,
  render: renderRouter,
  storage: storageRouter,
  credit: creditRouter,
  plant: plantRouter,
  project: projectRouter,
  scene: sceneRouter,
  mask: maskRouter,
  export: exportRouter,
  team: teamRouter,
  clientPortal: clientPortalRouter,
  billing: billingRouter,
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
