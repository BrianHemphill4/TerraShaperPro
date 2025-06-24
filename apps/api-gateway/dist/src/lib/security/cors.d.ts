/**
 * CORS configuration for secure cross-origin requests
 */
export declare const corsConfig: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
};
/**
 * Check if origin is allowed
 */
export declare function isOriginAllowed(origin: string): boolean;
/**
 * Get CORS configuration for specific environment
 */
export declare function getCorsConfig(environment: 'development' | 'staging' | 'production'): {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
} | {
    origin: boolean;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
};
