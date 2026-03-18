import { describe, it, expect } from 'vitest';
import { STAT_FILTERS, FILTER_CATEGORIES } from './statFilters';

// ── Minimal fighter fixtures ──────────────────────────────────────────────
/** Builds a fighter-shaped object with the given overrides applied to safe defaults. */
const makeFighter = (overrides = {}) => ({
  stance: 'Orthodox',
  finish_rate: 50,
  mods: [],
  striking: { slpm: 3.5, str_def: 55, sapm: 3.0, ...overrides.striking },
  grappling: { td_per15: 1.5, td_acc: 40, td_def: 60, sub_per15: 0.2, ...overrides.grappling },
  ...overrides,
});

// ── Structure ─────────────────────────────────────────────────────────────
describe('STAT_FILTERS structure', () => {
  it('exports an array', () => {
    expect(Array.isArray(STAT_FILTERS)).toBe(true);
  });

  it('every entry has required fields', () => {
    for (const f of STAT_FILTERS) {
      expect(typeof f.id).toBe('string');
      expect(f.id.length).toBeGreaterThan(0);
      expect(typeof f.label).toBe('string');
      expect(typeof f.category).toBe('string');
      expect(typeof f.predicate).toBe('function');
    }
  });

  it('ids are unique', () => {
    const ids = STAT_FILTERS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all categories are in FILTER_CATEGORIES', () => {
    for (const f of STAT_FILTERS) {
      expect(FILTER_CATEGORIES).toContain(f.category);
    }
  });
});

// ── Striking filters ──────────────────────────────────────────────────────
describe('HIGH VOLUME filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'high-volume');

  it('matches slpm > 4.5', () => {
    expect(filter.predicate(makeFighter({ striking: { slpm: 4.6 } }))).toBe(true);
  });

  it('rejects slpm = 4.5', () => {
    expect(filter.predicate(makeFighter({ striking: { slpm: 4.5 } }))).toBe(false);
  });

  it('rejects slpm < 4.5', () => {
    expect(filter.predicate(makeFighter({ striking: { slpm: 3.0 } }))).toBe(false);
  });
});

describe('LOW VOLUME filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'low-volume');

  it('matches slpm < 2.5', () => {
    expect(filter.predicate(makeFighter({ striking: { slpm: 2.0 } }))).toBe(true);
  });

  it('rejects slpm = 2.5', () => {
    expect(filter.predicate(makeFighter({ striking: { slpm: 2.5 } }))).toBe(false);
  });

  it('rejects slpm > 2.5', () => {
    expect(filter.predicate(makeFighter({ striking: { slpm: 3.5 } }))).toBe(false);
  });
});

describe('ELITE DEFENSE filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'elite-defense');

  it('matches str_def > 62', () => {
    expect(filter.predicate(makeFighter({ striking: { str_def: 63 } }))).toBe(true);
  });

  it('rejects str_def = 62', () => {
    expect(filter.predicate(makeFighter({ striking: { str_def: 62 } }))).toBe(false);
  });
});

describe('HIGH ABSORPTION filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'high-absorption');

  it('matches sapm > 4.0', () => {
    expect(filter.predicate(makeFighter({ striking: { sapm: 4.1 } }))).toBe(true);
  });

  it('rejects sapm = 4.0', () => {
    expect(filter.predicate(makeFighter({ striking: { sapm: 4.0 } }))).toBe(false);
  });
});

// ── Grappling filters ─────────────────────────────────────────────────────
describe('WRESTLING THREAT filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'wrestling-threat');

  it('matches td_per15 > 3.0 AND td_acc > 45', () => {
    expect(filter.predicate(makeFighter({ grappling: { td_per15: 3.5, td_acc: 50 } }))).toBe(true);
  });

  it('rejects when only td_per15 qualifies', () => {
    expect(filter.predicate(makeFighter({ grappling: { td_per15: 3.5, td_acc: 40 } }))).toBe(false);
  });

  it('rejects when only td_acc qualifies', () => {
    expect(filter.predicate(makeFighter({ grappling: { td_per15: 2.0, td_acc: 50 } }))).toBe(false);
  });

  it('rejects when neither qualifies', () => {
    expect(filter.predicate(makeFighter({ grappling: { td_per15: 1.0, td_acc: 35 } }))).toBe(false);
  });
});

