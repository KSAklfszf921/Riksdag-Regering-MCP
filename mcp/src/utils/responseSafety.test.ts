import { describe, it, expect } from '@jest/globals';
import {
  MAX_RESPONSE_SIZE,
  MAX_STRING_LENGTH,
  ResponseTooLargeError,
  validateResponseSize,
  truncateArray,
  truncateString,
  sanitizeToolResponse,
  createSafeErrorResponse,
  processBatchSafe,
} from './responseSafety.js';

describe('responseSafety', () => {
  it('truncateArray truncates and can include metadata', () => {
    const r = truncateArray([1, 2, 3], 2, { includeMetadata: true });
    expect(r.items).toEqual([1, 2]);
    expect(r.truncated).toBe(true);
    expect(r.originalCount).toBe(3);
    expect(r.metadata?.limit).toBe(2);
  });

  it('truncateString truncates over MAX_STRING_LENGTH', () => {
    const r = truncateString('a'.repeat(MAX_STRING_LENGTH + 1), MAX_STRING_LENGTH);
    expect(r.truncated).toBe(true);
    expect(r.value.endsWith('... [TRUNCATED]')).toBe(true);
  });

  it('validateResponseSize throws ResponseTooLargeError for oversized payloads', () => {
    const big = 'a'.repeat(MAX_RESPONSE_SIZE + 5);
    expect(() => validateResponseSize({ big })).toThrow(ResponseTooLargeError);
  });

  it('sanitizeToolResponse truncates arrays and validates size', () => {
    const r = sanitizeToolResponse([1, 2, 3], { maxItems: 2 });
    expect(r).toEqual(
      expect.objectContaining({
        items: [1, 2],
        truncated: true,
        originalCount: 3,
        metadata: expect.any(Object),
      })
    );
  });

  it('sanitizeToolResponse truncates long strings inside objects when enabled', () => {
    const long = 'a'.repeat(MAX_STRING_LENGTH + 10);
    const r = sanitizeToolResponse({ a: long, b: 'ok' }, { truncateStrings: true });
    expect(r.b).toBe('ok');
    expect(r.a.startsWith('a'.repeat(MAX_STRING_LENGTH))).toBe(true);
    expect(r.a.endsWith('... [TRUNCATED]')).toBe(true);
  });

  it('createSafeErrorResponse maps common errors to codes', () => {
    const tooLarge = new ResponseTooLargeError(10, 5, 'Try pagination');
    expect(createSafeErrorResponse(tooLarge)).toEqual(
      expect.objectContaining({ code: -32000 })
    );

    const zodLike: any = new Error('Invalid params');
    zodLike.name = 'ZodError';
    expect(createSafeErrorResponse(zodLike)).toEqual(
      expect.objectContaining({ code: -32602 })
    );

    expect(createSafeErrorResponse(new Error('not found (404)'))).toEqual(
      expect.objectContaining({ code: -32001 })
    );
  });

  it('processBatchSafe processes items in batches and reports progress', async () => {
    const progress: Array<[number, number]> = [];
    const out = await processBatchSafe([1, 2, 3, 4, 5], async (n) => n * 2, {
      batchSize: 2,
      onProgress: (c, t) => progress.push([c, t]),
    });

    expect(out).toEqual([2, 4, 6, 8, 10]);
    expect(progress).toEqual([[2, 5], [4, 5], [5, 5]]);
  });
});
