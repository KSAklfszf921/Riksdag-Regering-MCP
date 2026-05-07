import { describe, it, expect, jest } from '@jest/globals';
import { getSyncStatus } from './health.js';

describe('health tool', () => {
  it('returns live status and deterministic timestamp', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    const out = await getSyncStatus();
    expect(out.status).toBe('live');
    expect(out.generated_at).toBe('2025-01-01T00:00:00.000Z');
    expect(out.sources.riksdagen).toBe('data.riksdagen.se');
    expect(out.sources.regeringen).toBe('g0v.se');

    jest.useRealTimers();
  });
});

