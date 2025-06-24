"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = exports.getCorsOptions = void 0;
const getCorsOptions = () => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    // Allowed origins based on environment
    const allowedOrigins = isDevelopment
        ? [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
        ]
        : [
            process.env.NEXT_PUBLIC_APP_URL || 'https://terrashaperpro.com',
            'https://www.terrashaperpro.com',
            // Add any other production domains here
        ].filter(Boolean);
    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g., mobile apps, Postman)
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
            'X-Requested-With',
            'Accept',
            'Origin',
            'x-trpc-source',
        ],
        // Expose headers to the client
        exposedHeaders: ['x-trpc-source'],
        // Allow credentials (cookies, authorization headers)
        credentials: true,
        // Cache preflight response for 24 hours
        maxAge: 86400,
        // Add CORS headers to errors
        preflightContinue: false,
        // Add CORS headers to successful responses
        optionsSuccessStatus: 204,
    };
};
exports.getCorsOptions = getCorsOptions;
// Security headers middleware
exports.securityHeaders = {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',
    // Prevent content type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Force HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://api.sentry.io",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; '),
};
