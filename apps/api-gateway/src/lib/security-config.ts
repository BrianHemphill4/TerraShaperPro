import helmet from 'helmet';
import type { FastifyInstance } from 'fastify';

// OWASP Security Headers Configuration
export const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Restrict browser features
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=()',
  
  // HSTS - Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevent DNS prefetching
  'X-DNS-Prefetch-Control': 'off',
  
  // Disable client-side caching for sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  
  // Additional security headers
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Expect-CT': 'max-age=86400, enforce',
};

// Content Security Policy configuration
export const cspConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  connectSrc: ["'self'", 'https://api.openai.com', 'https://storage.googleapis.com'],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined,
};

// Apply security configuration to Fastify
export function applySecurityConfig(app: FastifyInstance): void {
  // Register helmet for security headers
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: cspConfig,
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  // Additional security hooks
  app.addHook('onRequest', async (request, reply) => {
    // Add custom security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      reply.header(key, value);
    });
    
    // Remove sensitive headers
    reply.removeHeader('X-Powered-By');
    reply.removeHeader('Server');
  });

  // Implement request size limits
  app.server.maxHeadersCount = 100;
  app.server.headersTimeout = 60000; // 60 seconds
  app.server.requestTimeout = 300000; // 5 minutes
}

// Session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-this-in-production',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    path: '/',
  },
};

// CORS configuration
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

// File upload configuration
export const fileUploadConfig = {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10, // Max 10 files per request
    fields: 50, // Max 50 fields
    headerPairs: 100, // Max 100 header pairs
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp',
  preserveExtension: true,
  safeFileNames: true,
  stripBasename: {
    errorOnNull: true,
    maintainCase: false,
  },
};

// Allowed file types and their MIME types
export const allowedFileTypes = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  documents: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  data: {
    extensions: ['.json', '.csv'],
    mimeTypes: ['application/json', 'text/csv'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

// API Key configuration
export const apiKeyConfig = {
  header: 'X-API-Key',
  prefix: 'tsp_',
  length: 32,
  expirationDays: 90,
};

// Encryption configuration
export const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyDerivation: 'pbkdf2',
  iterations: 100000,
  keyLength: 32,
  saltLength: 16,
  tagLength: 16,
};

// Password policy
export const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxConsecutiveChars: 3,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
  passwordHistoryCount: 5,
  maxAge: 90, // days
};