import { TRPCError } from '@trpc/server';
import { describe, expect,it } from 'vitest';
import { z } from 'zod';

import { createContext } from '../../context';
import { publicProcedure,router } from '../../trpc';

const appRouter = router({
  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => input.message),
});

describe('Validation Middleware / Error Formatter', () => {
  it('should return BAD_REQUEST with zodError for invalid input', async () => {
    const caller = appRouter.createCaller(createContext({} as any));
    let error: unknown;
    try {
      // @ts-expect-error: intentionally passing wrong type
      await caller.echo({ message: 123 });
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(TRPCError);

    if (error instanceof TRPCError) {
      expect(error.code).toBe('BAD_REQUEST');
      // The formatted error is available on error.shape in tRPC, but we test data presence
      // @ts-expect-error: TRPCError may not have cause.flatten in types
      expect(error.cause.flatten || error.cause).toBeTruthy();
    }
  });
}); 