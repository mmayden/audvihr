import { describe, it, expect, beforeEach } from 'vitest';
import { appendCLVEntries, readCLVLog, CLV_LOG_KEY, CLV_MAX_ENTRIES } from './clv';

const POLY_FIGHT = {
  fightKey: 'makhachev_poirier',
  fighter1: 'Islam Makhachev',
  fighter2: 'Dustin Poirier',
  polymarket: { f1_price: 0.68, f2_price: 0.32, f1_ml: '-213', f2_ml: '+194' },
  kalshi: null,
};

const KALSHI_FIGHT = {
  fightKey: 'jones_aspinall',
  fighter1: 'Jon Jones',
  fighter2: 'Tom Aspinall',
  polymarket: null,
  kalshi: { f1_price: 0.55, f2_price: 0.45, f1_ml: '-122', f2_ml: '+105' },
};

beforeEach(() => {
  localStorage.removeItem(CLV_LOG_KEY);
});

describe('appendCLVEntries', () => {
  it('appends entries for polymarket source', () => {
    appendCLVEntries([POLY_FIGHT], 'polymarket');
    const log = readCLVLog();
    expect(log).toHaveLength(1);
    expect(log[0].source).toBe('polymarket');
    expect(log[0].fightKey).toBe('makhachev_poirier');
    expect(log[0].f1Price).toBe(0.68);
    expect(log[0].f2Price).toBe(0.32);
    expect(typeof log[0].ts).toBe('number');
  });

  it('appends entries for kalshi source', () => {
    appendCLVEntries([KALSHI_FIGHT], 'kalshi');
    const log = readCLVLog();
    expect(log).toHaveLength(1);
    expect(log[0].source).toBe('kalshi');
    expect(log[0].f1Price).toBe(0.55);
  });

  it('skips fights where the source price object is missing', () => {
    appendCLVEntries([POLY_FIGHT], 'kalshi'); // POLY_FIGHT has no kalshi
    const log = readCLVLog();
    expect(log).toHaveLength(0);
  });

  it('accumulates entries across multiple calls', () => {
    appendCLVEntries([POLY_FIGHT], 'polymarket');
    appendCLVEntries([KALSHI_FIGHT], 'kalshi');
    const log = readCLVLog();
    expect(log).toHaveLength(2);
  });

  it('does not throw on empty array', () => {
    expect(() => appendCLVEntries([], 'polymarket')).not.toThrow();
    expect(readCLVLog()).toHaveLength(0);
  });

  it('does not throw on null / non-array input', () => {
    expect(() => appendCLVEntries(null, 'polymarket')).not.toThrow();
    expect(() => appendCLVEntries(undefined, 'kalshi')).not.toThrow();
  });

  it(`caps the log at ${CLV_MAX_ENTRIES} entries`, () => {
    const fights = Array.from({ length: CLV_MAX_ENTRIES + 10 }, (_, i) => ({
      fightKey:   `fight_${i}`,
      fighter1:   'A',
      fighter2:   'B',
      polymarket: { f1_price: 0.5, f2_price: 0.5, f1_ml: '+100', f2_ml: '+100' },
      kalshi: null,
    }));
    appendCLVEntries(fights, 'polymarket');
    const log = readCLVLog();
    expect(log).toHaveLength(CLV_MAX_ENTRIES);
  });
});

describe('readCLVLog', () => {
  it('returns [] when the key is absent', () => {
    expect(readCLVLog()).toEqual([]);
  });

  it('returns [] when localStorage contains invalid JSON', () => {
    localStorage.setItem(CLV_LOG_KEY, 'bad-json{');
    expect(readCLVLog()).toEqual([]);
  });

  it('returns all stored entries', () => {
    appendCLVEntries([POLY_FIGHT, KALSHI_FIGHT], 'polymarket');
    const log = readCLVLog();
    expect(log).toHaveLength(1); // KALSHI_FIGHT has no polymarket price, skipped
  });
});
