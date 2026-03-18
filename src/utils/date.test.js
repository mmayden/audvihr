import { describe, it, expect } from 'vitest';
import { daysUntil, isPast, formatDate, formatEventDate, countdown } from './date';

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

describe('formatDate', () => {
  it('formats an ISO date as short month/day/year', () => {
    expect(formatDate('2026-03-14')).toBe('Mar 14, 2026');
  });

  it('is stable across timezones (uses UTC noon)', () => {
    // March 15 UTC noon should always render as Mar 15
    expect(formatDate('2026-03-15')).toBe('Mar 15, 2026');
  });
});

describe('formatEventDate', () => {
  it('includes a weekday abbreviation', () => {
    // 2026-04-12 is a Sunday
    expect(formatEventDate('2026-04-12')).toMatch(/Sun/);
  });

  it('includes month, day, and year', () => {
    expect(formatEventDate('2026-04-12')).toMatch(/Apr/);
    expect(formatEventDate('2026-04-12')).toMatch(/12/);
    expect(formatEventDate('2026-04-12')).toMatch(/2026/);
  });
});

describe('countdown', () => {
  it('returns TODAY for 0 days out', () => {
    expect(countdown('2026-03-15', today)).toBe('TODAY');
  });

  it('returns 1D for 1 day out', () => {
    expect(countdown('2026-03-16', today)).toBe('1D');
  });

  it('returns ND for N days out', () => {
    expect(countdown('2026-03-22', today)).toBe('7D');
  });

  it('returns default PAST for past dates', () => {
    expect(countdown('2026-03-10', today)).toBe('PAST');
  });

  it('uses custom pastLabel when provided', () => {
    expect(countdown('2026-03-10', today, 'CLOSED')).toBe('CLOSED');
  });
});
