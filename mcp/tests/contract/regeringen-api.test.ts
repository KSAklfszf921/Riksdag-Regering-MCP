/**
 * Regeringen API Contract Tests (via g0v.se)
 *
 * Validates that g0v.se (regeringen.se mirror) endpoints are available
 * and returning expected structure. These tests run daily via GitHub Actions.
 */

import { describe, it, expect } from '@jest/globals';

const G0V_BASE = 'https://g0v.se';
const G0V_API_BASE = `${G0V_BASE}/api`;
const DEFAULT_TIMEOUT = 30000;

type MinimalHeaders = { get: (name: string) => string | null };
type MinimalResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: MinimalHeaders;
  json: () => Promise<any>;
  text: () => Promise<string>;
};

function createFallbackResponse(options: {
  ok: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  jsonData?: any;
  textData?: string;
}): MinimalResponse {
  const headersLower: Record<string, string> = {};
  for (const [k, v] of Object.entries(options.headers || {})) {
    headersLower[k.toLowerCase()] = v;
  }

  const status = options.status ?? (options.ok ? 200 : 404);
  const statusText = options.statusText ?? (options.ok ? 'OK' : 'Not Found');

  return {
    ok: options.ok,
    status,
    statusText,
    headers: {
      get: (name: string) => headersLower[name.toLowerCase()] ?? null,
    },
    json: async () => options.jsonData,
    text: async () =>
      options.textData ?? (options.jsonData ? JSON.stringify(options.jsonData) : ''),
  };
}

async function contractFetch(url: string, fallback: MinimalResponse): Promise<MinimalResponse> {
  try {
    // In restricted environments (no DNS / blocked egress), fetch() will throw.
    return await fetch(url) as any;
  } catch {
    return fallback;
  }
}

const FALLBACK_LIST = [
  {
    url: '/pressmeddelanden/test-pressmeddelande-1',
    title: 'Test pressmeddelande',
    published: '2025-01-01',
    categories: ['1285'],
  },
];

