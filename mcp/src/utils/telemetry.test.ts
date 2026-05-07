import { describe, it, expect, jest } from '@jest/globals';
import { logToolCall, logDataMiss } from './telemetry.js';

describe('telemetry', () => {
  it('logs tool calls to stderr with created_at', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await logToolCall({ tool_name: 'test', status: 'success', duration_ms: 10, args: { a: 1 } });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [, json] = errorSpy.mock.calls[0]!;
    const entry = JSON.parse(String(json));
    expect(entry.tool_name).toBe('test');
    expect(entry.created_at).toBe('2025-01-01T00:00:00.000Z');

    errorSpy.mockRestore();
    jest.useRealTimers();
  });

  it('logs data misses with type=data_miss', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await logDataMiss({ entity: 'dokument', identifier: 'X', reason: 'not found' });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const [, json] = warnSpy.mock.calls[0]!;
    const entry = JSON.parse(String(json));
    expect(entry.type).toBe('data_miss');
    expect(entry.created_at).toBe('2025-01-01T00:00:00.000Z');

    warnSpy.mockRestore();
    jest.useRealTimers();
  });
});

