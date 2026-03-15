import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePolymarket } from './usePolymarket';

const MOCK_MARKET = {
  condition_id: '0xabc',
  question: 'Islam Makhachev vs Dustin Poirier — UFC 315: who wins?',
  active: true,
  closed: false,
  tokens: [
    { token_id: '0xtok1', outcome: 'Yes', price: 0.70 },
    { token_id: '0xtok2', outcome: 'No',  price: 0.30 },
  ],
};

beforeEach(() => {
  sessionStorage.clear();
  localStorage.removeItem('clv_log');
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePolymarket', () => {
  it('fetches and normalizes active UFC markets', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [MOCK_MARKET] }),
    });

    const { result } = renderHook(() => usePolymarket());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].fightKey).toBe('makhachev_poirier');
    expect(result.current.data[0].polymarket.f1_price).toBe(0.70);
    expect(result.current.error).toBeNull();
  });

  it('filters out non-UFC markets', async () => {
    const nflMarket = {
      condition_id: '0xnfl',
      question: 'Will the Chiefs win the Super Bowl?',
      active: true,
      tokens: [
        { token_id: '0x1', outcome: 'Yes', price: 0.40 },
        { token_id: '0x2', outcome: 'No',  price: 0.60 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [MOCK_MARKET, nflMarket] }),
    });

    const { result } = renderHook(() => usePolymarket());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Only the UFC market should survive
    expect(result.current.data).toHaveLength(1);
  });

  it('sets error and does not crash on HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });

    const { result } = renderHook(() => usePolymarket());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toContain('503');
  });

  it('reads from sessionStorage cache and skips fetch', async () => {
    const cached = [{ fightKey: 'jones_aspinall', polymarket: { f1_price: 0.6, f2_price: 0.4 } }];
    sessionStorage.setItem('cache_polymarket_v1', JSON.stringify({ data: cached, ts: Date.now() }));

    const { result } = renderHook(() => usePolymarket());
    await waitFor(() => expect(result.current.data).not.toBeNull());

    expect(result.current.data).toEqual(cached);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles network failure without crashing', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => usePolymarket());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('handles empty response without crashing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });

    const { result } = renderHook(() => usePolymarket());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });

  it('appends CLV snapshots to localStorage on fresh fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [MOCK_MARKET] }),
    });

    const { result } = renderHook(() => usePolymarket());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const log = JSON.parse(localStorage.getItem('clv_log') || '[]');
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].source).toBe('polymarket');
    expect(log[0].fightKey).toBe('makhachev_poirier');
  });
});
