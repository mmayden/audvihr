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
