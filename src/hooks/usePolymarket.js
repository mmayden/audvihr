import { useState, useEffect, useCallback } from 'react';
import { normalizePolymarketMarket, normalizePriceHistory } from '../utils/normalizeOdds';

/**
 * usePolymarket — fetches active UFC prediction markets from the Polymarket CLOB API.
 *
 * No authentication required for reads. Current prices are cached in sessionStorage.
 * On every successful fresh fetch, one CLV snapshot per market is appended to
 * localStorage under the key `clv_log`.
 *
 * Price history is lazy-loaded per market via `fetchHistory(conditionId, tokenId)`.
 *
 * API base: https://clob.polymarket.com
 *
 * @returns {{
 *   data: NormalizedFight[]|null,
 *   loading: boolean,
 *   error: string|null,
 *   fetchHistory: (conditionId: string, tokenId: string) => Promise<PricePoint[]>,
 *   refetch: function,
 * }}
 */

const CLOB_BASE      = 'https://clob.polymarket.com';
const CACHE_KEY      = 'cache_polymarket_v1';
const CACHE_TTL      = 10 * 60 * 1000; // 10 minutes
const CLV_LOG_KEY    = 'clv_log';
const CLV_MAX_ENTRIES = 500;
const UFC_KEYWORDS   = ['ufc', 'mma', 'fighting championship'];

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (!ts || Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota */ }
}

function isUFCMarket(market) {
  const q = String(market.question || market.title || '').toLowerCase();
  return UFC_KEYWORDS.some((kw) => q.includes(kw));
}

function appendCLVEntries(fights) {
  try {
    const raw = localStorage.getItem(CLV_LOG_KEY);
    const log = raw ? JSON.parse(raw) : [];
    const ts  = Date.now();
    for (const f of fights) {
      if (!f.polymarket) continue;
      log.push({
        ts,
        source:    'polymarket',
        fightKey:  f.fightKey,
        fighter1:  f.fighter1,
        fighter2:  f.fighter2,
        f1Price:   f.polymarket.f1_price,
        f2Price:   f.polymarket.f2_price,
      });
    }
    // Cap log to prevent unbounded growth.
    const trimmed = log.slice(-CLV_MAX_ENTRIES);
    localStorage.setItem(CLV_LOG_KEY, JSON.stringify(trimmed));
  } catch { /* quota or parse error — ignore */ }
}

export function usePolymarket() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [rev,     setRev]     = useState(0);

  useEffect(() => {
    const cached = readCache(CACHE_KEY);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch active binary markets. We query with active=true and limit=100.
    // A single page is sufficient for UFC events (few active at any time).
    fetch(`${CLOB_BASE}/markets?active=true&closed=false&limit=100`)
      .then((r) => {
        if (!r.ok) throw new Error(`poly_http_${r.status}`);
        return r.json();
      })
      .then((raw) => {
        const items = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        const ufcItems = items.filter(isUFCMarket);
        const normalized = ufcItems
          .map(normalizePolymarketMarket)
          .filter(Boolean);

        writeCache(CACHE_KEY, normalized);
        setData(normalized);
        // Persist CLV snapshots for all fetched markets.
        appendCLVEntries(normalized);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [rev]);

  /**
   * fetchHistory — lazy-load price history for a specific Polymarket token.
   * Returns an array of PricePoint objects sorted ascending by timestamp.
   * Resolves to [] on error (never rejects).
   *
   * @param {string} conditionId
   * @param {string} tokenId
   * @returns {Promise<PricePoint[]>}
   */
  const fetchHistory = useCallback(async (conditionId, tokenId) => {
    if (!conditionId || !tokenId) return [];
    const cacheKey = `cache_poly_hist_${tokenId}`;
    const cached = readCache(cacheKey);
    if (cached) return cached;

    try {
      // fidelity=60 gives hourly granularity over the last ~72h.
      const url = `${CLOB_BASE}/prices-history?market=${conditionId}&token_id=${tokenId}&fidelity=60`;
      const r = await fetch(url);
      if (!r.ok) return [];
      const raw = await r.json();
      // Polymarket returns { history: [{t, p}] } or just [{t, p}].
      const points = Array.isArray(raw) ? raw : (Array.isArray(raw.history) ? raw.history : []);
      const normalized = normalizePriceHistory(points);
      writeCache(cacheKey, normalized);
      return normalized;
    } catch {
      return [];
    }
  }, []);

  const refetch = () => {
    try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
    setRev((v) => v + 1);
  };

  return { data, loading, error, fetchHistory, refetch };
}
