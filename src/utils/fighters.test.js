import { describe, it, expect } from 'vitest';
import { findFighterByName } from './fighters';

const ROSTER = [
  { id: 1,  name: 'Islam Makhachev' },
  { id: 2,  name: 'Dustin Poirier'  },
  { id: 3,  name: 'Jiri Prochazka' },
  { id: 4,  name: 'Bo Nickal'       },
];

describe('findFighterByName', () => {
  it('matches exact full name (case-insensitive)', () => {
    expect(findFighterByName('Islam Makhachev', ROSTER)?.id).toBe(1);
    expect(findFighterByName('islam makhachev', ROSTER)?.id).toBe(1);
    expect(findFighterByName('DUSTIN POIRIER',  ROSTER)?.id).toBe(2);
  });

  it('matches by last name when no exact match', () => {
    expect(findFighterByName('Makhachev', ROSTER)?.id).toBe(1);
    expect(findFighterByName('Poirier',   ROSTER)?.id).toBe(2);
  });

  it('returns null for unknown name', () => {
    expect(findFighterByName('Unknown Fighter', ROSTER)).toBeNull();
    expect(findFighterByName('Jones', ROSTER)).toBeNull();
  });

  it('returns null for empty/null/undefined name', () => {
    expect(findFighterByName('',        ROSTER)).toBeNull();
    expect(findFighterByName(null,      ROSTER)).toBeNull();
    expect(findFighterByName(undefined, ROSTER)).toBeNull();
  });

  it('returns null for null or empty roster', () => {
    expect(findFighterByName('Islam Makhachev', null)).toBeNull();
    expect(findFighterByName('Islam Makhachev', [])).toBeNull();
  });

  it('trims whitespace from input', () => {
    expect(findFighterByName('  Islam Makhachev  ', ROSTER)?.id).toBe(1);
  });

  it('ignores last names shorter than 3 chars (prevents false positives)', () => {
    // 'Bo' is 2 chars — should not match on last name fallback
    expect(findFighterByName('Bo', ROSTER)).toBeNull();
  });

  it('returns null for non-string roster entries (defensive)', () => {
    expect(findFighterByName('Islam Makhachev', [null, undefined, { id: 1 }])).toBeNull();
  });
});
