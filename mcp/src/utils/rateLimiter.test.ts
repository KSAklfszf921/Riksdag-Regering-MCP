import { describe, it, expect, jest } from '@jest/globals';
import { RateLimiter } from './rateLimiter.js';

describe('RateLimiter', () => {
  it('hasToken is true initially and becomes false after consuming all tokens', async () => {
    const limiter = new RateLimiter(2, 60_000);
    expect(limiter.hasToken()).toBe(true);

    await limiter.waitForToken();
    await limiter.waitForToken();
    expect(limiter.hasToken()).toBe(false);
  });

  it('waitForToken waits when no tokens are available', async () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    const limiter = new RateLimiter(1, 1000);
    await limiter.waitForToken();

    const promise = limiter.waitForToken();
    await Promise.resolve();

    expect(setTimeoutSpy).toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    await promise;

    setTimeoutSpy.mockRestore();
    jest.useRealTimers();
  });
});

