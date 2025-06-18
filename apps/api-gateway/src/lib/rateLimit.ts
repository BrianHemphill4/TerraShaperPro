import type { FastifyRateLimitOptions } from '@fastify/rate-limit';

export const getRateLimitOptions = (): FastifyRateLimitOptions => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return {
    global: true,
    max: isDevelopment ? 1000 : 100, // requests per window
    timeWindow: '1 minute',

    // Different limits for different routes
    keyGenerator: (request: any) => {
      // Use IP address as key
      return request.ip;
    },

    // Skip rate limiting for health checks
    skipOnError: false,
    skipSuccessfulRequests: false,

    // Custom error response
    errorResponseBuilder: (request: any, context: any) => {
      return {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later.',
        retry: context.after,
        limit: context.max,
        remaining: context.remaining,
        reset: new Date(context.reset).toISOString(),
      };
    },

    // Add rate limit headers
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },

    // Enable cache for distributed systems
    // In production, you might want to use Redis instead
    cache: 10000,

    // Allow list for internal services
    allowList: (request: any) => {
      // Allow health checks
      if (request.url === '/' || request.url === '/health') {
        return true;
      }

      // Allow internal IPs in production
      const internalIPs = ['127.0.0.1', '::1'];
      if (!isDevelopment && internalIPs.includes(request.ip)) {
        return true;
      }

      return false;
    },
  };
};

// Strict rate limit for authentication endpoints
export const authRateLimitOptions: FastifyRateLimitOptions = {
  max: 5,
  timeWindow: '15 minutes',
  keyGenerator: (request: any) => {
    // Use both IP and endpoint for auth routes
    return `${request.ip}:${request.routerPath}`;
  },
};

// Relaxed rate limit for public API endpoints
export const apiRateLimitOptions: FastifyRateLimitOptions = {
  max: 200,
  timeWindow: '1 minute',
  keyGenerator: (request: any) => {
    // Include auth token if available
    const token = request.headers.authorization?.replace('Bearer ', '');
    return token ? `token:${token}` : `ip:${request.ip}`;
  },
};
