import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNews } from './useNews';
import { NEWS } from '../data/news';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid RSS XML string with the given item titles. */
function buildRss(titles) {
  const items = titles
    .map(t => `<item><title>${t}</title><pubDate>Mon, 16 Mar 2026 10:00:00 GMT</pubDate><description>Details.</description></item>`)
    .join('\n');
  return `<?xml version="1.0"?><rss version="2.0"><channel>${items}</channel></rss>`;
}

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Initial / loading state
// ---------------------------------------------------------------------------

describe('useNews — initial state', () => {
  it('returns NEWS mock immediately (items never null on first render)', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: () => Promise.resolve(buildRss(['Test item'])) });
    const { result } = renderHook(() => useNews());
    // Before async completes, falls back to NEWS
    expect(result.current.items).toEqual(NEWS);
  });

  it('sets loading true while fetch is in-flight', async () => {
    // Never-resolving fetch to hold loading state
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useNews());
    // loading becomes true after useEffect fires
    await waitFor(() => expect(result.current.loading).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// Live fetch success
// ---------------------------------------------------------------------------

describe('useNews — live fetch success', () => {
  it('returns live items and sets isLive = true when both sources succeed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(buildRss(['Makhachev title defense confirmed'])),
    });
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isLive).toBe(true);
    expect(result.current.items.every(i => i.isLive === true)).toBe(true);
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it('sets loading = false after fetch completes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(buildRss(['News item'])),
    });
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('items are sorted newest-first', async () => {
    const rss1 = `<?xml version="1.0"?><rss><channel>
      <item><title>Item A</title><pubDate>Mon, 16 Mar 2026 10:00:00 GMT</pubDate><description>A</description></item>
      <item><title>Item B</title><pubDate>Sat, 14 Mar 2026 10:00:00 GMT</pubDate><description>B</description></item>
    </channel></rss>`;
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(rss1) })
                                  .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(buildRss([])) });
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const dates = result.current.items.map(i => i.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('merges items from both sources', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(buildRss(['Source A headline'])) })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(buildRss(['Source B headline'])) });
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Silent degradation
// ---------------------------------------------------------------------------

describe('useNews — silent degradation', () => {
  it('falls back to NEWS mock when all sources throw (e.g. CORS)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isLive).toBe(false);
    expect(result.current.items).toEqual(NEWS);
  });

  it('falls back to NEWS mock when all sources return non-ok responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve('') });
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isLive).toBe(false);
    expect(result.current.items).toEqual(NEWS);
  });

  it('uses items from surviving source when only one source fails', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('CORS'))
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(buildRss(['Surviving source item'])) });
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isLive).toBe(true);
    expect(result.current.items.some(i => i.isLive)).toBe(true);
  });

  it('falls back when sources return empty RSS (no items)', async () => {
    const emptyRss = `<?xml version="1.0"?><rss><channel></channel></rss>`;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: () => Promise.resolve(emptyRss) });
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isLive).toBe(false);
    expect(result.current.items).toEqual(NEWS);
  });
});

// ---------------------------------------------------------------------------
// Cache behaviour
// ---------------------------------------------------------------------------

describe('useNews — cache', () => {
  it('returns cached live items without fetching when valid cache exists', async () => {
    const cachedItems = [{ id: 'live-mma-fighting-0', headline: 'Cached item', isLive: true, date: '2026-03-16', category: 'fight', relevance: 'medium', body: '', source: 'MMA Fighting', fighter_id: null, fighter_name: null }];
    sessionStorage.setItem('cache_news_v1', JSON.stringify({ data: { items: cachedItems, isLive: true }, ts: Date.now() }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.items).toEqual(cachedItems));
    expect(result.current.isLive).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns cached mock items without fetching when fallback was cached', async () => {
    sessionStorage.setItem('cache_news_v1', JSON.stringify({ data: { items: NEWS, isLive: false }, ts: Date.now() }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.isLive).toBe(false));
    expect(result.current.items).toEqual(NEWS);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches again after cache expires (ts in the past)', async () => {
    const expiredTs = Date.now() - 31 * 60 * 1000; // 31 minutes ago
    sessionStorage.setItem('cache_news_v1', JSON.stringify({ data: { items: NEWS, isLive: false }, ts: expiredTs }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('CORS'));
    const { result } = renderHook(() => useNews());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchSpy).toHaveBeenCalled();
  });
});
