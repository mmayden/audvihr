/**
 * compareRows — configuration for the CompareScreen stat table.
 *
 * Each entry is a function that takes (f1, f2) and returns a row descriptor:
 *   { cat, l, v1, v2, n1, n2, higherIsBetter }
 *
 * - cat            {string}  Category header (shown once per group)
 * - l              {string}  Stat label (center column)
 * - v1 / v2        {string}  Formatted display values
 * - n1 / n2        {number}  Numeric values used for win/lose comparison
 * - higherIsBetter {boolean} True → higher n wins; false → lower n wins
 */

export const COMPARE_ROW_DEFS = [
  (f1, f2) => ({ cat: 'RECORD',   l: 'Overall Record',     v1: `${f1.wins}-${f1.losses}`,         v2: `${f2.wins}-${f2.losses}`,         n1: f1.wins,                    n2: f2.wins,                    higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'RECORD',   l: 'Win Streak',         v1: f1.streak,                          v2: f2.streak,                          n1: f1.streak,                  n2: f2.streak,                  higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'RECORD',   l: 'Finish Rate %',      v1: f1.finish_rate + '%',               v2: f2.finish_rate + '%',               n1: f1.finish_rate,             n2: f2.finish_rate,             higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'STRIKING', l: 'Sig Strikes / Min',  v1: f1.striking.slpm,                   v2: f2.striking.slpm,                   n1: f1.striking.slpm,           n2: f2.striking.slpm,           higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'STRIKING', l: 'Striking Accuracy %',v1: f1.striking.str_acc + '%',          v2: f2.striking.str_acc + '%',          n1: f1.striking.str_acc,        n2: f2.striking.str_acc,        higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'STRIKING', l: 'Str Absorbed / Min', v1: f1.striking.sapm,                   v2: f2.striking.sapm,                   n1: f1.striking.sapm,           n2: f2.striking.sapm,           higherIsBetter: false }),
  (f1, f2) => ({ cat: 'STRIKING', l: 'Striking Defense %', v1: f1.striking.str_def + '%',          v2: f2.striking.str_def + '%',          n1: f1.striking.str_def,        n2: f2.striking.str_def,        higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'STRIKING', l: 'Knockdowns Landed',  v1: f1.striking.kd_landed,              v2: f2.striking.kd_landed,              n1: f1.striking.kd_landed,      n2: f2.striking.kd_landed,      higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'GRAPPLING',l: 'TD Attempts / 15',   v1: f1.grappling.td_per15,              v2: f2.grappling.td_per15,              n1: f1.grappling.td_per15,      n2: f2.grappling.td_per15,      higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'GRAPPLING',l: 'TD Accuracy %',      v1: f1.grappling.td_acc + '%',          v2: f2.grappling.td_acc + '%',          n1: f1.grappling.td_acc,        n2: f2.grappling.td_acc,        higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'GRAPPLING',l: 'TD Defense %',       v1: f1.grappling.td_def + '%',          v2: f2.grappling.td_def + '%',          n1: f1.grappling.td_def,        n2: f2.grappling.td_def,        higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'GRAPPLING',l: 'Sub Avg / 15 Min',   v1: f1.grappling.sub_per15,             v2: f2.grappling.sub_per15,             n1: f1.grappling.sub_per15,     n2: f2.grappling.sub_per15,     higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'GRAPPLING',l: 'Ctrl Time / 15 Min', v1: f1.grappling.ctrl_time_per15,       v2: f2.grappling.ctrl_time_per15,       n1: f1.grappling.ctrl_time_per15,n2: f2.grappling.ctrl_time_per15,higherIsBetter: true }),
  (f1, f2) => ({ cat: 'PHYSICAL', l: 'Reach',              v1: f1.reach,                           v2: f2.reach,                           n1: parseInt(f1.reach),         n2: parseInt(f2.reach),         higherIsBetter: true  }),
  (f1, f2) => ({ cat: 'PHYSICAL', l: 'Age',                v1: f1.age + ' yrs',                    v2: f2.age + ' yrs',                    n1: f1.age,                     n2: f2.age,                     higherIsBetter: false }),
];
