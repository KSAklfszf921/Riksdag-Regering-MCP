import { describe, it, expect } from '@jest/globals';
import {
  expandPartyAliases,
  getCurrentPartyName,
  getFullPartyName,
  isValidParty,
  getAllCurrentParties,
  getPartyInfo,
  toApiParam,
} from './partyAliases.js';

describe('partyAliases', () => {
  it('expands aliases and resolves current names', () => {
    expect(expandPartyAliases('fp')).toEqual(['L', 'FP']);
    expect(getCurrentPartyName('FP')).toBe('L');
    expect(getFullPartyName('FP')).toBe('Liberalerna');
  });

  it('validates parties (current or alias) and handles unknowns', () => {
    expect(isValidParty('KDS')).toBe(true);
    expect(isValidParty('not-a-party')).toBe(false);
    expect(getCurrentPartyName('not-a-party')).toBe('NOT-A-PARTY');
  });

  it('returns all current parties and party info', () => {
    const parties = getAllCurrentParties();
    expect(parties).toContain('S');
    expect(getPartyInfo('VPK')?.current).toBe('V');
  });

  it('maps MCP params to API params', () => {
    expect(toApiParam('valkrets')).toBe('valkrests');
    expect(toApiParam('unknown_param')).toBe('unknown_param');
  });
});