describe('SUB THREAT filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'sub-threat');

  it('matches sub_per15 > 0.5', () => {
    expect(filter.predicate(makeFighter({ grappling: { sub_per15: 0.8 } }))).toBe(true);
  });

  it('rejects sub_per15 = 0.5', () => {
    expect(filter.predicate(makeFighter({ grappling: { sub_per15: 0.5 } }))).toBe(false);
  });
});

describe('TD RESISTANT filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'td-resistant');

  it('matches td_def > 75', () => {
    expect(filter.predicate(makeFighter({ grappling: { td_def: 80 } }))).toBe(true);
  });

  it('rejects td_def = 75', () => {
    expect(filter.predicate(makeFighter({ grappling: { td_def: 75 } }))).toBe(false);
  });
});

// ── Finishing filters ─────────────────────────────────────────────────────
describe('HIGH FINISHER filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'high-finish-rate');

  it('matches finish_rate > 55', () => {
    expect(filter.predicate(makeFighter({ finish_rate: 60 }))).toBe(true);
  });

  it('rejects finish_rate = 55', () => {
    expect(filter.predicate(makeFighter({ finish_rate: 55 }))).toBe(false);
  });
});

describe('KO POWER filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'ko-power');

  it('matches fighter with KO POWER mod', () => {
    expect(filter.predicate(makeFighter({ mods: ['KO POWER', 'SOUTHPAW'] }))).toBe(true);
  });

  it('rejects fighter without KO POWER mod', () => {
    expect(filter.predicate(makeFighter({ mods: ['SOUTHPAW'] }))).toBe(false);
  });

  it('rejects fighter with empty mods array', () => {
    expect(filter.predicate(makeFighter({ mods: [] }))).toBe(false);
  });

  it('handles missing mods gracefully (null)', () => {
    expect(filter.predicate(makeFighter({ mods: null }))).toBe(false);
  });
});

describe('DECISION FIGHTER filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'decision-fighter');

  it('matches finish_rate < 35', () => {
    expect(filter.predicate(makeFighter({ finish_rate: 30 }))).toBe(true);
  });

  it('rejects finish_rate = 35', () => {
    expect(filter.predicate(makeFighter({ finish_rate: 35 }))).toBe(false);
  });
});

// ── Physical filters ──────────────────────────────────────────────────────
describe('SOUTHPAW filter', () => {
  const filter = STAT_FILTERS.find(f => f.id === 'southpaw');

  it('matches Southpaw stance', () => {
    expect(filter.predicate(makeFighter({ stance: 'Southpaw' }))).toBe(true);
  });

  it('rejects Orthodox', () => {
    expect(filter.predicate(makeFighter({ stance: 'Orthodox' }))).toBe(false);
  });

  it('rejects Switch', () => {
    expect(filter.predicate(makeFighter({ stance: 'Switch' }))).toBe(false);
  });
});

// ── Multiple filters applied together ─────────────────────────────────────
describe('combined filter application', () => {
  it('a wrestler who is also southpaw matches both predicates', () => {
    const f = makeFighter({
      stance: 'Southpaw',
      grappling: { td_per15: 4.0, td_acc: 55, td_def: 80, sub_per15: 0.1 },
    });
    const wrestlingFilter = STAT_FILTERS.find(s => s.id === 'wrestling-threat');
    const southpawFilter  = STAT_FILTERS.find(s => s.id === 'southpaw');
    expect(wrestlingFilter.predicate(f)).toBe(true);
    expect(southpawFilter.predicate(f)).toBe(true);
  });

  it('an all-average fighter matches no filter', () => {
    const f = makeFighter();
    const results = STAT_FILTERS.map(s => s.predicate(f));
    expect(results.every(r => r === false)).toBe(true);
  });
});
