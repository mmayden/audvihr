import { describe, it, expect, beforeEach } from 'vitest';
import { readCache, writeCache, evictCache } from './cache';

beforeEach(() => {
  sessionStorage.clear();
});

describe('writeCache / readCache', () => {
  it('writes and reads back a value', () => {
    writeCache('foo', { hello: 'world' });
    expect(readCache('foo')).toEqual({ hello: 'world' });
  });

  it('returns null for an absent key', () => {
    expect(readCache('missing')).toBeNull();
  });

  it('returns null when entry is older than the TTL', () => {
    writeCache('old', 42);
    // Manually back-date the stored timestamp.
    const stored = JSON.parse(sessionStorage.getItem('old'));
    stored.ts = Date.now() - 11 * 60 * 1000; // 11 minutes ago
    sessionStorage.setItem('old', JSON.stringify(stored));
    expect(readCache('old', 10 * 60 * 1000)).toBeNull();
  });

  it('honours a custom TTL', () => {
    writeCache('shortlived', 'data');
    const stored = JSON.parse(sessionStorage.getItem('shortlived'));
    stored.ts = Date.now() - 31 * 1000; // 31s ago
    sessionStorage.setItem('shortlived', JSON.stringify(stored));
    expect(readCache('shortlived', 60 * 1000)).not.toBeNull(); // 60s TTL — still valid
    expect(readCache('shortlived', 30 * 1000)).toBeNull();    // 30s TTL — expired
  });

  it('returns null when the stored value is not valid JSON', () => {
    sessionStorage.setItem('bad', 'not-json{');
    expect(readCache('bad')).toBeNull();
  });

  it('overwrites an existing cache entry', () => {
    writeCache('key', 'first');
    writeCache('key', 'second');
    expect(readCache('key')).toBe('second');
  });

  it('handles non-JSON-serialisable values gracefully', () => {
    // circular reference would throw — writeCache should swallow it
    const circ = {};
    circ.self = circ;
    expect(() => writeCache('circ', circ)).not.toThrow();
  });
});

describe('evictCache', () => {
  it('removes an existing entry', () => {
    writeCache('todelete', 'val');
    evictCache('todelete');
    expect(readCache('todelete')).toBeNull();
  });

  it('does not throw when the key is absent', () => {
    expect(() => evictCache('never_existed')).not.toThrow();
  });
});
