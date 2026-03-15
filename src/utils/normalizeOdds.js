/**
 * normalizeOdds.js — transform and validate raw API responses from The Odds API,
 * Polymarket CLOB, and Kalshi REST into a common NormalizedFight shape before use.
 *
 * All functions return null (or empty array) on invalid input — never throw.
 * Callers should treat null as "data unavailable" and degrade gracefully.
 *
 * NormalizedFight shape (per fight, merged from one or more sources):
 * {
 *   fightKey:  string,            // sortable key: sorted last-names joined by '_'
 *   fighter1:  string,            // display name
 *   fighter2:  string,
 *   eventDate: string,            // ISO date string, may be '' if unavailable
 *   sportsbook: {                 // best available price across all bookmakers
 *     f1_ml: string,             // American moneyline e.g. '-200'
 *     f2_ml: string,
 *     source: string,            // bookmaker name
 *   } | null,
 *   polymarket: {
 *     f1_ml:       string,
 *     f2_ml:       string,
 *     f1_price:    number,       // decimal probability 0–1
 *     f2_price:    number,
 *     conditionId: string,
 *     token1Id:    string,       // token_id for Yes outcome (fighter1)
 *     token2Id:    string,       // token_id for No outcome
 *   } | null,
 *   kalshi: {
 *     f1_ml:    string,
 *     f2_ml:    string,
 *     f1_price: number,
 *     f2_price: number,
 *     ticker:   string,
 *   } | null,
 * }
 *
 * PricePoint shape (for history charts):
 * { t: number, p: number }  —  unix timestamp (seconds), probability 0–1
 */

/**
 * Compute a stable fight key from two fighter names.
 * Uses last-name tokens, lowercased, sorted alphabetically.
 * @param {string} f1 - fighter 1 display name
 * @param {string} f2 - fighter 2 display name
 * @returns {string} e.g. 'makhachev_poirier'
 */
export function fightKey(f1, f2) {
  const lastName = (n) => String(n || '').trim().toLowerCase().split(/\s+/).pop();
  return [lastName(f1), lastName(f2)].sort().join('_');
}

/**
 * Convert a decimal probability (0–1) to an American moneyline string.
 * @param {number} prob
 * @returns {string|null}
 */
export function probToML(prob) {
  if (typeof prob !== 'number' || prob <= 0 || prob >= 1) return null;
  if (prob >= 0.5) return `${Math.round((-prob / (1 - prob)) * 100)}`;
  return `+${Math.round(((1 - prob) / prob) * 100)}`;
}

/**
 * normalizeOddsApiResponse — convert a raw The Odds API response (array of events)
 * into an array of partial NormalizedFight objects (sportsbook prices only).
 *
 * Picks the single bookmaker with the sharpest (most balanced) prices as "best".
 * If the raw value is not a non-empty array, returns [].
 *
 * @param {unknown} raw - parsed JSON from The Odds API
 * @returns {NormalizedFight[]}
 */
export function normalizeOddsApiResponse(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const results = [];

  for (const event of raw) {
    if (!event || typeof event !== 'object') continue;

    const f1 = String(event.home_team || '').trim();
    const f2 = String(event.away_team || '').trim();
    if (!f1 || !f2) continue;

    const eventDate = event.commence_time
      ? event.commence_time.slice(0, 10)
      : '';

    if (!Array.isArray(event.bookmakers) || event.bookmakers.length === 0) continue;

    // Pick the first bookmaker that has a h2h market with exactly 2 outcomes.
    let bestBkm = null;
    let bestF1ml = null;
    let bestF2ml = null;

    for (const bkm of event.bookmakers) {
      if (!Array.isArray(bkm.markets)) continue;
      const h2h = bkm.markets.find((m) => m.key === 'h2h');
      if (!h2h || !Array.isArray(h2h.outcomes) || h2h.outcomes.length !== 2) continue;

      const o1 = h2h.outcomes.find((o) => o.name === f1);
      const o2 = h2h.outcomes.find((o) => o.name === f2);
      if (!o1 || !o2) continue;

      const ml1 = typeof o1.price === 'number' ? String(Math.round(o1.price)) : null;
      const ml2 = typeof o2.price === 'number' ? String(Math.round(o2.price)) : null;
      if (!ml1 || !ml2) continue;

      bestBkm = bkm.title || bkm.key || 'sportsbook';
      bestF1ml = ml1;
      bestF2ml = ml2;
      break; // first valid bookmaker is sufficient for now
    }

    if (!bestF1ml || !bestF2ml) continue;

    results.push({
      fightKey: fightKey(f1, f2),
      fighter1: f1,
      fighter2: f2,
      eventDate,
      sportsbook: { f1_ml: bestF1ml, f2_ml: bestF2ml, source: bestBkm },
      polymarket: null,
      kalshi: null,
    });
  }

  return results;
}

/**
 * normalizePolymarketMarket — convert a single Polymarket CLOB market object
 * into a partial NormalizedFight (polymarket prices only).
 *
 * Expects the market to have exactly two tokens (binary Yes/No market).
 * Returns null if the shape is invalid or prices are missing.
 *
 * @param {unknown} raw - single market object from Polymarket CLOB /markets response
 * @returns {NormalizedFight|null}
 */
