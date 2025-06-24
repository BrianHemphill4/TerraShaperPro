import type { FastifyInstance } from 'fastify';
/**
 * OWASP-compliant security headers configuration
 */
export declare const securityHeaders: {
    'X-Frame-Options': string;
    'X-Content-Type-Options': string;
    'X-XSS-Protection': string;
    'Referrer-Policy': string;
    'Permissions-Policy': string;
    'Strict-Transport-Security': string;
    'X-DNS-Prefetch-Control': string;
    'Cache-Control': string;
    Pragma: string;
    Expires: string;
    'X-Permitted-Cross-Domain-Policies': string;
    'Expect-CT': string;
};
/**
 * Content Security Policy configuration
 */
export declare const cspConfig: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    fontSrc: string[];
    connectSrc: string[];
    mediaSrc: string[];
    objectSrc: string[];
    frameSrc: string[];
    baseUri: string[];
    formAction: string[];
    frameAncestors: string[];
    upgradeInsecureRequests: never[] | undefined;
};
/**
 * Apply security headers middleware to Fastify instance
 */
export declare function addSecurityHeaders(app: FastifyInstance): void;
/**
 * Configure request limits for security
 */
export declare function configureRequestLimits(app: FastifyInstance): void;
