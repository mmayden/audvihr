import '@testing-library/jest-dom';

// jsdom's localStorage can be broken by stray CLI flags (e.g. --localstorage-file).
// Provide a deterministic in-memory implementation that always has .clear().
const makeLocalStorage = () => {
  let store = {};
  return {
    getItem:    (k)    => (k in store ? store[k] : null),
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: (k)    => { delete store[k]; },
    clear:      ()     => { store = {}; },
    get length()       { return Object.keys(store).length; },
    key:        (i)    => Object.keys(store)[i] ?? null,
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  value: makeLocalStorage(),
  writable: true,
});
