/**
 * cache.js — sessionStorage cache helpers for live API responses.
 *
 * All reads/writes are wrapped in try/catch — private browsing and
 * storage-quota failures are silently ignored; the caller falls through
 * to a live fetch.
 */

/**
 * Read a cached value from sessionStorage.
 * Returns null if the key is absent, the JSON is unparseable, or the
 * entry is older than `ttlMs` milliseconds.
 *
 * @param {string} key
 * @param {number} [ttlMs=600000] - cache lifetime in ms (default 10 min)
 * @returns {*} cached data, or null on cache miss / expiry
 */
export function readCache(key, ttlMs = 10 * 60 * 1000) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (!ts || Date.now() - ts > ttlMs) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Write a value to sessionStorage with a timestamp.
 * Silently drops on quota exceeded or private browsing.
 *
 * @param {string} key
 * @param {*} data - must be JSON-serialisable
 */
export function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded or private browsing */ }
}

/**
 * Evict a single entry from sessionStorage.
 *
 * @param {string} key
 */
export function evictCache(key) {
  try {
    sessionStorage.removeItem(key);
  } catch { /* ignore */ }
}
