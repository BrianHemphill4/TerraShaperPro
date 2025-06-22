import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

import { corsConfig } from './cors';
import { addSecurityHeaders, configureRequestLimits, cspConfig } from './headers';

/**
 * Main security configuration service that orchestrates all security modules
 */
export class SecurityService {
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  /**
   * Apply all security configurations to the Fastify instance
   */
  async configure(): Promise<void> {
    await this.configureHelmet();
    this.addCustomHeaders();
    this.configureRequestLimits();
  }

  /**
   * Configure Helmet security middleware
   */
  private async configureHelmet(): Promise<void> {
    await this.app.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          connectSrc: ["'self'", 'https:'],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'self'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    });
  }

  /**
   * Add custom security headers
   */
  private addCustomHeaders(): void {
    addSecurityHeaders(this.app);
  }

  /**
   * Configure request limits
   */
  private configureRequestLimits(): void {
    configureRequestLimits(this.app);
  }
}

// Re-export all security modules for convenient access
export * from './auth-config';
export * from './cors';
export * from './encryption';
export * from './file-validation';
export * from './headers';

// Legacy exports for backward compatibility
export { corsConfig };
export { cspConfig };
