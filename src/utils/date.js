/**
 * date.js — shared date utility functions used across CalendarScreen and MarketsScreen.
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
