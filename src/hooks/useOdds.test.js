import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOdds } from './useOdds';

const MOCK_EVENT = {
  id: 'e1',
  commence_time: '2026-04-12T22:00:00Z',
  home_team: 'Islam Makhachev',
  away_team: 'Dustin Poirier',
  bookmakers: [{
    key: 'draftkings',
    title: 'DraftKings',
    markets: [{
      key: 'h2h',
      outcomes: [
        { name: 'Islam Makhachev', price: -230 },
        { name: 'Dustin Poirier',  price: 185 },
      ],
    }],
  }],
};

beforeEach(() => {
  vi.stubEnv('VITE_ODDS_API_KEY', 'test_key_abc');
  sessionStorage.clear();
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('useOdds', () => {
  it('returns null data when API key is absent', () => {
    vi.stubEnv('VITE_ODDS_API_KEY', '');
    const { result } = renderHook(() => useOdds());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns null data when API key is the placeholder', () => {
    vi.stubEnv('VITE_ODDS_API_KEY', 'your_key_here');
    const { result } = renderHook(() => useOdds());
    expect(result.current.data).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches and normalizes data on mount', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [MOCK_EVENT],
    });

    const { result } = renderHook(() => useOdds());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].fightKey).toBe('makhachev_poirier');
    expect(result.current.error).toBeNull();
  });

  it('sets error and does not crash on 401 (bad key)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });

    const { result } = renderHook(() => useOdds());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toContain('401');
  });

  it('sets error and does not crash on 422 (quota exceeded)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 422 });

    const { result } = renderHook(() => useOdds());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain('422');
  });

  it('reads from sessionStorage cache and skips fetch', async () => {
    const cached = [{ fightKey: 'jones_aspinall', fighter1: 'Jon Jones', fighter2: 'Tom Aspinall' }];
    sessionStorage.setItem('cache_odds_v1', JSON.stringify({ data: cached, ts: Date.now() }));

    const { result } = renderHook(() => useOdds());

    await waitFor(() => expect(result.current.data).not.toBeNull());

    expect(result.current.data).toEqual(cached);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles malformed response without crashing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ not: 'an array' }),
    });

    const { result } = renderHook(() => useOdds());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
