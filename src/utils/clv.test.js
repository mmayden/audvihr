import { describe, it, expect, beforeEach } from 'vitest';
import {
  appendCLVEntries, readCLVLog, CLV_LOG_KEY, CLV_MAX_ENTRIES,
  appendOpeningLine, readOpeningLines, CLV_OPENING_KEY,
} from './clv';

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
  localStorage.removeItem(CLV_OPENING_KEY);
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

describe('appendOpeningLine', () => {
  it('stores the opening line for a new fightKey', () => {
    appendOpeningLine('jones_aspinall', '-155', '+130', 1000);
    const lines = readOpeningLines();
    expect(lines['jones_aspinall']).toEqual({ f1ml: '-155', f2ml: '+130', ts: 1000 });
  });

  it('does not overwrite an existing opening line', () => {
    appendOpeningLine('jones_aspinall', '-155', '+130', 1000);
    appendOpeningLine('jones_aspinall', '-180', '+150', 2000); // later — must be ignored
    const lines = readOpeningLines();
    expect(lines['jones_aspinall'].f1ml).toBe('-155');
    expect(lines['jones_aspinall'].ts).toBe(1000);
  });

  it('stores multiple fights independently', () => {
    appendOpeningLine('jones_aspinall', '-155', '+130', 1000);
    appendOpeningLine('makhachev_poirier', '-300', '+240', 2000);
    const lines = readOpeningLines();
    expect(Object.keys(lines)).toHaveLength(2);
  });

  it('defaults ts to Date.now() when not provided', () => {
    const before = Date.now();
    appendOpeningLine('jones_aspinall', '-155', '+130');
    const after = Date.now();
    const lines = readOpeningLines();
    expect(lines['jones_aspinall'].ts).toBeGreaterThanOrEqual(before);
    expect(lines['jones_aspinall'].ts).toBeLessThanOrEqual(after);
  });

  it('does not throw on missing args', () => {
    expect(() => appendOpeningLine(null, '-155', '+130')).not.toThrow();
    expect(() => appendOpeningLine('key', null, '+130')).not.toThrow();
    expect(() => appendOpeningLine('key', '-155', null)).not.toThrow();
    expect(readOpeningLines()).toEqual({});
  });
});

describe('readOpeningLines', () => {
  it('returns {} when the key is absent', () => {
    expect(readOpeningLines()).toEqual({});
  });

  it('returns {} when localStorage contains invalid JSON', () => {
    localStorage.setItem(CLV_OPENING_KEY, 'bad-json{');
    expect(readOpeningLines()).toEqual({});
  });

  it('returns all stored opening lines', () => {
    appendOpeningLine('jones_aspinall', '-155', '+130', 1000);
    appendOpeningLine('makhachev_poirier', '-300', '+240', 2000);
    const lines = readOpeningLines();
    expect(lines['jones_aspinall'].f1ml).toBe('-155');
    expect(lines['makhachev_poirier'].f2ml).toBe('+240');
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