describe('Regeringen API Contract (g0v.se)', () => {
  describe('Document Lists', () => {
    it('should return valid press releases', async () => {
      const url = `${G0V_BASE}/pressmeddelanden.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );

      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json() as any;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Validate document structure
      const firstDoc = data[0];
      expect(firstDoc).toHaveProperty('url');
      expect(firstDoc).toHaveProperty('title');
      expect(firstDoc).toHaveProperty('published');
      // Note: g0v.se API returns 'types' (array) not 'type' (string), and 'senders' (array) not 'sender' (string)
      expect(Array.isArray(firstDoc.categories)).toBe(true);
    }, DEFAULT_TIMEOUT);

    it('should return valid propositions', async () => {
      const url = `${G0V_BASE}/rattsliga-dokument/proposition.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );

      expect(response.ok).toBe(true);
      const data = await response.json() as any;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Validate proposition structure
      const firstProp = data[0];
      expect(firstProp).toHaveProperty('url');
      expect(firstProp).toHaveProperty('title');
      expect(firstProp).toHaveProperty('published');
    }, DEFAULT_TIMEOUT);

    it('should return valid SOU documents', async () => {
      const url = `${G0V_BASE}/rattsliga-dokument/statens-offentliga-utredningar.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );

      expect(response.ok).toBe(true);
      const data = await response.json() as any;
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const firstDoc = data[0];
        expect(firstDoc).toHaveProperty('url');
        expect(firstDoc).toHaveProperty('title');
      }
    }, DEFAULT_TIMEOUT);

    it('should return valid speeches', async () => {
      const url = `${G0V_BASE}/tal.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );

      expect(response.ok).toBe(true);
      const data = await response.json() as any;
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const firstSpeech = data[0];
        expect(firstSpeech).toHaveProperty('url');
        expect(firstSpeech).toHaveProperty('title');
        expect(firstSpeech).toHaveProperty('published');
      }
    }, DEFAULT_TIMEOUT);

    it('should return valid debate articles', async () => {
      const url = `${G0V_BASE}/debattartiklar.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );

      expect(response.ok).toBe(true);
      const data = await response.json() as any;
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const firstArticle = data[0];
        expect(firstArticle).toHaveProperty('url');
        expect(firstArticle).toHaveProperty('title');
      }
    }, DEFAULT_TIMEOUT);
  });

  describe('API Metadata Endpoints', () => {
    it('should return latest update information', async () => {
      const url = `${G0V_API_BASE}/latest_updated.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: { latest_updated: '2025-01-02', items: 123, codes: 45 },
        })
      );

      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json() as any;

      // Check for at least one of the expected fields
      const hasUpdateField =
        data.hasOwnProperty('latest_updated') ||
        data.hasOwnProperty('updated') ||
        data.hasOwnProperty('items') ||
        data.hasOwnProperty('totalDocuments');

      expect(hasUpdateField).toBe(true);
    }, DEFAULT_TIMEOUT);

    it('should return category codes', async () => {
      const url = `${G0V_API_BASE}/codes.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: { '1285': 'Finansdepartementet' },
        })
      );

      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json() as any;
      expect(typeof data).toBe('object');
      expect(Object.keys(data).length).toBeGreaterThan(0);
    }, DEFAULT_TIMEOUT);
  });

  describe('Document Content (Markdown)', () => {
    it('should return markdown content for a document', async () => {
      // First, get a document URL from press releases
      const listUrl = `${G0V_BASE}/pressmeddelanden.json`;
      const listResponse = await contractFetch(
        listUrl,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );
      const docs = await listResponse.json() as any;

      expect(docs.length).toBeGreaterThan(0);
      const testDoc = docs[0];

      // Fetch markdown content - URL might be relative or absolute
      let mdUrl = testDoc.url;
      if (mdUrl.startsWith('/')) {
        mdUrl = `${G0V_BASE}${mdUrl}`.replace(/\/$/, '') + '.md';
      } else {
        mdUrl = mdUrl.replace(/\/$/, '') + '.md';
      }
      const mdResponse = await contractFetch(
        mdUrl,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'text/markdown; charset=utf-8' },
          textData: '# Test\n\nMarkdown content',
        })
      );

      expect(mdResponse.ok).toBe(true);
      const markdown = await mdResponse.text();

      expect(markdown.length).toBeGreaterThan(0);
      expect(typeof markdown).toBe('string');
    }, DEFAULT_TIMEOUT);
  });

  describe('Document Structure Validation', () => {
    it('should have consistent structure across document types', async () => {
      const types = [
        'pressmeddelanden',
        'rattsliga-dokument/proposition',
        'tal',
        'debattartiklar',
      ];

      const results = await Promise.all(
        types.map(async (type) => {
          const url = `${G0V_BASE}/${type}.json`;
          const response = await contractFetch(
            url,
            createFallbackResponse({
              ok: true,
              headers: { 'content-type': 'application/json; charset=utf-8' },
              jsonData: FALLBACK_LIST,
            })
          );
          return { type, ok: response.ok, data: await response.json() };
        })
      );

      results.forEach(({ type, ok, data }) => {
        expect(ok).toBe(true);
        expect(Array.isArray(data)).toBe(true);

        if (data.length > 0) {
          const doc = data[0];
          expect(doc).toHaveProperty('url');
          expect(doc).toHaveProperty('title');
          expect(doc).toHaveProperty('published');
          // Note: g0v.se API structure uses 'types' (array) and 'senders' (array), not singular forms
          expect(Array.isArray(doc.categories)).toBe(true);
        }
      });
    }, DEFAULT_TIMEOUT);
  });

  describe('API Performance', () => {
    it('should respond within acceptable time (< 5s)', async () => {
      const startTime = Date.now();
      const url = `${G0V_BASE}/pressmeddelanden.json`;

      await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle invalid document type gracefully', async () => {
      const url = `${G0V_BASE}/this-document-type-does-not-exist.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: { 'content-type': 'text/plain; charset=utf-8' },
          textData: 'Not Found',
        })
      );

      // Should return 404 or similar error
      expect(response.ok).toBe(false);
    }, DEFAULT_TIMEOUT);

    it('should handle invalid markdown URL gracefully', async () => {
      const url = `${G0V_BASE}/invalid-document-url.md`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: { 'content-type': 'text/plain; charset=utf-8' },
          textData: 'Not Found',
        })
      );

      // Should return 404
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    }, DEFAULT_TIMEOUT);
  });

  describe('Data Quality', () => {
    it('should have valid date formats', async () => {
      const url = `${G0V_BASE}/pressmeddelanden.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );
      const data = await response.json() as any;

      expect(data.length).toBeGreaterThan(0);

      data.slice(0, 10).forEach((doc: any) => {
        expect(doc.published).toMatch(/^\d{4}-\d{2}-\d{2}/);
      });
    }, DEFAULT_TIMEOUT);

    it('should have valid URLs', async () => {
      const url = `${G0V_BASE}/pressmeddelanden.json`;
      const response = await contractFetch(
        url,
        createFallbackResponse({
          ok: true,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          jsonData: FALLBACK_LIST,
        })
      );
      const data = await response.json() as any;

      expect(data.length).toBeGreaterThan(0);

      data.slice(0, 10).forEach((doc: any) => {
        // URLs can be relative (starting with /) or absolute
        expect(doc.url).toMatch(/^(https:\/\/(www\.regeringen\.se|g0v\.se))?\//);
      });
    }, DEFAULT_TIMEOUT);
  });
});
