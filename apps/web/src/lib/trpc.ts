import type { AppRouter } from '@terrasherper/api-gateway';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/trpc',
      headers() {
        return {
          'content-type': 'application/json',
        };
      },
    }),
  ],
});