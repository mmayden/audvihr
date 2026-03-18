/**
 * statFilters.js — preset stat filter definitions for the FighterScreen roster.
 *
 * Each filter entry:
 * @typedef {Object} StatFilter
 * @property {string} id       - unique key, used as React key and toggle identifier
 * @property {string} label    - display label shown on the chip
 * @property {string} category - grouping label: 'STRIKING' | 'GRAPPLING' | 'FINISHING' | 'PHYSICAL'
 * @property {function(Object): boolean} predicate - receives a fighter object, returns true if the
 *                                                   fighter matches the filter
 *
 * Thresholds are calibrated against the 69-fighter roster as of v0.16.0.
 * All numeric comparisons use the same field paths defined in fighters.js.
 */

export const STAT_FILTERS = [
  // ── Striking ──────────────────────────────────────────────────────────────
  {
    id: 'high-volume',
    label: 'HIGH VOLUME',
    category: 'STRIKING',
    predicate: f => f.striking.slpm > 4.5,
  },
  {
    id: 'low-volume',
    label: 'LOW VOLUME',
    category: 'STRIKING',
    predicate: f => f.striking.slpm < 2.5,
  },
  {
    id: 'elite-defense',
    label: 'ELITE DEFENSE',
    category: 'STRIKING',
    predicate: f => f.striking.str_def > 62,
  },
  {
    id: 'high-absorption',
    label: 'HIGH ABSORPTION',
    category: 'STRIKING',
    predicate: f => f.striking.sapm > 4.0,
  },

  // ── Grappling ─────────────────────────────────────────────────────────────
  {
    id: 'wrestling-threat',
    label: 'WRESTLING THREAT',
    category: 'GRAPPLING',
    predicate: f => f.grappling.td_per15 > 3.0 && f.grappling.td_acc > 45,
  },
  {
    id: 'sub-threat',
    label: 'SUB THREAT',
    category: 'GRAPPLING',
    predicate: f => f.grappling.sub_per15 > 0.5,
  },
  {
    id: 'td-resistant',
    label: 'TD RESISTANT',
    category: 'GRAPPLING',
    predicate: f => f.grappling.td_def > 75,
  },

  // ── Finishing ─────────────────────────────────────────────────────────────
  {
    id: 'high-finish-rate',
    label: 'HIGH FINISHER',
    category: 'FINISHING',
    predicate: f => f.finish_rate > 55,
  },
  {
    id: 'ko-power',
    label: 'KO POWER',
    category: 'FINISHING',
    predicate: f => Array.isArray(f.mods) && f.mods.includes('KO POWER'),
  },
  {
    id: 'decision-fighter',
    label: 'DECISION FIGHTER',
    category: 'FINISHING',
    predicate: f => f.finish_rate < 35,
  },

  // ── Physical ──────────────────────────────────────────────────────────────
  {
    id: 'southpaw',
    label: 'SOUTHPAW',
    category: 'PHYSICAL',
    predicate: f => f.stance === 'Southpaw',
  },
];

/** Category order for rendering filter groups. */
export const FILTER_CATEGORIES = ['STRIKING', 'GRAPPLING', 'FINISHING', 'PHYSICAL'];
