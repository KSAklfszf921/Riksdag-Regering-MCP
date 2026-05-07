import { describe, it, expect } from '@jest/globals';
import {
  formatDate,
  buildWhereClause,
  calculateStatistics,
  groupBy,
  sortBy,
  stripHtml,
  truncate,
  normalizeLimit,
} from './helpers.js';

describe('helpers', () => {
  it('formatDate returns YYYY-MM-DD for Date and ISO string', () => {
    expect(formatDate(new Date('2025-02-03T12:00:00Z'))).toBe('2025-02-03');
    expect(formatDate('2025-02-03T12:00:00Z')).toBe('2025-02-03');
  });

  it('buildWhereClause builds ILIKE for strings and equality for non-strings', () => {
    expect(buildWhereClause({ title: 'Budget', count: 2, empty: '' }))
      .toBe("title ILIKE '%Budget%' AND count = 2");
    expect(buildWhereClause({ a: undefined, b: null, c: '' })).toBe('1=1');
  });

  it('calculateStatistics returns count/unique/distribution', () => {
    const stats = calculateStatistics(
      [{ party: 'S' }, { party: 'M' }, { party: 'S' }, { party: null }],
      'party'
    );
    expect(stats.count).toBe(3);
    expect(stats.unique).toBe(2);
    expect(stats.distribution).toEqual({ S: 2, M: 1 });
  });

  it('groupBy groups by field', () => {
    expect(groupBy([{ a: 1 }, { a: 2 }, { a: 1 }], 'a')).toEqual({
      '1': [{ a: 1 }, { a: 1 }],
      '2': [{ a: 2 }],
    });
  });

  it('sortBy sorts asc/desc and pushes nulls to end', () => {
    const data = [{ n: 2 }, { n: null }, { n: 1 }, { n: 3 }];
    expect(sortBy(data, 'n', 'asc').map((x) => x.n)).toEqual([1, 2, 3, null]);
    expect(sortBy(data, 'n', 'desc').map((x) => x.n)).toEqual([3, 2, 1, null]);
  });

  it('stripHtml removes tags, decodes entities, and trims', () => {
    expect(stripHtml(' <b>Hello</b> &amp; &quot;world&quot; ')).toBe('Hello & "world"');
  });

  it('truncate shortens long strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('normalizeLimit clamps and normalizes inputs', () => {
    expect(normalizeLimit(undefined, 50, 200)).toBe(50);
    expect(normalizeLimit(-10, 50, 200)).toBe(1);
    expect(normalizeLimit(0, 50, 200)).toBe(1);
    expect(normalizeLimit(201, 50, 200)).toBe(200);
    expect(normalizeLimit(10.9, 50, 200)).toBe(10);
  });
});

