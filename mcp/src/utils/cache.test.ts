import { describe, it, expect } from '@jest/globals';
import { withCache } from './cache.js';

describe('withCache', () => {
  it('caches async fetcher result by key', async () => {
    let calls = 0;
    const key = `cache-test:${Date.now()}:${Math.random()}`;
    const fetcher = async () => {
      calls += 1;
      return { value: 'ok' };
    };

    const a = await withCache(key, fetcher, 60);
    const b = await withCache(key, fetcher, 60);

    expect(a).toEqual({ value: 'ok' });
    expect(b).toEqual({ value: 'ok' });
    expect(calls).toBe(1);
  });
});

