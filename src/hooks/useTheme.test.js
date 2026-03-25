import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('useTheme', () => {
  it('defaults to system theme (no data-theme attribute)', () => {
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('restores persisted light theme from localStorage', () => {
    localStorage.setItem('theme', JSON.stringify('light'));
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('restores persisted dark theme from localStorage', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle flips from default (system) to light', () => {
    const { result } = renderHook(() => useTheme());
    act(() => { result.current.toggle(); });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggle flips from light to dark', () => {
    localStorage.setItem('theme', JSON.stringify('light'));
    const { result } = renderHook(() => useTheme());
    act(() => { result.current.toggle(); });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle flips from dark to light', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    const { result } = renderHook(() => useTheme());
    act(() => { result.current.toggle(); });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('label is ARENA when current theme is dark', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    const { result } = renderHook(() => useTheme());
    expect(result.current.label).toBe('ARENA');
  });

  it('label is MONOLITH when current theme is light', () => {
    localStorage.setItem('theme', JSON.stringify('light'));
    const { result } = renderHook(() => useTheme());
    expect(result.current.label).toBe('MONOLITH');
  });

  it('persists chosen theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => { result.current.toggle(); });
    expect(JSON.parse(localStorage.getItem('theme'))).toBe('light');
  });
});
