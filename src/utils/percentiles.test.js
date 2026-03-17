import { describe, it, expect } from 'vitest';
import { computePercentiles } from './percentiles';

const makeFighter = (slpm, str_acc, str_def, sapm, td_def, td_per15, finish_rate) => ({
  striking:   { slpm, str_acc, str_def, sapm },
  grappling:  { td_def, td_per15 },
  finish_rate,
});

const ROSTER = [
  makeFighter(8.0, 65, 75, 1.5, 92, 5.0, 85), // elite across the board
  makeFighter(4.5, 50, 58, 3.0, 70, 2.5, 60), // mid-tier
  makeFighter(2.0, 35, 42, 5.5, 40, 0.8, 25), // below average
  makeFighter(3.0, 42, 50, 4.0, 55, 1.5, 40), // average
];

describe('computePercentiles', () => {
  it('returns top rank for elite fighter', () => {
    const result = computePercentiles(ROSTER[0], ROSTER);
    expect(result.slpm).toBeLessThanOrEqual(5);
    expect(result.str_def).toBeLessThanOrEqual(5);
    expect(result.td_def).toBeLessThanOrEqual(5);
    expect(result.finish_rate).toBeLessThanOrEqual(5);
  });

  it('sapm lower is better — low absorption ranks top', () => {
    const result = computePercentiles(ROSTER[0], ROSTER);
    // ROSTER[0] has sapm 1.5 which is best (lowest) in the roster
    expect(result.sapm).toBeLessThanOrEqual(10);
  });

  it('below-average fighter ranks near 100', () => {
    const result = computePercentiles(ROSTER[2], ROSTER);
    expect(result.slpm).toBeGreaterThan(50);
    expect(result.finish_rate).toBeGreaterThan(50);
  });

  it('handles null fighter gracefully', () => {
    const result = computePercentiles(null, ROSTER);
    expect(result.slpm).toBe(100);
    expect(result.td_def).toBe(100);
  });

  it('handles empty roster gracefully', () => {
    const result = computePercentiles(ROSTER[0], []);
    expect(result.slpm).toBe(100);
  });

  it('handles null allFighters gracefully', () => {
    const result = computePercentiles(ROSTER[0], null);
    expect(result.slpm).toBe(100);
  });

  it('returns values between 1 and 100', () => {
    for (const fighter of ROSTER) {
      const result = computePercentiles(fighter, ROSTER);
      for (const val of Object.values(result)) {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(100);
      }
    }
  });

  it('returns all expected keys', () => {
    const result = computePercentiles(ROSTER[0], ROSTER);
    expect(result).toHaveProperty('slpm');
    expect(result).toHaveProperty('str_acc');
    expect(result).toHaveProperty('str_def');
    expect(result).toHaveProperty('sapm');
    expect(result).toHaveProperty('td_def');
    expect(result).toHaveProperty('td_per15');
    expect(result).toHaveProperty('finish_rate');
  });

  it('single-fighter roster returns rank 1', () => {
    const solo = [ROSTER[0]];
    const result = computePercentiles(ROSTER[0], solo);
    expect(result.slpm).toBe(1);
  });
});
