"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimits = exports.rateLimiter = exports.RateLimitMiddleware = void 0;
const server_1 = require("@trpc/server");
const ioredis_1 = require("ioredis");
class RateLimitMiddleware {
    redis;
    constructor(redisUrl) {
        this.redis = new ioredis_1.Redis(redisUrl);
    }
    async consume(key, options) {
        const now = Date.now();
        const windowStart = now - options.duration * 1000;
        // Remove old entries
        await this.redis.zremrangebyscore(key, '-inf', windowStart);
        // Count current requests in window
        const count = await this.redis.zcard(key);
        if (count >= options.points) {
            // Check if blocked
            const blockedUntil = await this.redis.get(`${key}:blocked`);
            if (blockedUntil && Number.parseInt(blockedUntil) > now) {
                throw new server_1.TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: `Rate limit exceeded. Please try again later.`,
                });
            }
            // Set block if specified
            if (options.blockDuration) {
                await this.redis.setex(`${key}:blocked`, options.blockDuration, now + options.blockDuration * 1000);
            }
            throw new server_1.TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: `Rate limit exceeded. Maximum ${options.points} requests per ${options.duration} seconds.`,
            });
        }
        // Add current request
        await this.redis.zadd(key, now, `${now}:${Math.random()}`);
        await this.redis.expire(key, options.duration);
    }
    middleware(options) {
        return async ({ ctx, next }) => {
            const opts = typeof options === 'function' ? options(ctx) : options;
            // Build rate limit key
            const parts = ['ratelimit'];
            if (ctx.session?.userId) {
                parts.push('user', ctx.session.userId);
            }
            else {
                parts.push('anonymous');
            }
            const key = parts.join(':');
            try {
                await this.consume(key, opts);
                return next();
            }
            catch (error) {
                if (error instanceof server_1.TRPCError && error.code === 'TOO_MANY_REQUESTS') {
                    throw error;
                }
                // If Redis is down, allow the request but log the error
                console.error('Rate limit check failed:', error);
                return next();
            }
        };
    }
    async reset(userId, ip) {
        const parts = ['ratelimit'];
        if (userId) {
            parts.push('user', userId);
        }
        else if (ip) {
            parts.push('ip', ip);
        }
        else {
            return;
        }
        const key = parts.join(':');
        await this.redis.del(key, `${key}:blocked`);
    }
    async close() {
        await this.redis.quit();
    }
}
exports.RateLimitMiddleware = RateLimitMiddleware;
// Create rate limiter instance
exports.rateLimiter = new RateLimitMiddleware(process.env.REDIS_URL || 'redis://localhost:6379');
// Predefined rate limit configurations
exports.rateLimits = {
    // General API rate limit
    api: { points: 100, duration: 60 }, // 100 requests per minute
    // Strict limit for auth endpoints
    auth: { points: 5, duration: 900, blockDuration: 900 }, // 5 attempts per 15 minutes, block for 15 minutes
    // Render endpoint limit
    render: { points: 10, duration: 60 }, // 10 renders per minute
    // Search endpoint limit
    search: { points: 30, duration: 60 }, // 30 searches per minute
    // Upload endpoint limit
    upload: { points: 5, duration: 300 }, // 5 uploads per 5 minutes
    // Public endpoints
    public: { points: 20, duration: 60 }, // 20 requests per minute for public endpoints
};
