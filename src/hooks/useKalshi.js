import { useState, useEffect, useCallback } from 'react';
import { normalizeKalshiMarket, normalizePriceHistory } from '../utils/normalizeOdds';

/**
 * useKalshi — fetches active UFC prediction markets from the Kalshi REST API.
 *
 * Requires VITE_KALSHI_API_KEY in the environment. If the key is absent, the hook
 * degrades silently (data = null). Current prices are cached in sessionStorage.
 *
 * Price history is lazy-loaded per market via `fetchHistory(ticker)`.
 *
 * API base: https://trading-api.kalshi.com/trade-api/v2
 * Auth: Authorization header with "Token {apiKey}" on all requests.
 *
 * @returns {{
 *   data: NormalizedFight[]|null,
 *   loading: boolean,
 *   error: string|null,
 *   fetchHistory: (ticker: string) => Promise<PricePoint[]>,
 *   refetch: function,
 * }}
 */

const KALSHI_BASE   = 'https://trading-api.kalshi.com/trade-api/v2';
const CACHE_KEY     = 'cache_kalshi_v1';
const CACHE_TTL     = 10 * 60 * 1000; // 10 minutes
const CLV_LOG_KEY   = 'clv_log';
const CLV_MAX_ENTRIES = 500;
// Kalshi series tickers that cover UFC events. Expand as new series are released.
const UFC_SERIES    = ['KXUFC', 'KXMMA'];

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

function makeHeaders(apiKey) {
  return { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' };
}

function appendCLVEntries(fights, apiKey) {
  // Only snapshot when the key is real — avoid polluting CLV log with empty data.
  if (!apiKey) return;
  try {
    const raw = localStorage.getItem(CLV_LOG_KEY);
    const log = raw ? JSON.parse(raw) : [];
    const ts  = Date.now();
    for (const f of fights) {
      if (!f.kalshi) continue;
      log.push({
        ts,
        source:   'kalshi',
        fightKey: f.fightKey,
        fighter1: f.fighter1,
        fighter2: f.fighter2,
        f1Price:  f.kalshi.f1_price,
        f2Price:  f.kalshi.f2_price,
      });
    }
    const trimmed = log.slice(-CLV_MAX_ENTRIES);
    localStorage.setItem(CLV_LOG_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

export function useKalshi() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [rev,     setRev]     = useState(0);

  const apiKey = import.meta.env.VITE_KALSHI_API_KEY;

  useEffect(() => {
    // Degrade silently if key is absent or is the placeholder value.
    if (!apiKey || apiKey === 'your_key_here') return;

    const cached = readCache(CACHE_KEY);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    const headers = makeHeaders(apiKey);

    // Fetch markets for each UFC series ticker in parallel.
    const fetches = UFC_SERIES.map((series) =>
      fetch(`${KALSHI_BASE}/markets?series_ticker=${series}&status=open&limit=100`, { headers })
        .then((r) => {
          if (r.status === 401 || r.status === 403) throw new Error(`kalshi_auth_${r.status}`);
          if (!r.ok) throw new Error(`kalshi_http_${r.status}`);
          return r.json();
        })
        .then((raw) => {
          // Kalshi returns { markets: [...] } or { cursor, markets: [...] }
          return Array.isArray(raw.markets) ? raw.markets : [];
        })
        .catch(() => []) // individual series failures do not abort other fetches
    );

    Promise.all(fetches)
      .then((arrays) => {
        const allMarkets = arrays.flat();
        const normalized = allMarkets
          .map(normalizeKalshiMarket)
          .filter(Boolean);

        writeCache(CACHE_KEY, normalized);
        setData(normalized);
        appendCLVEntries(normalized, apiKey);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [apiKey, rev]);

  /**
   * fetchHistory — lazy-load price history for a specific Kalshi market ticker.
   * Returns PricePoint[] sorted ascending by timestamp.
   * Resolves to [] on error.
   *
   * @param {string} ticker
   * @returns {Promise<PricePoint[]>}
   */
  const fetchHistory = useCallback(async (ticker) => {
    if (!ticker || !apiKey || apiKey === 'your_key_here') return [];
    const cacheKey = `cache_kalshi_hist_${ticker}`;
    const cached = readCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${KALSHI_BASE}/markets/${ticker}/history?limit=1000`;
      const r = await fetch(url, { headers: makeHeaders(apiKey) });
      if (!r.ok) return [];
      const raw = await r.json();
      // Kalshi history returns { history: [{ts, yes_price}] } or [{ts, yes_price}]
      const points = Array.isArray(raw.history)
        ? raw.history.map(({ ts, yes_price }) => ({ t: ts, p: yes_price }))
        : [];
      const normalized = normalizePriceHistory(points);
      writeCache(cacheKey, normalized);
      return normalized;
    } catch {
      return [];
    }
  }, [apiKey]);

  const refetch = () => {
    try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
    setRev((v) => v + 1);
  };

  return { data, loading, error, fetchHistory, refetch };
}
