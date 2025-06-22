import type { FastifyInstance } from 'fastify';

import { SecurityService } from './security';

/**
 * Main security configuration function for backward compatibility
 * @deprecated Use SecurityService class directly for better modularity
 */
export async function configureSecurityMiddleware(app: FastifyInstance): Promise<void> {
  const securityService = new SecurityService(app);
  await securityService.configure();
}

// Re-export commonly used configurations for backward compatibility
export * from './security';
