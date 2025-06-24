import type { FastifyInstance } from 'fastify';
import { corsConfig } from './cors';
import { cspConfig } from './headers';
/**
 * Main security configuration service that orchestrates all security modules
 */
export declare class SecurityService {
    private app;
    constructor(app: FastifyInstance);
    /**
     * Apply all security configurations to the Fastify instance
     */
    configure(): Promise<void>;
    /**
     * Configure Helmet security middleware
     */
    private configureHelmet;
    /**
     * Add custom security headers
     */
    private addCustomHeaders;
    /**
     * Configure request limits
     */
    private configureRequestLimits;
}
export * from './authConfig';
export * from './cors';
export * from './encryption';
export * from './fileValidation';
export * from './headers';
export { corsConfig };
export { cspConfig };
