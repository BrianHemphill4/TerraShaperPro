import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  // For now, we're not using the request or response objects
  // but this is where you would add things like user authentication
  return {};
}

export type Context = Awaited<ReturnType<typeof createContext>>; 