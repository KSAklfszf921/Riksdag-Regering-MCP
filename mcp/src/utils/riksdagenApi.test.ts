import { describe, it, expect, beforeEach, afterAll, jest } from '@jest/globals';
import { fetchDokumentDirect, fetchKalenderDirect } from './riksdagenApi.js';

function jsonResponse(data: any, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as any;
}

function textResponse(text: string, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
    json: async () => ({ text }),
    text: async () => text,
  } as any;
}

describe('riksdagenApi', () => {
  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('fetchDokumentDirect builds query and returns paginated response', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      expect(url).toContain('/dokumentlista/?');
      expect(url).toContain('doktyp=prop');
      expect(url).toContain('nummer=1');
      expect(url).toContain('utformat=json');

      return jsonResponse({
        dokumentlista: {
          '@hits': '1',
          '@sida': '1',
          '@nasta_sida': '',
          dokument: { dok_id: 'D1', doktyp: 'prop', rm: '2024/25', titel: 'T' },
        },
      });
    });
    global.fetch = fetchMock as any;

    const out = await fetchDokumentDirect({ doktyp: 'PROP', nr: '1', sz: 5 });
    expect(out.hits).toBe(1);
    expect(out.data[0].dok_id).toBe('D1');
  });

  it('fetchKalenderDirect returns raw preview on non-JSON response', async () => {
    const html = '<html>' + 'x'.repeat(1000) + '</html>';
    global.fetch = jest.fn(async (url: string, init: any) => {
      expect(url).toContain('/kalenderlista/?');
      expect(init?.headers?.Accept).toBe('application/json');
      return textResponse(html);
    }) as any;

    const out = await fetchKalenderDirect({ from: '2025-01-01', sz: 5 });
    expect('raw' in out).toBe(true);
    expect((out as any).raw.length).toBeLessThanOrEqual(500);
    expect((out as any).url).toContain('/kalenderlista/?');
  });
});

