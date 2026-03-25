/**
 * date.js — shared date utility functions used across CalendarScreen, MarketsScreen,
 * NewsScreen, and TabOverview.
 */

/**
 * Returns days until an ISO date string from the given today reference.
 * @param {string} dateStr - ISO date string (e.g. '2026-04-12')
 * @param {Date} today - reference date (midnight local time)
 * @returns {number} days until the date (negative = past)
 */
export function daysUntil(dateStr, today) {
  return Math.round((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if the event date is in the past relative to today.
 * @param {string} dateStr - ISO date string
 * @param {Date} today - reference date (midnight local time)
 * @returns {boolean}
 */
export function isPast(dateStr, today) {
  return new Date(dateStr) < today;
}

/**
 * Formats an ISO date string as a short date without weekday (e.g. 'Mar 14, 2026').
 * Uses UTC noon to avoid day-boundary shifts across timezones.
 * @param {string} iso - ISO date string (e.g. '2026-03-14')
 * @returns {string}
 */
export function formatDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * Formats an ISO date string as a long event date with weekday (e.g. 'Sat, Apr 12, 2026').
 * Uses local noon — event dates are stored as local calendar dates.
 * @param {string} dateStr - ISO date string (e.g. '2026-04-12')
 * @returns {string}
 */
export function formatEventDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Returns a compact countdown label (e.g. '7D', '1D', 'TODAY', 'PAST').
 * @param {string} dateStr - ISO date string
 * @param {Date} today - reference date
 * @param {string} [pastLabel='PAST'] - label when date is in the past
 * @returns {string}
 */
export function countdown(dateStr, today, pastLabel = 'PAST') {
  const d = daysUntil(dateStr, today);
  if (d < 0) return pastLabel;
  if (d === 0) return 'TODAY';
  if (d === 1) return '1D';
  return d + 'D';
}
