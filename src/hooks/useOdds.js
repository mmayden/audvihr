import { useState, useEffect } from 'react';
import { normalizeOddsApiResponse } from '../utils/normalizeOdds';

/**
 * useOdds — fetches live UFC moneylines from The Odds API.
 *
 * Requires VITE_ODDS_API_KEY in the environment. If the key is absent or
 * the free-tier quota is exceeded, the hook degrades silently (data = null).
 *
 * Responses are cached in sessionStorage for CACHE_TTL_MS to stay within
 * the 500 req/month free-tier limit.
 *
 * @returns {{ data: NormalizedFight[]|null, loading: boolean, error: string|null, refetch: function }}
 */

const CACHE_KEY  = 'cache_odds_v1';
const CACHE_TTL  = 15 * 60 * 1000; // 15 minutes
const API_BASE   = 'https://api.the-odds-api.com/v4';
const SPORT_KEY  = 'mma_mixed_martial_arts';

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
  } catch { /* quota exceeded or private browsing */ }
}

export function useOdds() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [rev,     setRev]     = useState(0); // bump to trigger manual refetch

  const apiKey = import.meta.env.VITE_ODDS_API_KEY;

  useEffect(() => {
    // Degrade silently if key is absent or is the placeholder value.
    if (!apiKey || apiKey === 'your_key_here') return;

    const cached = readCache(CACHE_KEY);
    if (cached) {
      setData(cached);
      return;
    }

    const url = `${API_BASE}/sports/${SPORT_KEY}/odds` +
      `?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;

    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => {
        // 401 = bad key, 422 = quota exceeded — both are soft failures.
        if (r.status === 401 || r.status === 422) {
          throw new Error(`odds_api_${r.status}`);
        }
        if (!r.ok) throw new Error(`odds_api_http_${r.status}`);
        return r.json();
      })
      .then((raw) => {
        const normalized = normalizeOddsApiResponse(raw);
        writeCache(CACHE_KEY, normalized);
        setData(normalized);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [apiKey, rev]);

  const refetch = () => {
    try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
    setRev((v) => v + 1);
  };

  return { data, loading, error, refetch };
}
