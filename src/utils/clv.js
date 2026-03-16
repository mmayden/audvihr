/**
 * clv.js — Closing Line Value (CLV) log utilities.
 *
 * Prediction-market prices are snapshotted to localStorage every time fresh
 * data is fetched from Polymarket or Kalshi. The log lets the user compare
 * their entry prices against market prices at any point in time.
 *
 * Log schema (one entry per fight per source per fetch):
 * {
 *   ts:       number,   // Date.now() when the snapshot was taken
 *   source:   string,   // 'polymarket' | 'kalshi'
 *   fightKey: string,   // normalizeOdds.fightKey() value
 *   fighter1: string,
 *   fighter2: string,
 *   f1Price:  number,   // decimal probability 0–1 for fighter1
 *   f2Price:  number,
 * }
 */

export const CLV_LOG_KEY     = 'clv_log';
export const CLV_MAX_ENTRIES = 500;
export const CLV_OPENING_KEY = 'opening_lines';

/**
 * Append CLV snapshots for a batch of NormalizedFight objects.
 * Reads and writes the full log each call — the log is small (≤ 500 entries).
 *
 * @param {NormalizedFight[]} fights  - fights with live price data
 * @param {'polymarket'|'kalshi'} source - which price field to read
 */
export function appendCLVEntries(fights, source) {
  if (!Array.isArray(fights) || fights.length === 0) return;
  try {
    const raw = localStorage.getItem(CLV_LOG_KEY);
    const log = raw ? JSON.parse(raw) : [];
    const ts  = Date.now();
    for (const f of fights) {
      const priceObj = f[source];
      if (!priceObj || typeof priceObj.f1_price !== 'number') continue;
      log.push({
        ts,
        source,
        fightKey: f.fightKey,
        fighter1: f.fighter1,
        fighter2: f.fighter2,
        f1Price:  priceObj.f1_price,
        f2Price:  priceObj.f2_price,
      });
    }
    localStorage.setItem(CLV_LOG_KEY, JSON.stringify(log.slice(-CLV_MAX_ENTRIES)));
  } catch { /* quota exceeded or unparseable — ignore */ }
}

/**
 * Write an opening-line snapshot for a fight only if none exists yet.
 * Opening lines are stored separately from the rolling CLV log so they are
 * never evicted by the 500-entry cap.
 *
 * @param {string} fightKeyStr - fightKey() value for this fight
 * @param {string} f1ml        - F1 American moneyline string e.g. '-130'
 * @param {string} f2ml        - F2 American moneyline string
 * @param {number} [ts]        - timestamp; defaults to Date.now()
 */
export function appendOpeningLine(fightKeyStr, f1ml, f2ml, ts) {
  if (!fightKeyStr || !f1ml || !f2ml) return;
  try {
    const raw = localStorage.getItem(CLV_OPENING_KEY);
    const lines = raw ? JSON.parse(raw) : {};
    if (lines[fightKeyStr]) return; // already stored — never overwrite the true opening line
    lines[fightKeyStr] = { f1ml, f2ml, ts: ts ?? Date.now() };
    localStorage.setItem(CLV_OPENING_KEY, JSON.stringify(lines));
  } catch { /* quota exceeded or unparseable — ignore */ }
}

/**
 * Read all stored opening lines from localStorage.
 * Returns {} if the key is missing or the value is unparseable.
 *
 * @returns {{ [fightKey]: { f1ml: string, f2ml: string, ts: number } }}
 */
export function readOpeningLines() {
  try {
    const raw = localStorage.getItem(CLV_OPENING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Read the full CLV log from localStorage.
 * Returns [] if the key is missing or the value is unparseable.
 *
 * @returns {CLVEntry[]}
 */
export function readCLVLog() {
  try {
    const raw = localStorage.getItem(CLV_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
