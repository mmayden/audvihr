import { describe, it, expect } from 'vitest';
import { daysUntil, isPast } from './date';

// Use a fixed noon UTC reference to avoid UTC vs local-midnight ambiguity.
const today = new Date('2026-03-15T12:00:00Z');

describe('daysUntil', () => {
  it('returns a positive number for future dates', () => {
    expect(daysUntil('2026-03-22', today)).toBeGreaterThan(0);
  });

  it('returns a negative number for past dates', () => {
    expect(daysUntil('2026-03-08', today)).toBeLessThan(0);
  });

  it('returns ~7 for a date 7 days out', () => {
    // Allow ±1 for timezone rounding
    const d = daysUntil('2026-03-22', today);
    expect(d).toBeGreaterThanOrEqual(6);
    expect(d).toBeLessThanOrEqual(8);
  });

  it('returns ~-7 for a date 7 days ago', () => {
    const d = daysUntil('2026-03-08', today);
    expect(d).toBeGreaterThanOrEqual(-8);
    expect(d).toBeLessThanOrEqual(-6);
  });
});

describe('isPast', () => {
  it('returns false for a future date', () => {
    expect(isPast('2026-03-20', today)).toBe(false);
  });

  it('returns true for a past date', () => {
    expect(isPast('2026-03-10', today)).toBe(true);
  });
});
