/**
 * percentiles — compute per-stat percentile ranks for a fighter vs the full roster.
 *
 * A percentile rank of 5 means the fighter is in the top 5% for that stat
 * (i.e., only 5% of the roster is at or above them). Lower rank = better.
 *
 * Used to render TOP X% badges in TabOverview key numbers.
 */

/**
 * Compute the percentile rank (1–100) of a single value within an array.
 * Returns the percentage of values strictly below this value + 1.
 * Lower result = better rank (1 = top fighter for this stat).
 *
 * @param {number}   value          - the fighter's value for this stat
 * @param {number[]} allValues      - all values in the roster for this stat
 * @param {boolean}  higherIsBetter - if true, higher value = lower (better) rank
 * @returns {number} percentile rank, 1–100
 */
function rankPercentile(value, allValues, higherIsBetter) {
  const valid = allValues.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (!valid.length) return 100;
  const above = higherIsBetter
    ? valid.filter(v => v > value).length
    : valid.filter(v => v < value).length;
  return Math.max(1, Math.ceil((above / valid.length) * 100));
}

/**
 * Compute percentile ranks for a fighter across key display stats.
 *
 * @param {object}   fighter     - fighter object from FIGHTERS
 * @param {object[]} allFighters - full FIGHTERS array
 * @returns {{ slpm, str_acc, str_def, sapm, td_def, td_per15, finish_rate }}
 *          Each value is a percentile rank 1–100 (lower = better rank).
 */
export function computePercentiles(fighter, allFighters) {
  if (!fighter || !Array.isArray(allFighters) || !allFighters.length) {
    return { slpm: 100, str_acc: 100, str_def: 100, sapm: 100, td_def: 100, td_per15: 100, finish_rate: 100 };
  }

  return {
    slpm:        rankPercentile(fighter.striking.slpm,          allFighters.map(f => f.striking.slpm),          true),
    str_acc:     rankPercentile(fighter.striking.str_acc,        allFighters.map(f => f.striking.str_acc),        true),
    str_def:     rankPercentile(fighter.striking.str_def,        allFighters.map(f => f.striking.str_def),        true),
    sapm:        rankPercentile(fighter.striking.sapm,           allFighters.map(f => f.striking.sapm),           false),
    td_def:      rankPercentile(fighter.grappling.td_def,        allFighters.map(f => f.grappling.td_def),        true),
    td_per15:    rankPercentile(fighter.grappling.td_per15,      allFighters.map(f => f.grappling.td_per15),      true),
    finish_rate: rankPercentile(fighter.finish_rate,             allFighters.map(f => f.finish_rate),             true),
  };
}