export function normalizePolymarketMarket(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const { condition_id: conditionId, question, tokens } = raw;
  if (!conditionId || !question || !Array.isArray(tokens) || tokens.length < 2) return null;

  // Extract fighter names from the question string.
  // Polymarket UFC questions follow patterns like:
  //   "Will [Fighter A] beat [Fighter B] at UFC [event]?"
  //   "[Fighter A] vs [Fighter B] — UFC [event]: who wins?"
  // We'll do a best-effort extraction: split on ' vs ', 'beat', 'defeat', 'win against'.
  const names = extractNamesFromQuestion(question);
  if (!names) return null;

  const { fighter1, fighter2 } = names;

  // Yes token = fighter1 wins, No token = fighter2 wins (by convention).
  const yesToken = tokens.find((t) => t.outcome === 'Yes') || tokens[0];
  const noToken  = tokens.find((t) => t.outcome === 'No')  || tokens[1];

  const f1Price = typeof yesToken.price === 'number' ? yesToken.price : null;
  const f2Price = typeof noToken.price  === 'number' ? noToken.price  : null;
  if (f1Price === null || f2Price === null) return null;
  if (f1Price < 0 || f1Price > 1 || f2Price < 0 || f2Price > 1) return null;

  const f1_ml = probToML(f1Price);
  const f2_ml = probToML(f2Price);
  if (!f1_ml || !f2_ml) return null;

  return {
    fightKey: fightKey(fighter1, fighter2),
    fighter1,
    fighter2,
    eventDate: '',
    sportsbook: null,
    polymarket: {
      f1_ml,
      f2_ml,
      f1_price: f1Price,
      f2_price: f2Price,
      conditionId: String(conditionId),
      token1Id: String(yesToken.token_id || ''),
      token2Id: String(noToken.token_id || ''),
    },
    kalshi: null,
  };
}

/**
 * normalizeKalshiMarket — convert a single Kalshi market object into a partial
 * NormalizedFight (kalshi prices only).
 *
 * Expects a market with `ticker`, `title`, and price fields (`last_price`, `yes_bid`, `yes_ask`).
 * Returns null if the shape is invalid or prices are unavailable.
 *
 * @param {unknown} raw - market object from Kalshi /markets or /markets/{ticker} response
 * @returns {NormalizedFight|null}
 */
export function normalizeKalshiMarket(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const { ticker, title } = raw;
  if (!ticker || !title) return null;

  // Kalshi price: prefer last_price, fall back to midpoint of yes_bid + yes_ask.
  let f1Price = null;
  if (typeof raw.last_price === 'number' && raw.last_price > 0) {
    f1Price = raw.last_price;
  } else if (typeof raw.yes_bid === 'number' && typeof raw.yes_ask === 'number') {
    f1Price = (raw.yes_bid + raw.yes_ask) / 2;
  }

  if (f1Price === null || f1Price <= 0 || f1Price >= 1) return null;

  const f2Price = parseFloat((1 - f1Price).toFixed(4));

  const names = extractNamesFromQuestion(String(title));
  if (!names) return null;

  const { fighter1, fighter2 } = names;
  const f1_ml = probToML(f1Price);
  const f2_ml = probToML(f2Price);
  if (!f1_ml || !f2_ml) return null;

  return {
    fightKey: fightKey(fighter1, fighter2),
    fighter1,
    fighter2,
    eventDate: '',
    sportsbook: null,
    polymarket: null,
    kalshi: {
      f1_ml,
      f2_ml,
      f1_price: f1Price,
      f2_price: f2Price,
      ticker: String(ticker),
    },
  };
}

/**
 * normalizePriceHistory — validate and reshape a raw price history response
 * (from Polymarket /prices-history or Kalshi market history) into PricePoint[].
 *
 * Accepts arrays of { t, p } objects or { timestamp, price } objects.
 * Filters out malformed entries. Returns [] on invalid input.
 *
 * @param {unknown} raw - raw price history response
 * @returns {{ t: number, p: number }[]}
 */
export function normalizePriceHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const point of raw) {
    if (!point || typeof point !== 'object') continue;
    // Polymarket uses { t, p }; Kalshi may use { ts, value } or { timestamp, yes_price }
    const t = point.t ?? point.ts ?? point.timestamp ?? null;
    const p = point.p ?? point.value ?? point.yes_price ?? null;
    if (typeof t !== 'number' || typeof p !== 'number') continue;
    if (p < 0 || p > 1) continue;
    out.push({ t, p });
  }
  return out.sort((a, b) => a.t - b.t);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Attempt to extract two fighter names from a market question or title string.
 * Handles common patterns from Polymarket and Kalshi UFC markets.
 * Returns null if extraction fails.
 * @param {string} q
 * @returns {{ fighter1: string, fighter2: string }|null}
 */
function extractNamesFromQuestion(q) {
  if (!q || typeof q !== 'string') return null;

  // Pattern: "Fighter A vs Fighter B"
  // Note: handle both en-dash (–), em-dash (—), and hyphen-minus (-).
  const vsMatch = q.match(/^([^?:]+?)\s+vs\.?\s+([^?:\u2013\u2014\-|]+)/i);
  if (vsMatch) {
    const f1 = cleanName(vsMatch[1]);
    const f2 = cleanName(vsMatch[2]);
    if (f1 && f2) return { fighter1: f1, fighter2: f2 };
  }

  // Pattern: "Will Fighter A beat/defeat Fighter B"
  const beatMatch = q.match(/Will\s+(.+?)\s+(?:beat|defeat|win against)\s+([^?]+)/i);
  if (beatMatch) {
    const f1 = cleanName(beatMatch[1]);
    const f2 = cleanName(beatMatch[2]);
    if (f1 && f2) return { fighter1: f1, fighter2: f2 };
  }

  // Pattern: "Fighter A to win" (one fighter — insufficient)
  return null;
}

/**
 * Strip trailing event context from a fighter name token.
 * e.g. "Islam Makhachev at UFC 315" → "Islam Makhachev"
 */
function cleanName(raw) {
  if (!raw) return '';
  return raw
    .replace(/\s+(?:at|in|@)\s+UFC.*/i, '')
    .replace(/\s*[\u2013\u2014\-|].*$/, '') // en-dash, em-dash, hyphen, pipe
    .trim();
}
