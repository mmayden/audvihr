/**
 * statTiers — tier thresholds for key fighter stats.
 *
 * Each entry defines four brackets used to label stats in the compare table
 * and percentile badge display:
 *   ELITE / ABOVE AVG / AVG / BELOW AVG
 *
 * For higherIsBetter: true — value >= elite → ELITE, >= aboveAvg → ABOVE AVG, etc.
 * For higherIsBetter: false (sapm) — value <= elite → ELITE, etc.
 *
 * Thresholds are calibrated against the 69-fighter UFC roster (March 2026).
 */
export const STAT_TIERS = {
  slpm: {
    higherIsBetter: true,
    elite:    6.0,
    aboveAvg: 4.5,
    avg:      3.0,
  },
  str_acc: {
    higherIsBetter: true,
    elite:    56,
    aboveAvg: 48,
    avg:      40,
  },
  sapm: {
    higherIsBetter: false, // lower absorbed = better
    elite:    2.0,
    aboveAvg: 3.0,
    avg:      4.0,
  },
  str_def: {
    higherIsBetter: true,
    elite:    65,
    aboveAvg: 57,
    avg:      48,
  },
  td_def: {
    higherIsBetter: true,
    elite:    80,
    aboveAvg: 68,
    avg:      55,
  },
  td_per15: {
    higherIsBetter: true,
    elite:    4.0,
    aboveAvg: 2.5,
    avg:      1.5,
  },
  td_acc: {
    higherIsBetter: true,
    elite:    55,
    aboveAvg: 44,
    avg:      33,
  },
  finish_rate: {
    higherIsBetter: true,
    elite:    75,
    aboveAvg: 60,
    avg:      40,
  },
};

/**
 * Get the tier label for a stat value.
 * @param {string} statKey - key from STAT_TIERS
 * @param {number} value
 * @returns {'ELITE'|'ABOVE AVG'|'AVG'|'BELOW AVG'}
 */
export function getStatTier(statKey, value) {
  const tier = STAT_TIERS[statKey];
  if (!tier || value === null || value === undefined || isNaN(value)) return 'BELOW AVG';
  const { higherIsBetter, elite, aboveAvg, avg } = tier;
  if (higherIsBetter) {
    if (value >= elite)    return 'ELITE';
    if (value >= aboveAvg) return 'ABOVE AVG';
    if (value >= avg)      return 'AVG';
    return 'BELOW AVG';
  } else {
    if (value <= elite)    return 'ELITE';
    if (value <= aboveAvg) return 'ABOVE AVG';
    if (value <= avg)      return 'AVG';
    return 'BELOW AVG';
  }
}
