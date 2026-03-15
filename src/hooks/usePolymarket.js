import { useState, useEffect, useCallback } from 'react';
import { normalizePolymarketMarket, normalizePriceHistory } from '../utils/normalizeOdds';
import { readCache, writeCache, evictCache } from '../utils/cache';
import { appendCLVEntries } from '../utils/clv';

/**
 * usePolymarket — fetches active UFC prediction markets from the Polymarket CLOB API.
 *
 * No authentication required for reads. Current prices are cached in sessionStorage.
 * On every successful fresh fetch, one CLV snapshot per market is appended to
 * localStorage (via the shared clv utility).
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

const CLOB_BASE     = 'https://clob.polymarket.com';
const CACHE_KEY     = 'cache_polymarket_v1';
const CACHE_TTL     = 10 * 60 * 1000; // 10 minutes
const UFC_KEYWORDS  = ['ufc', 'mma', 'fighting championship'];

function isUFCMarket(market) {
  const q = String(market.question || market.title || '').toLowerCase();
  return UFC_KEYWORDS.some((kw) => q.includes(kw));
}

export function usePolymarket() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [rev,     setRev]     = useState(0);

  useEffect(() => {
    const cached = readCache(CACHE_KEY, CACHE_TTL);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch active binary markets. A single page covers UFC events (few active at a time).
    fetch(`${CLOB_BASE}/markets?active=true&closed=false&limit=100`)
      .then((r) => {
        if (!r.ok) throw new Error(`poly_http_${r.status}`);
        return r.json();
      })
      .then((raw) => {
        const items      = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        const ufcItems   = items.filter(isUFCMarket);
        const normalized = ufcItems.map(normalizePolymarketMarket).filter(Boolean);

        writeCache(CACHE_KEY, normalized);
        setData(normalized);
        appendCLVEntries(normalized, 'polymarket');
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [rev]);

  /**
   * fetchHistory — lazy-load price history for a specific Polymarket token.
   * Returns PricePoint[] sorted ascending by timestamp.
   * Resolves to [] on error (never rejects).
   *
   * @param {string} conditionId
   * @param {string} tokenId
   * @returns {Promise<PricePoint[]>}
   */
  const fetchHistory = useCallback(async (conditionId, tokenId) => {
    if (!conditionId || !tokenId) return [];

    const cacheKey = `cache_poly_hist_${tokenId}`;
    const cached   = readCache(cacheKey, CACHE_TTL);
    if (cached) return cached;

    try {
      // fidelity=60 gives hourly granularity over the last ~72h.
      const url = `${CLOB_BASE}/prices-history?market=${conditionId}&token_id=${tokenId}&fidelity=60`;
      const r   = await fetch(url);
      if (!r.ok) return [];
      const raw    = await r.json();
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
    evictCache(CACHE_KEY);
    setRev((v) => v + 1);
  };

  return { data, loading, error, fetchHistory, refetch };
}
