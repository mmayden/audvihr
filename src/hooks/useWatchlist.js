import { useLocalStorage } from './useLocalStorage';

/**
 * useWatchlist — persists a list of watchlisted market IDs to localStorage.
 * @returns {{ isWatched: (id: string) => boolean, toggle: (id: string) => void }}
 */
export function useWatchlist() {
  const [list, setList] = useLocalStorage('watchlist_markets', []);
  const isWatched = (id) => list.includes(id);
  const toggle = (id) => setList((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
  return { isWatched, toggle };
}
