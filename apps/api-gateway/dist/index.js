'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
require('dotenv/config');
console.log('Starting API Gateway...');
const cors_1 = __importDefault(require('@fastify/cors'));
const rate_limit_1 = __importDefault(require('@fastify/rate-limit'));
const fastify_1 = require('@trpc/server/adapters/fastify');
const fastify_2 = __importDefault(require('fastify'));
console.log('Imports loaded...');
const context_1 = require('./context');
const cors_2 = require('./lib/cors');
const rateLimit_1 = require('./lib/rateLimit');
const router_1 = require('./router');
// Initialize Sentry before anything else
// initSentry();
console.log('Creating Fastify server...');
const server = (0, fastify_2.default)({
  maxParamLength: 5000,
  trustProxy: true, // Trust proxy headers for accurate IP addresses
});
// Register CORS
server.register(cors_1.default, (0, cors_2.getCorsOptions)());
// Register rate limiting
server.register(rate_limit_1.default, (0, rateLimit_1.getRateLimitOptions)());
// Add security headers
server.addHook('onSend', async (_request, reply) => {
  Object.entries(cors_2.securityHeaders).forEach(([key, value]) => {
    reply.header(key, value);
  });
});
server.register(fastify_1.fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: router_1.appRouter, createContext: context_1.createContext },
});
server.get('/', async () => {
  return { hello: 'world' };
});
(async () => {
  try {
    console.log('Starting server on port 3001...');
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('API Gateway listening on port 3001');
    server.log.info('API Gateway listening on port 3001');
  } catch (err) {
    console.error('Failed to start server:', err);
    server.log.error(err);
    process.exit(1);
  }
})();
