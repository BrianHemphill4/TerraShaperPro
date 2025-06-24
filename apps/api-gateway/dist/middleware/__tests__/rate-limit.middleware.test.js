"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const rate_limit_1 = require("../rate-limit");
(0, vitest_1.describe)('Rate Limit Configuration', () => {
    (0, vitest_1.it)('should define API rate limit', () => {
        (0, vitest_1.expect)(rate_limit_1.rateLimits.api).toEqual({ points: 100, duration: 60 });
    });
    (0, vitest_1.it)('should define Auth rate limit with blockDuration', () => {
        (0, vitest_1.expect)(rate_limit_1.rateLimits.auth).toHaveProperty('points', 5);
        (0, vitest_1.expect)(rate_limit_1.rateLimits.auth).toHaveProperty('duration', 900);
        (0, vitest_1.expect)(rate_limit_1.rateLimits.auth).toHaveProperty('blockDuration', 900);
    });
});
