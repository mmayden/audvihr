import { describe, it, expect } from 'vitest';
import { mlToImplied, lineMovement } from './odds';

describe('mlToImplied', () => {
  it('converts a favourite moneyline to implied probability', () => {
    expect(mlToImplied('-150')).toBe('60.0');
  });

  it('converts an underdog moneyline to implied probability', () => {
    expect(mlToImplied('+200')).toBe('33.3');
  });

  it('handles even money (+100)', () => {
    expect(mlToImplied('+100')).toBe('50.0');
  });

  it('returns null for zero', () => {
    expect(mlToImplied('0')).toBeNull();
  });

  it('returns null for non-numeric input', () => {
    expect(mlToImplied('abc')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(mlToImplied('')).toBeNull();
  });

  it('handles numeric input (not just strings)', () => {
    expect(mlToImplied(-200)).toBe('66.7');
  });
});

describe('lineMovement', () => {
  it('detects line movement toward the favourite (up)', () => {
    // -120 open → -150 current: implied goes from 54.5% to 60.0%, moving up
    const result = lineMovement('-120', '-150');
    expect(result).not.toBeNull();
    expect(result.dir).toBe('up');
    expect(result.label).toMatch(/implied/);
  });

  it('detects line movement away from the fighter (down)', () => {
    // -150 open → -120 current: implied drops from 60.0% to 54.5%
    const result = lineMovement('-150', '-120');
    expect(result).not.toBeNull();
    expect(result.dir).toBe('down');
  });

  it('returns null when lines are identical', () => {
    expect(lineMovement('-150', '-150')).toBeNull();
  });

  it('returns null when either value is missing', () => {
    expect(lineMovement('', '-150')).toBeNull();
    expect(lineMovement('-150', '')).toBeNull();
  });

  it('returns null when either value is non-numeric', () => {
    expect(lineMovement('abc', '-150')).toBeNull();
  });
});
