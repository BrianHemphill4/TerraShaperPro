import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';

import { createContext } from './context';
import { getCorsOptions, securityHeaders } from './lib/cors';
import { getRateLimitOptions } from './lib/rateLimit';
import { initSentry } from './lib/sentry';
import { appRouter } from './router';

// Initialize Sentry before anything else
initSentry();

const server = Fastify({
  maxParamLength: 5000,
  trustProxy: true, // Trust proxy headers for accurate IP addresses
});

// Register CORS
server.register(cors, getCorsOptions());

// Register rate limiting
server.register(rateLimit, getRateLimitOptions());

// Add security headers
server.addHook('onSend', async (request, reply) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    reply.header(key, value);
  });
});

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});

server.get('/', async () => {
  return { hello: 'world' };
});

(async () => {
  try {
    await server.listen({ port: 3001 });
    server.log.info('API Gateway listening on port 3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
