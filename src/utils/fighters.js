/**
 * fighters — pure utility functions for looking up fighters from the roster.
 * Used by CalendarScreen (name → ID for COMPARE navigation) and any other
 * context where a fighter must be located by name rather than ID.
 */

/**
 * Find a fighter by name (case-insensitive exact match).
 * Falls back to a case-insensitive last-name match if no exact match is found.
 *
 * @param {string}   name     - fighter name to look up
 * @param {object[]} fighters - full FIGHTERS array
 * @returns {object|null} fighter object or null if not found
 */
export function findFighterByName(name, fighters) {
  if (!name || !Array.isArray(fighters) || !fighters.length) return null;
  const q = name.trim().toLowerCase();
  if (!q) return null;
  // 1. Exact full-name match
  const exact = fighters.find(f => f?.name && f.name.toLowerCase() === q);
  if (exact) return exact;
  // 2. Last-name fallback (handles "Makhachev" matching "Islam Makhachev")
  const lastName = q.split(' ').pop();
  if (lastName.length < 3) return null;
  return fighters.find(f => f?.name && f.name.toLowerCase().endsWith(' ' + lastName)) ?? null;
}
