import { describe, expect,it } from 'vitest';

import { rateLimits } from '../rate-limit';

describe('Rate Limit Configuration', () => {
  it('should define API rate limit', () => {
    expect(rateLimits.api).toEqual({ points: 100, duration: 60 });
  });

  it('should define Auth rate limit with blockDuration', () => {
    expect(rateLimits.auth).toHaveProperty('points', 5);
    expect(rateLimits.auth).toHaveProperty('duration', 900);
    expect(rateLimits.auth).toHaveProperty('blockDuration', 900);
  });
}); 