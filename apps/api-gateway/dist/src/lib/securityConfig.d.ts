import type { FastifyInstance } from 'fastify';
/**
 * Main security configuration function for backward compatibility
 * @deprecated Use SecurityService class directly for better modularity
 */
export declare function configureSecurityMiddleware(app: FastifyInstance): Promise<void>;
export * from './security';
