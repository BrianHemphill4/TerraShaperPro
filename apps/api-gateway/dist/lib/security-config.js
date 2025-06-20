"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordPolicy = exports.encryptionConfig = exports.apiKeyConfig = exports.allowedFileTypes = exports.fileUploadConfig = exports.corsConfig = exports.sessionConfig = exports.cspConfig = exports.securityHeaders = void 0;
exports.applySecurityConfig = applySecurityConfig;
const helmet_1 = __importDefault(require("helmet"));
// OWASP Security Headers Configuration
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
    'Pragma': 'no-cache',
    'Expires': '0',
    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Expect-CT': 'max-age=86400, enforce',
};
// Content Security Policy configuration
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
// Apply security configuration to Fastify
function applySecurityConfig(app) {
    // Register helmet for security headers
    app.register(helmet_1.default, {
        contentSecurityPolicy: {
            directives: exports.cspConfig,
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
        Object.entries(exports.securityHeaders).forEach(([key, value]) => {
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
exports.sessionConfig = {
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        path: '/',
    },
};
// CORS configuration
exports.corsConfig = {
    origin: (origin, callback) => {
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
        }
        else {
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
exports.fileUploadConfig = {
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
exports.allowedFileTypes = {
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
exports.apiKeyConfig = {
    header: 'X-API-Key',
    prefix: 'tsp_',
    length: 32,
    expirationDays: 90,
};
// Encryption configuration
exports.encryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000,
    keyLength: 32,
    saltLength: 16,
    tagLength: 16,
};
// Password policy
exports.passwordPolicy = {
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
