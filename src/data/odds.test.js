/**
 * odds.test.js — Tests for build-time BFO odds data integration.
 *
 * Validates that the ODDS export shape is correct, that fightKey matching
 * between BFO data and normalizeOdds.js works, and that MarketsScreen/TabMarket
 * can safely consume the data with empty or populated ODDS.
 */

import { describe, it, expect } from 'vitest';
import { ODDS } from './odds';
import { fightKey } from '../utils/normalizeOdds';

describe('ODDS data shape', () => {
  it('exports an object (possibly empty before scrape runs)', () => {
    expect(typeof ODDS).toBe('object');
    expect(ODDS).not.toBeNull();
  });

  it('every entry has required fields when ODDS is populated', () => {
    const entries = Object.entries(ODDS);
    // Skip shape validation if ODDS is empty (pre-scrape)
    if (entries.length === 0) return;

    for (const [key, entry] of entries) {
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
      expect(typeof entry.fighter1).toBe('string');
      expect(typeof entry.fighter2).toBe('string');
      expect(typeof entry.fightKey).toBe('string');
      expect(entry.fightKey).toBe(key);
      expect(typeof entry.event).toBe('string');
      expect(Array.isArray(entry.books)).toBe(true);
      expect(typeof entry.ts).toBe('string');
    }
  });

  it('every book entry has source, f1_ml, f2_ml', () => {
    const entries = Object.values(ODDS);
    if (entries.length === 0) return;

    for (const entry of entries) {
      for (const book of entry.books) {
        expect(typeof book.source).toBe('string');
        expect(typeof book.f1_ml).toBe('string');
        expect(typeof book.f2_ml).toBe('string');
        // ML format: starts with + or -
        expect(book.f1_ml).toMatch(/^[+-]\d+$/);
        expect(book.f2_ml).toMatch(/^[+-]\d+$/);
      }
    }
  });

  it('best field is null or has source/f1_ml/f2_ml', () => {
    const entries = Object.values(ODDS);
    if (entries.length === 0) return;

    for (const entry of entries) {
      if (entry.best === null) continue;
      expect(typeof entry.best.source).toBe('string');
      expect(typeof entry.best.f1_ml).toBe('string');
      expect(typeof entry.best.f2_ml).toBe('string');
    }
  });
});

describe('fightKey consistency between BFO and normalizeOdds', () => {
  it('BFO fightKey matches normalizeOdds.fightKey for same fighter names', () => {
    const entries = Object.values(ODDS);
    if (entries.length === 0) return;

    for (const entry of entries) {
      const computedKey = fightKey(entry.fighter1, entry.fighter2);
      expect(entry.fightKey).toBe(computedKey);
    }
  });

  it('fightKey is stable regardless of fighter name order', () => {
    expect(fightKey('Islam Makhachev', 'Dustin Poirier'))
      .toBe(fightKey('Dustin Poirier', 'Islam Makhachev'));
  });

  it('fightKey uses lowercased last names joined by underscore', () => {
    expect(fightKey('Israel Adesanya', 'Joe Pyfer')).toBe('adesanya_pyfer');
    expect(fightKey('Khamzat Chimaev', 'Sean Strickland')).toBe('chimaev_strickland');
  });
});

describe('ODDS consumed safely by components', () => {
  it('Object.entries(ODDS) works for liveByKey iteration', () => {
    const entries = Object.entries(ODDS);
    expect(Array.isArray(entries)).toBe(true);
    // Each entry is [string, object]
    for (const [key, val] of entries) {
      expect(typeof key).toBe('string');
      expect(typeof val).toBe('object');
    }
  });

  it('Object.values(ODDS).find() works for TabMarket matching', () => {
    const match = Object.values(ODDS).find((entry) => {
      const key = entry.fightKey || '';
      return key.includes('nonexistent');
    });
    expect(match).toBeUndefined();
  });

  it('Object.keys(ODDS).length works for hasBfoOdds check', () => {
    expect(typeof Object.keys(ODDS).length).toBe('number');
  });
});
