import { describe, it, expect, beforeEach, afterAll, jest } from '@jest/globals';
import {
  fetchG0vDocuments,
  fetchG0vLatestUpdate,
  fetchG0vCodes,
  fetchG0vDocumentContent,
  analyzeByDepartment,
} from './g0vApi.js';

function jsonResponse(data: any, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as any;
}

function textResponse(text: string, ok = true, status = ok ? 200 : 404) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    headers: new Headers({ 'content-type': 'text/markdown; charset=utf-8' }),
    json: async () => ({ text }),
    text: async () => text,
  } as any;
}

describe('g0vApi', () => {
  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('fetchG0vDocuments resolves type alias and applies filters', async () => {
    const docs = [
      { url: '/a', title: 'Budget 2025', published: '2025-01-10', type: 'x', categories: [] },
      { url: '/b', title: 'Something else', published: '2025-02-10', type: 'x', categories: [] },
      { url: '/c', title: 'Budget 2024', published: '2024-12-31', type: 'x', categories: [] },
    ];

    const fetchMock = jest.fn(async (url: string) => {
      // propositioner should resolve to rattsliga-dokument/proposition.json
      expect(url).toContain('/rattsliga-dokument/proposition.json');
      return jsonResponse(docs);
    });
    global.fetch = fetchMock as any;

    const out = await fetchG0vDocuments('propositioner', {
      search: 'budget',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
      limit: 1,
    });

    expect(out).toEqual([docs[0]]);
  });

  it('fetchG0vLatestUpdate normalizes fields', async () => {
    global.fetch = jest.fn(async (url: string) => {
      expect(url).toContain('/api/latest_updated.json');
      return jsonResponse({ latest_updated: '2025-03-01', items: 10, codes: 2 });
    }) as any;

    await expect(fetchG0vLatestUpdate()).resolves.toEqual({
      updated: '2025-03-01',
      totalDocuments: 10,
      codes: 2,
    });
  });

  it('fetchG0vCodes returns object map', async () => {
    global.fetch = jest.fn(async (url: string) => {
      expect(url).toContain('/api/codes.json');
      return jsonResponse({ '1285': 'Finansdepartementet' });
    }) as any;

    await expect(fetchG0vCodes()).resolves.toEqual({ '1285': 'Finansdepartementet' });
  });

  it('fetchG0vDocumentContent constructs g0v URL for regeringen.se and returns markdown', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      expect(url.startsWith('https://g0v.se/')).toBe(true);
      expect(url.endsWith('.md')).toBe(true);
      return textResponse('# ok');
    });
    global.fetch = fetchMock as any;

    const md = await fetchG0vDocumentContent('https://www.regeringen.se/pressmeddelanden/test/');
    expect(md).toContain('# ok');
  });

  it('fetchG0vDocumentContent rejects slug-only input', async () => {
    global.fetch = jest.fn() as any;
    await expect(fetchG0vDocumentContent('just-a-slug')).rejects.toThrow(/Invalid URL format/i);
  });

  it('analyzeByDepartment groups results by extracted department', async () => {
    const press = [
      { url: '/pm', title: 'PM', published: '2025-01-01', type: 'x', categories: [], sender: 'Finansdepartementet' },
    ];
    const props = [
      { url: '/prop', title: 'Prop', published: '2025-01-01', type: 'x', categories: ['1283'] },
    ];
    const speeches = [
      { url: 'https://www.regeringen.se/socialdepartementet/tal/test', title: 'Tal', published: '2025-01-01', type: 'x', categories: [] },
    ];

    global.fetch = jest.fn(async (url: string) => {
      if (url.includes('/pressmeddelanden.json')) return jsonResponse(press);
      if (url.includes('/rattsliga-dokument/proposition.json')) return jsonResponse(props);
      if (url.includes('/tal.json')) return jsonResponse(speeches);
      return jsonResponse([]);
    }) as any;

    const out = await analyzeByDepartment();
    expect(out.total).toBe(3);
    expect(out.departments.Finansdepartementet.pressReleases).toBe(1);
    expect(out.departments.Justitiedepartementet.propositions).toBe(1);
    expect(out.departments.Socialdepartementet.speeches).toBe(1);
  });
});

