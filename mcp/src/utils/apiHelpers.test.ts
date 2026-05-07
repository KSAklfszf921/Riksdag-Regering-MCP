import { describe, it, expect, beforeEach, afterAll, jest } from '@jest/globals';
import {
  normalizeApiResponse,
  extractPaginationMeta,
  buildPaginatedResponse,
  fetchAllPages,
  buildQueryString,
  encodeRiksmote,
  decodeRiksmote,
  safeFetch,
  RiksdagenApiError,
} from './apiHelpers.js';

function createJsonResponse(data: any, options?: { ok?: boolean; status?: number; statusText?: string }) {
  const ok = options?.ok ?? true;
  const status = options?.status ?? (ok ? 200 : 500);
  const statusText = options?.statusText ?? (ok ? 'OK' : 'Error');

  return {
    ok,
    status,
    statusText,
    headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as any;
}

describe('apiHelpers', () => {
  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('normalizeApiResponse', () => {
    it('returns empty array when list key missing', () => {
      expect(normalizeApiResponse({}, 'dokumentlista')).toEqual([]);
    });

    it('returns empty array when hits=0', () => {
      const data = { dokumentlista: { '@antal': '0' } };
      expect(normalizeApiResponse(data, 'dokumentlista')).toEqual([]);
    });

    it('wraps single object when hits=1', () => {
      const data = {
        dokumentlista: {
          '@antal': '1',
          dokument: { dok_id: 'A' },
        },
      };

      expect(normalizeApiResponse(data, 'dokumentlista')).toEqual([{ dok_id: 'A' }]);
    });

    it('returns array when hits>1', () => {
      const data = {
        dokumentlista: {
          '@antal': '2',
          dokument: [{ dok_id: 'A' }, { dok_id: 'B' }],
        },
      };

      expect(normalizeApiResponse(data, 'dokumentlista')).toEqual([{ dok_id: 'A' }, { dok_id: 'B' }]);
    });
  });

  describe('extractPaginationMeta', () => {
    it('returns defaults when list key missing', () => {
      expect(extractPaginationMeta({}, 'dokumentlista')).toEqual({ hits: 0, page: 1, hasMore: false });
    });

    it('extracts hits/page/nextPage and hasMore', () => {
      const data = {
        dokumentlista: {
          '@hits': '123',
          '@sida': '2',
          '@nasta_sida': '3',
        },
      };

      expect(extractPaginationMeta(data, 'dokumentlista')).toEqual({
        hits: 123,
        page: 2,
        hasMore: true,
        nextPage: '3',
      });
    });
  });

  describe('buildPaginatedResponse', () => {
    it('combines normalized data and metadata', () => {
      const data = {
        dokumentlista: {
          '@hits': '1',
          '@sida': '1',
          '@nasta_sida': '',
          dokument: { dok_id: 'A' },
        },
      };

      expect(buildPaginatedResponse(data, 'dokumentlista')).toEqual({
        data: [{ dok_id: 'A' }],
        hits: 1,
        page: 1,
        hasMore: false,
        nextPage: '',
      });
    });
  });

  describe('fetchAllPages', () => {
    it('fetches pages until hasMore=false', async () => {
      const fetchFn = jest.fn(async (page: number) => ({
        data: [`p${page}`],
        hits: 2,
        page,
        hasMore: page < 2,
        nextPage: page < 2 ? String(page + 1) : undefined,
      }));

      const results = await fetchAllPages(fetchFn, 100, 0);
      expect(results).toEqual(['p1', 'p2']);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('stops at maxPages', async () => {
      const fetchFn = jest.fn(async (page: number) => ({
        data: [page],
        hits: 999,
        page,
        hasMore: true,
        nextPage: String(page + 1),
      }));

      const results = await fetchAllPages(fetchFn, 3, 0);
      expect(results).toEqual([1, 2, 3]);
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('applies delay between pages', async () => {
      jest.useFakeTimers();
      const fetchFn = jest.fn(async (page: number) => ({
        data: [page],
        hits: 2,
        page,
        hasMore: page < 2,
        nextPage: page < 2 ? String(page + 1) : undefined,
      }));

      const promise = fetchAllPages(fetchFn, 100, 100);
      await Promise.resolve();
      expect(fetchFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      await promise;
      expect(fetchFn).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
  });

  describe('buildQueryString', () => {
    it('omits undefined/null/empty values', () => {
      const qs = buildQueryString({
        a: 'x',
        b: '',
        c: undefined,
        d: null,
        e: 0,
        f: false,
      });

      expect(qs).toContain('a=x');
      expect(qs).toContain('e=0');
      expect(qs).toContain('f=false');
      expect(qs).not.toContain('b=');
      expect(qs).not.toContain('c=');
      expect(qs).not.toContain('d=');
    });
  });

  describe('riksmote encoding', () => {
    it('encodes and decodes slash', () => {
      expect(encodeRiksmote('1990/91')).toBe('1990%2F91');
      expect(decodeRiksmote('1990%2F91')).toBe('1990/91');
    });
  });

  describe('safeFetch', () => {
    it('throws RiksdagenApiError on non-ok responses', async () => {
      global.fetch = jest.fn(async () => createJsonResponse({ error: 'x' }, { ok: false, status: 500, statusText: 'Fail' })) as any;
      await expect(safeFetch('https://example.test/fail')).rejects.toBeInstanceOf(RiksdagenApiError);
    });

    it('uses default headers and returns json', async () => {
      process.env.RIKSDAG_USER_AGENT = 'UnitTestAgent/1.0';
      const fetchMock = jest.fn(async (_url: string, _init?: any) => createJsonResponse({ ok: true }));
      global.fetch = fetchMock as any;

      const data = await safeFetch('https://example.test/ok');
      expect(data).toEqual({ ok: true });

      const call = fetchMock.mock.calls[0];
      expect(call).toBeDefined();
      const init = call?.[1] as any;
      expect(init?.headers?.['User-Agent']).toBe('UnitTestAgent/1.0');
      expect(init?.headers?.Accept).toBe('application/json');
    });
  });
});
