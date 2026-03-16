import { useState, useEffect } from 'react';
import { NEWS } from '../data/news';
import { FIGHTERS } from '../data/fighters';
import { parseRssFeed, rssItemToNewsItem } from '../utils/newsParser';
import { readCache, writeCache } from '../utils/cache';

/**
 * useNews — fetches live MMA news from RSS feeds and normalises items to the
 * app's NewsItem schema. Merges results from all configured sources, sorted
 * newest-first. Caches in sessionStorage for CACHE_TTL_MS to avoid hammering
 * the feeds on every navigation.
 *
 * Degrades silently per source: a source that is unreachable (CORS, network
 * error, non-200) contributes zero items; the remaining sources are still used.
 * If all sources fail (common in production due to CORS restrictions), the hook
 * falls back to the static NEWS mock and sets isLive = false.
 *
 * Note: MMA news sites do not set CORS headers, so live fetches will succeed
 * only when a CORS proxy is in use or the app is served from a matching origin.
 * The architecture is built and ready; the CORS path is a backlog item.
 *
 * @returns {{ items: NewsItem[], loading: boolean, isLive: boolean }}
 */

const CACHE_KEY = 'cache_news_v1';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/** RSS sources. Both are CORS-restricted in pure browser context; degrade silently. */
const SOURCES = [
  { url: 'https://www.mmafighting.com/rss/current',  name: 'MMA Fighting' },
  { url: 'https://mmajunkie.usatoday.com/feed',      name: 'MMA Junkie'  },
];

export function useNews() {
  const [items,   setItems]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLive,  setIsLive]  = useState(false);

  useEffect(() => {
    const cached = readCache(CACHE_KEY, CACHE_TTL);
    if (cached) {
      setItems(cached.items);
      setIsLive(cached.isLive);
      return;
    }

    setLoading(true);

    // Fetch all sources in parallel; each source degrades independently.
    Promise.all(
      SOURCES.map(({ url, name }) =>
        fetch(url)
          .then(r => {
            if (!r.ok) throw new Error(`news_http_${r.status}`);
            return r.text();
          })
          .then(text => {
            const rawItems = parseRssFeed(text);
            return rawItems.map((raw, idx) => rssItemToNewsItem(raw, name, FIGHTERS, idx));
          })
          .catch(() => []) // per-source silent degradation
      )
    )
      .then(arrays => {
        const merged = arrays
          .flat()
          .sort((a, b) => b.date.localeCompare(a.date));

        if (merged.length > 0) {
          writeCache(CACHE_KEY, { items: merged, isLive: true });
          setItems(merged);
          setIsLive(true);
        } else {
          // All sources returned nothing — fall back to static mock.
          writeCache(CACHE_KEY, { items: NEWS, isLive: false });
          setItems(NEWS);
          setIsLive(false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Return NEWS mock until the async result arrives (items === null).
  return { items: items ?? NEWS, loading, isLive };
}
