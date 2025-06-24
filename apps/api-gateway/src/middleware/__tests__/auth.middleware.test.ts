import { TRPCError } from '@trpc/server';
import { describe, expect,it } from 'vitest';

import { createContext } from '../../context';
import { protectedProcedure, router } from '../../trpc';

const appRouter = router({
  ping: protectedProcedure.query(() => 'pong'),
});

describe('Auth Middleware', () => {
  it('should allow authenticated requests', async () => {
    const ctx = createContext({} as any);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.ping()).resolves.toBe('pong');
  });

  it('should reject unauthenticated requests', async () => {
    const ctx = createContext({} as any);
    // Remove session to simulate unauthenticated user
    // @ts-expect-error: deliberately unset session for test
    ctx.session = undefined;
    const caller = appRouter.createCaller(ctx);

    await expect(caller.ping()).rejects.toBeInstanceOf(TRPCError);
  });
}); 