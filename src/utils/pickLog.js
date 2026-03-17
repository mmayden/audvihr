/**
 * pickLog — pre-fight pick log helpers.
 *
 * Stores a capped array of pick records in localStorage.
 * Key ownership: ONLY this module reads or writes 'pick_log'.
 *
 * Pick record shape:
 * {
 *   fightKey:   string,  // e.g. 'islam-makhachev_arman-tsarukyan'
 *   fighter:    string,  // name of picked fighter (plain text)
 *   method:     string,  // 'KO/TKO' | 'Submission' | 'Decision' | 'Any'
 *   confidence: number,  // 1–5 integer
 *   outcome:    string,  // '' (pending) | 'W' | 'L'
 *   notes:      string,  // free text (plain text only, never rendered via innerHTML)
 *   ts:         string,  // ISO timestamp of when pick was logged
 * }
 *
 * All string values are stored and retrieved as plain text.
 * No HTML, no eval, no markup in stored data.
 */

export const PICK_LOG_KEY = 'pick_log';
const MAX_ENTRIES = 200;

/**
 * Read the full pick log from localStorage.
 * @returns {object[]} array of pick records, or [] on error / empty
 */
export function readPickLog() {
  try {
    const raw = localStorage.getItem(PICK_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Append a new pick to the log, capping at MAX_ENTRIES.
 * Older entries are evicted from the front when the cap is reached.
 *
 * @param {{ fightKey: string, fighter: string, method: string, confidence: number, outcome: string, notes: string, ts: string }} pick
 */
export function appendPick({ fightKey, fighter, method, confidence, outcome = '', notes = '', ts }) {
  const log = readPickLog();
  const entry = {
    fightKey:   String(fightKey   ?? ''),
    fighter:    String(fighter    ?? ''),
    method:     String(method     ?? ''),
    confidence: Number.isFinite(confidence) ? confidence : 3,
    outcome:    String(outcome    ?? ''),
    notes:      String(notes      ?? ''),
    ts:         String(ts         ?? new Date().toISOString()),
  };
  const updated = [...log, entry];
  if (updated.length > MAX_ENTRIES) updated.splice(0, updated.length - MAX_ENTRIES);
  try {
    localStorage.setItem(PICK_LOG_KEY, JSON.stringify(updated));
  } catch {
    // Quota exceeded — silently degrade
  }
}

/**
 * Update the outcome field on an existing pick by fightKey.
 * If multiple entries share the same fightKey, updates the most recent.
 *
 * @param {string} fightKey
 * @param {'W'|'L'|''} outcome
 */
export function updatePickOutcome(fightKey, outcome) {
  const log = readPickLog();
  // Find last entry with this fightKey
  const idx = [...log].map((e, i) => ({ e, i })).reverse().find(({ e }) => e.fightKey === fightKey)?.i;
  if (idx === null || idx === undefined) return;
  const updated = log.map((entry, i) =>
    i === idx ? { ...entry, outcome: String(outcome ?? '') } : entry
  );
  try {
    localStorage.setItem(PICK_LOG_KEY, JSON.stringify(updated));
  } catch {
    // Quota exceeded — silently degrade
  }
}
