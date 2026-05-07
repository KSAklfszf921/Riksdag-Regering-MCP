import { describe, it, expect } from '@jest/globals';
import { getDataDictionary } from './metadata.js';

describe('metadata tool', () => {
  it('returns full dictionary when no dataset specified', () => {
    const out = getDataDictionary({}) as any;
    expect(out.datasets.length).toBeGreaterThan(0);
  });

  it('filters by dataset id or alias', () => {
    const byId = getDataDictionary({ dataset: 'riksdagen_dokument' }) as any;
    expect(byId.id).toBe('riksdagen_dokument');

    const byAlias = getDataDictionary({ dataset: 'dokument' }) as any;
    expect(byAlias.id).toBe('riksdagen_dokument');
  });

  it('throws for unknown dataset', () => {
    expect(() => getDataDictionary({ dataset: 'does-not-exist' })).toThrow(/saknas/i);
  });
});
