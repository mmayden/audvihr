import { useState, useEffect, useCallback } from 'react';
import { normalizeKalshiMarket, normalizePriceHistory } from '../utils/normalizeOdds';
import { readCache, writeCache, evictCache } from '../utils/cache';
import { appendCLVEntries } from '../utils/clv';

/**
 * useKalshi — fetches active UFC prediction markets from the Kalshi REST API.
 *
 * Requires VITE_KALSHI_API_KEY in the environment. If the key is absent, the hook
 * degrades silently (data = null). Current prices are cached in sessionStorage.
 *
 * NOTE: The Kalshi API key is sent in an Authorization header from the browser.
 * This is an accepted constraint for a personal, self-hosted tool — the key is only
 * available to the person who deploys the app with their own .env. See PLANNING.md
 * security section for details.
 *
 * Price history is lazy-loaded per market via `fetchHistory(ticker)`.
 *
 * API base: https://trading-api.kalshi.com/trade-api/v2
 *
 * @returns {{
 *   data: NormalizedFight[]|null,
 *   loading: boolean,
 *   error: string|null,
 *   fetchHistory: (ticker: string) => Promise<PricePoint[]>,
 *   refetch: function,
 * }}
 */

const KALSHI_BASE = 'https://trading-api.kalshi.com/trade-api/v2';
const CACHE_KEY   = 'cache_kalshi_v1';
const CACHE_TTL   = 10 * 60 * 1000; // 10 minutes
// Kalshi series tickers that cover UFC events. Expand as new series are released.
const UFC_SERIES  = ['KXUFC', 'KXMMA'];

function makeHeaders(apiKey) {
  return { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' };
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

    const cached = readCache(CACHE_KEY, CACHE_TTL);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    const headers = makeHeaders(apiKey);

    // Fetch markets for each UFC series ticker in parallel.
    // Per-series failures degrade silently — other series still resolve.
    const fetches = UFC_SERIES.map((series) =>
      fetch(`${KALSHI_BASE}/markets?series_ticker=${series}&status=open&limit=100`, { headers })
        .then((r) => {
          if (r.status === 401 || r.status === 403) throw new Error(`kalshi_auth_${r.status}`);
          if (!r.ok) throw new Error(`kalshi_http_${r.status}`);
          return r.json();
        })
        .then((raw) => (Array.isArray(raw.markets) ? raw.markets : []))
        .catch(() => []) // individual series failures do not abort other fetches
    );

    Promise.all(fetches)
      .then((arrays) => {
        const allMarkets = arrays.flat();
        const normalized = allMarkets.map(normalizeKalshiMarket).filter(Boolean);
        writeCache(CACHE_KEY, normalized);
        setData(normalized);
        appendCLVEntries(normalized, 'kalshi');
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [apiKey, rev]);

  /**
   * fetchHistory — lazy-load price history for a specific Kalshi market ticker.
   * Returns PricePoint[] sorted ascending by timestamp.
   * Resolves to [] on error (never rejects).
   *
   * @param {string} ticker
   * @returns {Promise<PricePoint[]>}
   */
  const fetchHistory = useCallback(async (ticker) => {
    if (!ticker || !apiKey || apiKey === 'your_key_here') return [];

    const cacheKey = `cache_kalshi_hist_${ticker}`;
    const cached   = readCache(cacheKey, CACHE_TTL);
    if (cached) return cached;

    try {
      const url = `${KALSHI_BASE}/markets/${ticker}/history?limit=1000`;
      const r   = await fetch(url, { headers: makeHeaders(apiKey) });
      if (!r.ok) return [];
      const raw    = await r.json();
      // Kalshi history: { history: [{ts, yes_price}] } or [{ts, yes_price}]
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
    evictCache(CACHE_KEY);
    setRev((v) => v + 1);
  };

  return { data, loading, error, fetchHistory, refetch };
}
