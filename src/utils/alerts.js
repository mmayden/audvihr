/**
 * alerts.js — pure utility functions for line-movement alert rules.
 *
 * localStorage keys (owned by this module):
 *   alerts_enabled  — boolean global on/off flag
 *   alert_rules     — { [fightKey]: { enabled: bool, threshold: number } }
 *
 * sessionStorage key (owned by this module):
 *   alerts_prev_lines — { [fightKey]: { f1_ml: string, f2_ml: string } }
 *     Transient snapshot of previous ML values used to detect movement
 *     between successive odds fetches within the same browser session.
 */

export const ALERTS_ENABLED_KEY = 'alerts_enabled';
export const ALERT_RULES_KEY    = 'alert_rules';
const PREV_LINES_KEY            = 'alerts_prev_lines';

/** Default movement threshold in moneyline points. */
export const DEFAULT_THRESHOLD = 5;

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

/**
 * Read the global alerts-enabled flag.
 * Defaults to false (user must opt in via the settings panel).
 * @returns {boolean}
 */
export function readAlertsEnabled() {
  try {
    const s = localStorage.getItem(ALERTS_ENABLED_KEY);
    if (s === null) return false;
    return JSON.parse(s) === true;
  } catch { return false; }
}

/**
 * Write the global alerts-enabled flag.
 * @param {boolean} enabled
 */
export function writeAlertsEnabled(enabled) {
  try { localStorage.setItem(ALERTS_ENABLED_KEY, JSON.stringify(Boolean(enabled))); } catch { /* quota */ }
}

/**
 * Read per-fight alert rules from localStorage.
 * @returns {{ [fightKey: string]: { enabled: boolean, threshold: number } }}
 */
export function readAlertRules() {
  try {
    const s = localStorage.getItem(ALERT_RULES_KEY);
    if (!s) return {};
    const parsed = JSON.parse(s);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed;
  } catch { return {}; }
}

/**
 * Write per-fight alert rules to localStorage.
 * @param {{ [fightKey: string]: { enabled: boolean, threshold: number } }} rules
 */
export function writeAlertRules(rules) {
  if (typeof rules !== 'object' || rules === null) return;
  try { localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(rules)); } catch { /* quota */ }
}

// ---------------------------------------------------------------------------
// sessionStorage helpers (transient — cleared on tab close)
// ---------------------------------------------------------------------------

/**
 * Read the previous ML snapshot from sessionStorage.
 * @returns {{ [fightKey: string]: { f1_ml: string, f2_ml: string } }}
 */
export function readPrevLines() {
  try {
    const s = sessionStorage.getItem(PREV_LINES_KEY);
    if (!s) return {};
    const parsed = JSON.parse(s);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed;
  } catch { return {}; }
}

/**
 * Write the previous ML snapshot to sessionStorage.
 * @param {{ [fightKey: string]: { f1_ml: string, f2_ml: string } }} map
 */
export function writePrevLines(map) {
  if (typeof map !== 'object' || map === null) return;
  try { sessionStorage.setItem(PREV_LINES_KEY, JSON.stringify(map)); } catch { /* quota */ }
}

// ---------------------------------------------------------------------------
// Movement detection (pure)
// ---------------------------------------------------------------------------

/**
 * Compare current odds data against previous ML snapshot.
 * Returns an array of movement events for fights whose alert rule is enabled
 * and whose F1 moneyline has moved at or beyond the configured threshold.
 *
 * Only fights with an explicit enabled:true rule fire alerts — global alertsEnabled
 * is checked by the caller (useAlerts), not here.
 *
 * @param {Array}  oddsData          - current sportsbook array from useOdds
 * @param {Object} prevLines         - previous ML snapshot
 * @param {Object} rules             - per-fight rules map
 * @param {number} [defaultThreshold=DEFAULT_THRESHOLD] - fallback threshold in ML points
 * @returns {Array<{
 *   fightKey: string,
 *   fighter1: string,
 *   fighter2: string,
 *   direction: 'shortening'|'drifting',
 *   delta: number,
 *   prevF1ml: string,
 *   curF1ml: string,
 * }>}
 */
export function detectMovements(oddsData, prevLines, rules, defaultThreshold = DEFAULT_THRESHOLD) {
  if (!Array.isArray(oddsData) || oddsData.length === 0) return [];
  if (!prevLines || typeof prevLines !== 'object') return [];
  if (!rules    || typeof rules    !== 'object') return [];

  const movements = [];

  oddsData.forEach((fight) => {
    if (!fight || !fight.fightKey || !fight.sportsbook) return;

    const rule = rules[fight.fightKey];
    if (!rule || rule.enabled !== true) return; // per-fight must be explicitly enabled

    const threshold = (typeof rule.threshold === 'number' && rule.threshold > 0)
      ? rule.threshold
      : defaultThreshold;

    const prev = prevLines[fight.fightKey];
    if (!prev) return; // no previous line in this session — first fetch, skip

    const curF1  = parseInt(fight.sportsbook.f1_ml,  10);
    const prevF1 = parseInt(prev.f1_ml,               10);
    if (isNaN(curF1) || isNaN(prevF1)) return;

    const delta = Math.abs(curF1 - prevF1);
    if (delta < threshold) return;

    movements.push({
      fightKey:  fight.fightKey,
      fighter1:  fight.fighter1,
      fighter2:  fight.fighter2,
      direction: curF1 < prevF1 ? 'shortening' : 'drifting',
      delta,
      prevF1ml:  prev.f1_ml,
      curF1ml:   fight.sportsbook.f1_ml,
    });
  });

  return movements;
}
