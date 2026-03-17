import { describe, it, expect, beforeEach } from 'vitest';
import { readPickLog, appendPick, updatePickOutcome, PICK_LOG_KEY } from './pickLog';

beforeEach(() => {
  localStorage.clear();
});

const makePick = (overrides = {}) => ({
  fightKey:   'makhachev_poirier',
  fighter:    'Islam Makhachev',
  method:     'Submission',
  confidence: 4,
  outcome:    '',
  notes:      'Strong TD defense matchup',
  ts:         '2026-03-17T10:00:00.000Z',
  ...overrides,
});

describe('readPickLog', () => {
  it('returns empty array when nothing stored', () => {
    expect(readPickLog()).toEqual([]);
  });

  it('returns stored picks', () => {
    appendPick(makePick());
    const log = readPickLog();
    expect(log).toHaveLength(1);
    expect(log[0].fighter).toBe('Islam Makhachev');
  });

  it('returns [] on corrupt localStorage data', () => {
    localStorage.setItem(PICK_LOG_KEY, 'not-json{{{');
    expect(readPickLog()).toEqual([]);
  });

  it('returns [] when stored value is not an array', () => {
    localStorage.setItem(PICK_LOG_KEY, JSON.stringify({ invalid: true }));
    expect(readPickLog()).toEqual([]);
  });
});

describe('appendPick', () => {
  it('appends a pick to the log', () => {
    appendPick(makePick({ fighter: 'Fighter A' }));
    appendPick(makePick({ fighter: 'Fighter B', fightKey: 'a_b' }));
    const log = readPickLog();
    expect(log).toHaveLength(2);
    expect(log[0].fighter).toBe('Fighter A');
    expect(log[1].fighter).toBe('Fighter B');
  });

  it('defaults outcome to empty string when not provided', () => {
    appendPick(makePick({ outcome: undefined }));
    expect(readPickLog()[0].outcome).toBe('');
  });

  it('defaults notes to empty string when not provided', () => {
    appendPick(makePick({ notes: undefined }));
    expect(readPickLog()[0].notes).toBe('');
  });

  it('defaults confidence to 3 for non-finite confidence', () => {
    appendPick(makePick({ confidence: NaN }));
    expect(readPickLog()[0].confidence).toBe(3);
  });

  it('coerces all string fields to strings', () => {
    appendPick(makePick({ fighter: 42, method: null }));
    const log = readPickLog();
    expect(typeof log[0].fighter).toBe('string');
    expect(typeof log[0].method).toBe('string');
  });

  it('stores XSS attempt as plain text, never executes', () => {
    const xss = '<script>alert(1)</script>';
    appendPick(makePick({ notes: xss }));
    const log = readPickLog();
    expect(log[0].notes).toBe(xss); // stored as-is
    // Never rendered via innerHTML — JSX renders it safely
  });

  it('enforces 200-entry cap by evicting oldest entries', () => {
    for (let i = 0; i < 210; i++) {
      appendPick(makePick({ fightKey: `fight_${i}`, fighter: `Fighter ${i}` }));
    }
    const log = readPickLog();
    expect(log.length).toBeLessThanOrEqual(200);
    // Most recent entry should be present
    expect(log[log.length - 1].fighter).toBe('Fighter 209');
    // Oldest should have been evicted
    expect(log.find(e => e.fighter === 'Fighter 0')).toBeUndefined();
  });
});

describe('updatePickOutcome', () => {
  it('updates outcome on the most recent matching fightKey', () => {
    appendPick(makePick({ fightKey: 'a_b' }));
    updatePickOutcome('a_b', 'W');
    expect(readPickLog()[0].outcome).toBe('W');
  });

  it('updates only the most recent entry when multiple share the same fightKey', () => {
    appendPick(makePick({ fightKey: 'a_b', fighter: 'First Pick' }));
    appendPick(makePick({ fightKey: 'a_b', fighter: 'Second Pick' }));
    updatePickOutcome('a_b', 'L');
    const log = readPickLog();
    expect(log[0].outcome).toBe('');   // first pick unchanged
    expect(log[1].outcome).toBe('L');  // second pick updated
  });

  it('does nothing when fightKey not found', () => {
    appendPick(makePick({ fightKey: 'a_b' }));
    updatePickOutcome('x_y', 'W');
    expect(readPickLog()[0].outcome).toBe('');
  });

  it('coerces outcome to string', () => {
    appendPick(makePick({ fightKey: 'a_b' }));
    updatePickOutcome('a_b', null);
    expect(readPickLog()[0].outcome).toBe('');
  });
});
