import type { FastifyCorsOptions } from '@fastify/cors';
export declare const getCorsOptions: () => FastifyCorsOptions;
export declare const securityHeaders: {
    'X-XSS-Protection': string;
    'X-Content-Type-Options': string;
    'X-Frame-Options': string;
    'Strict-Transport-Security': string;
    'Referrer-Policy': string;
    'Permissions-Policy': string;
    'Content-Security-Policy': string;
    'X-Worker-Type': string;
    'X-Service-Name': string;
};
