import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from './useWatchlist';

describe('useWatchlist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty watchlist', () => {
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.isWatched('ufc315-main')).toBe(false);
  });

  it('adds a market to the watchlist on first toggle', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.toggle('ufc315-main'));
    expect(result.current.isWatched('ufc315-main')).toBe(true);
  });

  it('removes a market from the watchlist on second toggle', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.toggle('ufc315-main'));
    act(() => result.current.toggle('ufc315-main'));
    expect(result.current.isWatched('ufc315-main')).toBe(false);
  });

  it('persists watchlist to localStorage', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.toggle('ufc317-main'));
    const stored = JSON.parse(localStorage.getItem('watchlist_markets'));
    expect(stored).toContain('ufc317-main');
  });

  it('does not affect other market IDs when toggling one', () => {
    const { result } = renderHook(() => useWatchlist());
    act(() => result.current.toggle('ufc315-main'));
    act(() => result.current.toggle('ufc317-main'));
    act(() => result.current.toggle('ufc315-main')); // remove first
    expect(result.current.isWatched('ufc315-main')).toBe(false);
    expect(result.current.isWatched('ufc317-main')).toBe(true);
  });
});
