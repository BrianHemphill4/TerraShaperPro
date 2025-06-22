/**
 * CORS configuration for secure cross-origin requests
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://terrashaperpro.com',
      'https://www.terrashaperpro.com',
      'https://app.terrashaperpro.com',
    ];

    // Allow requests with no origin (like mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string): boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://terrashaperpro.com',
    'https://www.terrashaperpro.com',
    'https://app.terrashaperpro.com',
  ];

  return allowedOrigins.includes(origin);
}

/**
 * Get CORS configuration for specific environment
 */
export function getCorsConfig(environment: 'development' | 'staging' | 'production') {
  const baseConfig = { ...corsConfig };

  if (environment === 'development') {
    // More permissive for development
    return {
      ...baseConfig,
      origin: true, // Allow all origins in development
    };
  }

  if (environment === 'staging') {
    // Add staging domains
    const stagingOrigins = [
      'https://staging.terrashaperpro.com',
      'https://preview.terrashaperpro.com',
    ];

    return {
      ...baseConfig,
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        const allAllowed = ['http://localhost:3000', 'http://localhost:3001', ...stagingOrigins];

        if (!origin || allAllowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    };
  }

  return baseConfig; // Production config
}
