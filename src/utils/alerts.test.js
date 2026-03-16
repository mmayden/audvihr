import { describe, it, expect, beforeEach } from 'vitest';
import {
  ALERTS_ENABLED_KEY,
  ALERT_RULES_KEY,
  DEFAULT_THRESHOLD,
  readAlertsEnabled,  writeAlertsEnabled,
  readAlertRules,     writeAlertRules,
  readPrevLines,      writePrevLines,
  detectMovements,
} from './alerts';

// The test setup in src/test/setup.js provides in-memory localStorage + sessionStorage mocks.

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// ---------------------------------------------------------------------------
// readAlertsEnabled / writeAlertsEnabled
// ---------------------------------------------------------------------------

describe('readAlertsEnabled', () => {
  it('returns false by default (key absent)', () => {
    expect(readAlertsEnabled()).toBe(false);
  });

  it('returns false when stored as false', () => {
    writeAlertsEnabled(false);
    expect(readAlertsEnabled()).toBe(false);
  });

  it('returns true when stored as true', () => {
    writeAlertsEnabled(true);
    expect(readAlertsEnabled()).toBe(true);
  });

  it('returns false on invalid JSON', () => {
    localStorage.setItem(ALERTS_ENABLED_KEY, 'not-json');
    expect(readAlertsEnabled()).toBe(false);
  });

  it('round-trips correctly', () => {
    writeAlertsEnabled(true);
    expect(readAlertsEnabled()).toBe(true);
    writeAlertsEnabled(false);
    expect(readAlertsEnabled()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// readAlertRules / writeAlertRules
// ---------------------------------------------------------------------------

describe('readAlertRules', () => {
  it('returns {} by default', () => {
    expect(readAlertRules()).toEqual({});
  });

  it('returns {} on invalid JSON', () => {
    localStorage.setItem(ALERT_RULES_KEY, 'bad');
    expect(readAlertRules()).toEqual({});
  });

  it('returns {} when stored value is an array', () => {
    localStorage.setItem(ALERT_RULES_KEY, JSON.stringify([]));
    expect(readAlertRules()).toEqual({});
  });

  it('returns {} when stored value is null', () => {
    localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(null));
    expect(readAlertRules()).toEqual({});
  });

  it('round-trips a rules map', () => {
    const rules = { 'fightA': { enabled: true, threshold: 8 } };
    writeAlertRules(rules);
    expect(readAlertRules()).toEqual(rules);
  });

  it('does not write when rules is not an object', () => {
    writeAlertRules(null);
    expect(readAlertRules()).toEqual({});
    writeAlertRules('bad');
    expect(readAlertRules()).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// readPrevLines / writePrevLines
// ---------------------------------------------------------------------------

describe('readPrevLines / writePrevLines', () => {
  it('returns {} by default', () => {
    expect(readPrevLines()).toEqual({});
  });

  it('returns {} on invalid JSON (sessionStorage)', () => {
    sessionStorage.setItem('alerts_prev_lines', 'bad');
    expect(readPrevLines()).toEqual({});
  });

  it('returns {} when stored value is an array', () => {
    sessionStorage.setItem('alerts_prev_lines', JSON.stringify([]));
    expect(readPrevLines()).toEqual({});
  });

  it('round-trips a prev-lines map', () => {
    const snap = { 'fightA': { f1_ml: '-130', f2_ml: '+110' } };
    writePrevLines(snap);
    expect(readPrevLines()).toEqual(snap);
  });

  it('does not write when map is not an object', () => {
    writePrevLines(null);
    expect(readPrevLines()).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// detectMovements
// ---------------------------------------------------------------------------

const sampleOdds = (fightKey, f1_ml, f2_ml) => ({
  fightKey,
  fighter1: 'Islam Makhachev',
  fighter2: 'Charles Oliveira',
  sportsbook: { f1_ml, f2_ml, source: 'DraftKings' },
});

describe('detectMovements', () => {
  it('returns [] when oddsData is empty', () => {
    expect(detectMovements([], {}, {})).toEqual([]);
  });

  it('returns [] when oddsData is not an array', () => {
    expect(detectMovements(null, {}, {})).toEqual([]);
    expect(detectMovements(undefined, {}, {})).toEqual([]);
  });

  it('returns [] when rules is null/non-object', () => {
    const odds = [sampleOdds('fightA', '-150', '+130')];
    expect(detectMovements(odds, { fightA: { f1_ml: '-160', f2_ml: '+140' } }, null)).toEqual([]);
  });

  it('returns [] when prevLines is null/non-object', () => {
    const odds = [sampleOdds('fightA', '-150', '+130')];
    const rules = { fightA: { enabled: true, threshold: 5 } };
    expect(detectMovements(odds, null, rules)).toEqual([]);
  });

  it('skips fights with no per-fight rule', () => {
    const odds = [sampleOdds('fightA', '-150', '+130')];
    const prev = { fightA: { f1_ml: '-160', f2_ml: '+140' } };
    expect(detectMovements(odds, prev, {})).toEqual([]);
  });

  it('skips fights where enabled is false', () => {
    const odds = [sampleOdds('fightA', '-150', '+130')];
    const prev = { fightA: { f1_ml: '-200', f2_ml: '+160' } };
    const rules = { fightA: { enabled: false, threshold: 5 } };
    expect(detectMovements(odds, prev, rules)).toEqual([]);
  });

  it('returns [] when no prev line exists for a fight (first fetch)', () => {
    const odds = [sampleOdds('fightA', '-150', '+130')];
    const rules = { fightA: { enabled: true, threshold: 5 } };
    expect(detectMovements(odds, {}, rules)).toEqual([]);
  });

  it('returns [] when delta is below threshold', () => {
    const odds = [sampleOdds('fightA', '-154', '+130')];
    const prev = { fightA: { f1_ml: '-150', f2_ml: '+130' } };
    const rules = { fightA: { enabled: true, threshold: 5 } };
    expect(detectMovements(odds, prev, rules)).toEqual([]);
  });

  it('returns [] when delta equals threshold - 1', () => {
    const odds = [sampleOdds('fightA', '-154', '+130')];
    const prev = { fightA: { f1_ml: '-150', f2_ml: '+130' } };
    const rules = { fightA: { enabled: true, threshold: 5 } };
    // delta = 4, threshold = 5 → no alert
    expect(detectMovements(odds, prev, rules)).toEqual([]);
  });

  it('detects movement at exactly the threshold', () => {
    const odds = [sampleOdds('fightA', '-155', '+135')];
    const prev = { fightA: { f1_ml: '-150', f2_ml: '+130' } };
    const rules = { fightA: { enabled: true, threshold: 5 } };
    const result = detectMovements(odds, prev, rules);
    expect(result).toHaveLength(1);
    expect(result[0].fightKey).toBe('fightA');
    expect(result[0].delta).toBe(5);
    expect(result[0].direction).toBe('shortening'); // -155 < -150 numerically → favourite shortened
  });

  it('detects shortening direction (F1 becoming bigger favourite)', () => {
    const odds = [sampleOdds('fightA', '-200', '+170')];
    const prev = { fightA: { f1_ml: '-150', f2_ml: '+130' } };
    const rules = { fightA: { enabled: true, threshold: 5 } };
    const result = detectMovements(odds, prev, rules);
    expect(result).toHaveLength(1);
    expect(result[0].direction).toBe('shortening'); // moved from -150 to -200
    expect(result[0].delta).toBe(50);
  });

  it('uses DEFAULT_THRESHOLD when rule has no threshold', () => {
    const odds = [sampleOdds('fightA', `-${DEFAULT_THRESHOLD + 150}`, '+130')];
    const prev = { fightA: { f1_ml: '-150', f2_ml: '+130' } };
    const rules = { fightA: { enabled: true } }; // no threshold field
    const result = detectMovements(odds, prev, rules);
    expect(result).toHaveLength(1);
  });

  it('handles multiple fights, fires only enabled ones', () => {
    const odds = [
      sampleOdds('fightA', '-200', '+170'),
      sampleOdds('fightB', '-200', '+170'),
    ];
    const prev = {
      fightA: { f1_ml: '-150', f2_ml: '+130' },
      fightB: { f1_ml: '-150', f2_ml: '+130' },
    };
    const rules = {
      fightA: { enabled: true,  threshold: 5 },
      fightB: { enabled: false, threshold: 5 },
    };
    const result = detectMovements(odds, prev, rules);
    expect(result).toHaveLength(1);
    expect(result[0].fightKey).toBe('fightA');
  });

  it('includes correct fighter names and ML values in result', () => {
    const odds = [sampleOdds('fightA', '-200', '+170')];
    const prev = { fightA: { f1_ml: '-150', f2_ml: '+130' } };
    const rules = { fightA: { enabled: true, threshold: 5 } };
    const [mv] = detectMovements(odds, prev, rules);
    expect(mv.fighter1).toBe('Islam Makhachev');
    expect(mv.fighter2).toBe('Charles Oliveira');
    expect(mv.prevF1ml).toBe('-150');
    expect(mv.curF1ml).toBe('-200');
  });

  it('skips fight entries with no sportsbook data', () => {
    const odds = [{ fightKey: 'fightA', fighter1: 'A', fighter2: 'B', sportsbook: null }];
    const prev = { fightA: { f1_ml: '-150', f2_ml: '+130' } };
    const rules = { fightA: { enabled: true, threshold: 5 } };
    expect(detectMovements(odds, prev, rules)).toEqual([]);
  });
});
