import { describe, it, expect, afterAll, beforeEach, jest } from '@jest/globals';
import { getG0vDocumentTypes } from './g0vTypes.js';
import { getG0vCategoryCodes } from './g0vCategoryCodes.js';
import { getG0vLatestUpdate } from './g0vLatestUpdate.js';
import { getG0vDocumentContent } from './g0vDocumentContent.js';
import { analyzeG0vByDepartment } from './g0vDepartmentAnalysis.js';

function jsonResponse(data: any) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as any;
}

function textResponse(text: string) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'text/markdown; charset=utf-8' }),
    json: async () => ({ text }),
    text: async () => text,
  } as any;
}

describe('g0v tool wrappers', () => {
  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('getG0vDocumentTypes lists aliases', async () => {
    const out = await getG0vDocumentTypes();
    expect(out.count).toBeGreaterThan(0);
    expect(out.document_types).toContain('pressmeddelanden');
  });

  it('getG0vCategoryCodes returns count', async () => {
    global.fetch = jest.fn(async () => jsonResponse({ '1285': 'Finansdepartementet' })) as any;
    const out = await getG0vCategoryCodes();
    expect(out.count).toBe(1);
    expect(out.category_codes['1285']).toBe('Finansdepartementet');
  });

  it('getG0vLatestUpdate proxies normalized response', async () => {
    global.fetch = jest.fn(async (url: string) => {
      expect(url).toContain('/api/latest_updated.json');
      return jsonResponse({ latest_updated: '2025-01-01', items: 2, codes: 3 });
    }) as any;

    await expect(getG0vLatestUpdate()).resolves.toEqual({
      updated: '2025-01-01',
      totalDocuments: 2,
      codes: 3,
    });
  });

  it('getG0vDocumentContent returns url+content', async () => {
    global.fetch = jest.fn(async (url: string) => {
      expect(url.endsWith('.md')).toBe(true);
      return textResponse('# content');
    }) as any;

    const out = await getG0vDocumentContent({ regeringenUrl: 'https://www.regeringen.se/pressmeddelanden/test/' });
    expect(out.url).toContain('regeringen.se');
    expect(out.content).toContain('# content');
  });

  it('analyzeG0vByDepartment proxies analysis', async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url.includes('/pressmeddelanden.json')) {
        return jsonResponse([
          { url: '/pm', title: 'PM', published: '2025-01-01', type: 'x', categories: [], sender: 'Finansdepartementet' },
        ]);
      }
      if (url.includes('/rattsliga-dokument/proposition.json')) {
        return jsonResponse([
          { url: '/prop', title: 'Prop', published: '2025-01-01', type: 'x', categories: ['1283'] },
        ]);
      }
      if (url.includes('/tal.json')) {
        return jsonResponse([
          { url: 'https://www.regeringen.se/socialdepartementet/tal/test', title: 'Tal', published: '2025-01-01', type: 'x', categories: [] },
        ]);
      }
      return jsonResponse([]);
    }) as any;

    const out = await analyzeG0vByDepartment({});
    expect(out.total).toBe(3);
    expect(out.departments.Finansdepartementet.count).toBe(1);
  });
});

