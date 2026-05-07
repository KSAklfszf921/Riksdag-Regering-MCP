import { describe, it, expect } from '@jest/globals';
import {
  ALL_ALLOWED_TABLES,
  isAllowedTable,
  validateTable,
  getTableCategories,
  isRiksdagenTable,
  isRegeringskanlietTable,
} from './validation.js';

describe('validation (allowed tables)', () => {
  it('isAllowedTable checks membership', () => {
    expect(isAllowedTable(ALL_ALLOWED_TABLES[0]!)).toBe(true);
    expect(isAllowedTable('totally_not_allowed')).toBe(false);
  });

  it('validateTable throws for disallowed table', () => {
    expect(() => validateTable('not_allowed')).toThrow(/inte tillåten/i);
  });

  it('getTableCategories returns both categories', () => {
    const categories = getTableCategories();
    expect(categories.riksdagen.length).toBeGreaterThan(0);
    expect(categories.regeringskansliet.length).toBeGreaterThan(0);
  });

  it('category helpers map correctly', () => {
    const riksdagenTable = 'riksdagen_dokument';
    const regeringsTable = 'regeringskansliet_pressmeddelanden';
    expect(isRiksdagenTable(riksdagenTable)).toBe(true);
    expect(isRiksdagenTable(regeringsTable)).toBe(false);
    expect(isRegeringskanlietTable(regeringsTable)).toBe(true);
    expect(isRegeringskanlietTable(riksdagenTable)).toBe(false);
  });
});

