import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the default value when key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('persists state updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    act(() => result.current[1](99));
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe(99);
  });

  it('falls back to default when stored value is malformed JSON', () => {
    localStorage.setItem('test-key', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('works with object defaults', () => {
    const { result } = renderHook(() => useLocalStorage('test-obj', { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('works with array defaults', () => {
    const { result } = renderHook(() => useLocalStorage('test-arr', []));
    expect(result.current[0]).toEqual([]);
  });
});
