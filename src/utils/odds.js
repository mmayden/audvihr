/**
 * odds.js — moneyline utility functions.
 */

/**
 * mlToImplied — converts an American moneyline to an implied probability percentage.
 * @param {string} ml - moneyline string, e.g. '-200' or '+150'
 * @returns {string|null} implied probability as a string like '66.7', or null if invalid
 */
export function mlToImplied(ml) {
  const n = parseInt(ml); if (!n || isNaN(n)) return null;
  return n < 0 ? ((-n)/(-n+100)*100).toFixed(1) : (100/(n+100)*100).toFixed(1);
}

/**
 * lineMovement — computes the direction and magnitude of line movement between open and current.
 * @param {string} open - opening moneyline string
 * @param {string} current - current moneyline string
 * @returns {{ dir: 'up'|'down', label: string }|null} movement object, or null if unchanged/invalid
 */
export function lineMovement(open, current) {
  const o=parseInt(open),c=parseInt(current);
  if(!o||!c||isNaN(o)||isNaN(c)) return null;
  const diff = (parseFloat(mlToImplied(c))-parseFloat(mlToImplied(o))).toFixed(1);
  if(diff>0) return {dir:'up', label:`+${diff}% implied (line moved toward)`};
  if(diff<0) return {dir:'down', label:`${diff}% implied (line moved away)`};
  return null;
}
