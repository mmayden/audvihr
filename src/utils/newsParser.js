/**
 * newsParser.js — RSS feed parsing and news item normalization utilities.
 *
 * Security: All fetched content is text-extracted only via DOMParser/textContent.
 * No HTML is ever passed through to the DOM. No innerHTML, no dangerouslySetInnerHTML.
 * DOMParser is used for both HTML stripping (text/html) and RSS parsing (application/xml).
 *
 * Exports:
 *   stripHtml(str) → string
 *   parseRssFeed(xmlText) → RawRssItem[]
 *   classifyCategory(headline, body) → string
 *   classifyRelevance(headline, body) → string
 *   matchFighterName(headline, body, fighters) → number|null
 *   rssItemToNewsItem(rawItem, source, fighters, idx) → NewsItem
 */

/**
 * Strip all HTML tags from a string using DOMParser for safe text extraction.
 * Returns plain text only — no markup, no attributes survive.
 * Falls back to a regex strip if DOMParser is unavailable.
 * @param {string} str - possibly HTML-containing string
 * @returns {string} plain text
 */
export function stripHtml(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent ?? '';
  } catch {
    // Fallback for environments without DOMParser
    return str.replace(/<[^>]*>/g, '');
  }
}

/** Keyword buckets for category classification (checked in listed order). */
const CATEGORY_KEYWORDS = {
  injury:    ['injur', 'hurt', 'surgery', 'pulls from', 'withdrawal', 'medical suspension', 'fracture', 'torn', 'concussion', 'hospitali'],
  'weigh-in':['weigh', 'missed weight', 'miss weight', 'scale', 'dehydr'],
  result:    ['defeats', 'wins via', 'wins by', "tko'd", 'choked out', 'submitted', " ko'd", 'unanimous decision', 'split decision', 'majority decision'],
  camp:      ['camp', 'training', 'coach', 'gym', 'sparring', 'prepares', 'preparing'],
};

/**
 * Classify a news item into a category by keyword matching.
 * Defaults to 'fight' when no keyword bucket matches.
 * @param {string} headline
 * @param {string} body
 * @returns {'fight'|'injury'|'camp'|'weigh-in'|'result'}
 */
export function classifyCategory(headline, body) {
  const text = (headline + ' ' + body).toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(kw => text.includes(kw))) return cat;
  }
  return 'fight';
}

/** Keywords that elevate relevance to 'high'. */
const HIGH_KEYWORDS = ['title', 'champion', 'main event', 'injur', 'pulls from', 'miss weight', 'withdrawal', 'surgery', 'ko', 'submission', 'fracture', 'torn', 'hospitali'];
/** Keywords that drop relevance to 'low'. */
const LOW_KEYWORDS  = ['opinion', 'pound-for-pound', 'greatest of all', 'best of all', 'historical', 'all-time', 'hall of fame'];

/**
 * Classify trading relevance of a news item by keyword matching.
 * @param {string} headline
 * @param {string} body
 * @returns {'high'|'medium'|'low'}
 */
export function classifyRelevance(headline, body) {
  const text = (headline + ' ' + body).toLowerCase();
  if (HIGH_KEYWORDS.some(kw => text.includes(kw))) return 'high';
  if (LOW_KEYWORDS.some(kw => text.includes(kw)))  return 'low';
  return 'medium';
}

/**
 * Match a news item to a roster fighter by last-name occurrence in combined text.
 * Returns the first matched fighter's id, or null if no match.
 * Last names shorter than 3 characters are skipped to avoid false positives.
 * @param {string} headline
 * @param {string} body
 * @param {object[]} fighters - FIGHTERS array entries with { id, name }
 * @returns {number|null}
 */
export function matchFighterName(headline, body, fighters) {
  if (!Array.isArray(fighters)) return null;
  const text = (headline + ' ' + body).toLowerCase();
  for (const f of fighters) {
    if (!f?.name) continue;
    const lastName = f.name.split(' ').pop().toLowerCase();
    if (lastName.length >= 3 && text.includes(lastName)) return f.id;
  }
  return null;
}

/**
 * Parse an RSS/Atom date string into 'YYYY-MM-DD'.
 * Falls back to today's date on invalid or missing input.
 * @param {string} dateStr
 * @returns {string}
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Parse an RSS XML string into an array of raw item objects.
 * Uses DOMParser with 'application/xml' (safe for structured XML, not HTML).
 * Returns [] on any parse error or malformed input.
 * @param {string} xmlText - raw RSS XML string
 * @returns {{ title: string, date: string, description: string }[]}
 */
export function parseRssFeed(xmlText) {
  if (!xmlText || typeof xmlText !== 'string') return [];
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    // DOMParser signals XML errors via a <parsererror> element
    if (doc.querySelector('parsererror')) return [];
    const items = [...doc.querySelectorAll('item')];
    return items.map(item => ({
      title:       item.querySelector('title')?.textContent ?? '',
      date:        item.querySelector('pubDate')?.textContent ?? '',
      description: item.querySelector('description')?.textContent ?? '',
    }));
  } catch {
    return [];
  }
}

/**
 * Transform a raw RSS item into the app's NewsItem schema.
 * All string values are HTML-stripped before use. Headline is capped at 160 chars,
 * body at 600 chars.
 * @param {{ title: string, date: string, description: string }} rawItem
 * @param {string} source - publication name (e.g. 'MMA Fighting')
 * @param {object[]} fighters - FIGHTERS array for name matching
 * @param {number} idx - position index used to generate a unique id
 * @returns {object} NewsItem conforming to the news.js schema with isLive: true
 */
export function rssItemToNewsItem(rawItem, source, fighters, idx) {
  const headline   = stripHtml(rawItem.title ?? '').trim().slice(0, 160);
  const body       = stripHtml(rawItem.description ?? '').trim().slice(0, 600);
  const date       = parseDate(rawItem.date);
  const fighterId  = matchFighterName(headline, body, fighters);
  const fighter    = fighterId !== null ? fighters.find(f => f.id === fighterId) : null;
  const sourceSlug = source.toLowerCase().replace(/\s+/g, '-');
  return {
    id:           `live-${sourceSlug}-${idx}`,
    date,
    fighter_id:   fighterId,
    fighter_name: fighter ? fighter.name : null,
    category:     classifyCategory(headline, body),
    headline,
    body,
    source,
    relevance:    classifyRelevance(headline, body),
    isLive:       true,
  };
}
