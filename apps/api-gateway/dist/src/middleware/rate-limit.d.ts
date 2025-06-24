import type { Context } from '../context';
type RateLimitOptions = {
    points: number;
    duration: number;
    blockDuration?: number;
};
export declare class RateLimitMiddleware {
    private redis;
    constructor(redisUrl: string);
    consume(key: string, options: RateLimitOptions): Promise<void>;
    middleware(options: RateLimitOptions | ((ctx: Context) => RateLimitOptions)): ({ ctx, next }: {
        ctx: Context;
        next: () => Promise<any>;
    }) => Promise<any>;
    reset(userId?: string, ip?: string): Promise<void>;
    close(): Promise<void>;
}
export declare const rateLimiter: RateLimitMiddleware;
export declare const rateLimits: {
    api: {
        points: number;
        duration: number;
    };
    auth: {
        points: number;
        duration: number;
        blockDuration: number;
    };
    render: {
        points: number;
        duration: number;
    };
    search: {
        points: number;
        duration: number;
    };
    upload: {
        points: number;
        duration: number;
    };
    public: {
        points: number;
        duration: number;
    };
};
export {};
