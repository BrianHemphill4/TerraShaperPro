import { FastifyCorsOptions } from '@fastify/cors';

export const getCorsOptions = (): FastifyCorsOptions => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Render worker should have more restrictive CORS since it's internal
  const allowedOrigins = isDevelopment
    ? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ]
    : [
        process.env.API_GATEWAY_URL || 'https://api.terrashaperpro.com',
        // Only allow internal services in production
      ].filter(Boolean);

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (internal service calls)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow all origins for testing
      if (isDevelopment) {
        return callback(null, true);
      }

      // Reject origin in production
      return callback(new Error('Not allowed by CORS'), false);
    },
    
    // Allowed methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    // Allowed headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Job-ID',
      'X-Worker-ID',
    ],
    
    // Expose headers to the client
    exposedHeaders: [
      'X-Request-ID',
      'X-Job-ID',
      'X-Worker-ID',
      'X-Processing-Time',
    ],
    
    // Allow credentials for internal service auth
    credentials: true,
    
    // Cache preflight response for 1 hour
    maxAge: 3600,
    
    // Add CORS headers to errors
    preflightContinue: false,
    
    // Add CORS headers to successful responses
    optionsSuccessStatus: 204,
  };
};

// Security headers for render worker
export const securityHeaders = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent content type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Referrer policy
  'Referrer-Policy': 'no-referrer',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy for worker
  'Content-Security-Policy': [
    "default-src 'none'",
    "script-src 'self'",
    "connect-src 'self' https://api.sentry.io",
    "img-src 'self' data: https:",
    "style-src 'self'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; '),
  
  // Additional worker-specific headers
  'X-Worker-Type': 'render',
  'X-Service-Name': 'render-worker',
};