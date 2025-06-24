"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cspConfig = exports.securityHeaders = void 0;
exports.addSecurityHeaders = addSecurityHeaders;
exports.configureRequestLimits = configureRequestLimits;
/**
 * OWASP-compliant security headers configuration
 */
exports.securityHeaders = {
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
    Pragma: 'no-cache',
    Expires: '0',
    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Expect-CT': 'max-age=86400, enforce',
};
/**
 * Content Security Policy configuration
 */
exports.cspConfig = {
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
/**
 * Apply security headers middleware to Fastify instance
 */
function addSecurityHeaders(app) {
    app.addHook('onRequest', async (request, reply) => {
        // Add custom security headers
        Object.entries(exports.securityHeaders).forEach(([key, value]) => {
            reply.header(key, value);
        });
        // Remove sensitive headers that expose server information
        reply.removeHeader('X-Powered-By');
        reply.removeHeader('Server');
    });
}
/**
 * Configure request limits for security
 */
function configureRequestLimits(app) {
    // Implement request size limits
    app.server.maxHeadersCount = 100;
    app.server.headersTimeout = 60000; // 60 seconds
    app.server.requestTimeout = 300000; // 5 minutes
}
