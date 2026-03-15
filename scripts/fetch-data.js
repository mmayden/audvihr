/**
 * fetch-data.js — Phase 6 build-time data scraper.
 *
 * Fetches live fighter stats and upcoming events from UFCStats.com,
 * merges them with editorial fields from fighter-seed.json, and writes
 * src/data/fighters.js and src/data/events.js with the same export
 * shape consumed by all app components.
 *
 * Fighter URLs are stored directly in fighter-seed.json (ufcstats_url field)
 * to avoid fragile search/pagination logic. When adding a new fighter:
 *   1. Browse to ufcstats.com/statistics/fighters?char=X&action=fighter_list
 *   2. Copy the fighter detail URL
 *   3. Add it to fighter-seed.json
 *
 * UFCStats.com HTML selectors are documented in the SEL constant below.
 * If the site updates its markup, update SEL — everything else stays the same.
 *
 * Usage:
 *   node scripts/fetch-data.js              # fetch and write output files
 *   node scripts/fetch-data.js --dry-run    # fetch and preview, no writes
 *   node scripts/fetch-data.js --ci         # abort on any error (CI/CD)
 *   node scripts/fetch-data.js --fresh      # bypass cache, force new fetches
 *
 * Requirements: Node 18+ (native fetch), cheerio devDependency
 */

import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Path resolution ────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');
const SRC_DATA   = join(ROOT, 'src', 'data');
const SCRIPTS    = join(ROOT, 'scripts');

// ── CLI flags ─────────────────────────────────────────────────────────────────

const DRY_RUN  = process.argv.includes('--dry-run');
const CI_MODE  = process.argv.includes('--ci');
const FRESH    = process.argv.includes('--fresh');
const DELAY_MS = CI_MODE ? 100 : 500;

// ── UFCStats selectors ────────────────────────────────────────────────────────
// Based on UFCStats.com HTML as of 2026. Update if markup changes.

const SEL = {
  // Fighter detail page — biographical info items
  // Covers: Height, Weight, Reach, STANCE, DOB
  infoItem:     'li.b-list__box-list-item_type_block',
  infoLabel:    'i.b-list__box-item-title_type_width',

  // Fighter detail page — record display e.g. "Record: 28-1-0"
  record:       'span.b-content__title-record',

  // Fighter name on detail page
  fighterName:  'span.b-content__title-highlight',

  // Fighter detail page — nickname (wrapped in quotes)
  nickname:     'p.b-content__Nickname',

  // Fight history table (event details table on fighter page)
  historyTable: 'table.b-fight-details__table_type_event-details',
  historyRow:   'tr.b-fight-details__table-row__hover',

  // Upcoming events list
  eventRows:    'tr.b-statistics__table-row_type_first, tr.b-statistics__table-row:not(.b-statistics__table-row_type_first)',
  eventLink:    'a.b-link_style_black, a.b-link_style_white',
  eventDate:    'span.b-statistics__date',

  // Event detail page — fight card
  boutRows:     'tr.b-fight-details__table-row__hover',
  boutFighter:  'p.b-fight-details__table-text a.b-link_style_black',
};

const BASE_URL = 'http://www.ufcstats.com';
const UA       = 'Audwihr/0.6.0 (personal MMA trading tool; build-time scraper)';

// ── HTTP helpers ──────────────────────────────────────────────────────────────

/** Fetch a URL and return the HTML body as a string. */
async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

/** Wait ms milliseconds. */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Parsing helpers ───────────────────────────────────────────────────────────

/**
 * Parse a percentage string like "58%" or "58" into a Number.
 * @param {string} s
 * @returns {number}
 */
function parsePct(s) {
  return parseInt(s) || 0;
}

/**
 * Normalize UFCStats method strings to our schema values.
 * @param {string} raw - e.g. "KO/TKO", "U-DEC", "S-DEC", "Sub", "TKO - Punches"
 * @returns {'KO'|'TKO'|'SUB'|'DEC'|'NC'}
 */
function normalizeMethod(raw) {
  const m = raw.trim().toUpperCase();
  if (m.includes('TKO'))     return 'TKO';
  if (m.includes('KO'))      return 'KO';
  if (m.includes('SUB'))     return 'SUB';
  if (m.includes('DEC'))     return 'DEC';
  if (m === 'NC' || m.includes('NO CONTEST')) return 'NC';
  return 'DEC';
}

/**
 * Normalise UFCStats height string from "5' 10\"" to "5'10\"".
 * @param {string} h
 * @returns {string}
 */
function normalizeHeight(h) {
  return h.replace(/'\s+/, "'").trim();
}

/**
 * Parse an abbreviated date string like "Nov. 15, 2025" or "Oct 27, 1991" to a Date.
 * Handles abbreviated month names with optional trailing dot.
 * @param {string} dateText
 * @returns {Date|null}
 */
function parseDate(dateText) {
  if (!dateText || dateText === '--') return null;
  // Normalize abbreviated months: "Nov." → "Nov", "Oct." → "Oct"
  const normalised = dateText.replace(/(\w+)\.\s*/g, '$1 ').trim();
  const d = new Date(normalised);
  return isNaN(d) ? null : d;
}

/**
 * Map UFC weight limit in lbs to our weight class strings.
 * @param {number} lbs
 * @returns {string}
 */
function lbsToWeightClass(lbs) {
  if (lbs <= 115) return 'Strawweight';
  if (lbs <= 125) return 'Flyweight';
  if (lbs <= 135) return 'Bantamweight';
  if (lbs <= 145) return 'Featherweight';
  if (lbs <= 155) return 'Lightweight';
  if (lbs <= 170) return 'Welterweight';
  if (lbs <= 185) return 'Middleweight';
  if (lbs <= 205) return 'Light Heavyweight';
  return 'Heavyweight';
}

/**
 * Normalize UFCStats weight class strings to our schema values.
 * @param {string} raw
 * @returns {string}
 */
function normalizeWeight(raw) {
  const w = (raw || '').toLowerCase();
  if (w.includes('straw'))        return 'Strawweight';
  if (w.includes('fly'))          return 'Flyweight';
  if (w.includes('bantam'))       return 'Bantamweight';
  if (w.includes('feather'))      return 'Featherweight';
  if (w.includes('light heavy'))  return 'Light Heavyweight';
  if (w.includes('light'))        return 'Lightweight';
  if (w.includes('welter'))       return 'Welterweight';
  if (w.includes('middle'))       return 'Middleweight';
  if (w.includes('heavy'))        return 'Heavyweight';
  return raw || 'Unknown';
}

// ── Fighter scraping ──────────────────────────────────────────────────────────

/**
 * Scrape a fighter detail page and return raw scraped data.
 * Uses direct URL from seed — no search/pagination required.
 * @param {string} url        - fighter detail URL from seed.ufcstats_url
 * @param {string} seedName   - fighter name for opponent resolution in history
 * @returns {Promise<object>}
 */
async function scrapeFighterPage(url, seedName) {
  const html = await fetchHtml(url);
  const $    = cheerio.load(html);

  // ── Biographical ─────────────────────────────────────────────────────────

  const name     = $(SEL.fighterName).first().text().trim() || seedName;
  const nickname = $(SEL.nickname).first().text().trim().replace(/^"|"$/g, '');

  // Record: "Record: 28-1-0" → [28, 1, 0]
  const recordRaw   = $(SEL.record).first().text().replace(/record:/i, '').trim();
  const recordParts = recordRaw.split('-').map(s => parseInt(s) || 0);
  const wins   = recordParts[0] || 0;
  const losses = recordParts[1] || 0;
  const draws  = recordParts[2] || 0;

  // Parse all info list items into a key-value map
  // Covers both biographical (Height/Reach/Stance/DOB) and career stats (SLpM/TD Avg. etc.)
  const info = {};
  $(SEL.infoItem).each((_, el) => {
    const label = $(el).find(SEL.infoLabel).text().replace(':', '').trim().toUpperCase();
    // Value is the li text minus the i element text
    const value = $(el).clone().children().remove().end().text().trim();
    if (label && value && value !== '--') info[label] = value;
  });

  const height    = normalizeHeight(info['HEIGHT'] || '');
  const reach     = (info['REACH'] || '').trim();
  const stance    = info['STANCE'] || '';
  const weightLbs = parseInt(info['WEIGHT'] || '0') || 0;
  const weight    = lbsToWeightClass(weightLbs);

  let age = 0;
  if (info['DOB']) {
    const dob = parseDate(info['DOB']);
    if (dob) age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
  }

  // Career stats — same info map (different section of page, same selector)
  const slpm      = parseFloat(info['SLPM']     || '0') || 0;
  const str_acc   = parsePct(info['STR. ACC.']  || info['STR. ACC'] || '0');
  const sapm      = parseFloat(info['SAPM']     || '0') || 0;
  const str_def   = parsePct(info['STR. DEF']   || info['STR. DEF.'] || '0');
  const td_per15  = parseFloat(info['TD AVG.']  || info['TD AVG'] || '0') || 0;
  const td_acc    = parsePct(info['TD ACC.']    || info['TD ACC'] || '0');
  const td_def    = parsePct(info['TD DEF.']    || info['TD DEF'] || '0');
  const sub_per15 = parseFloat(info['SUB. AVG.'] || info['SUB AVG'] || '0') || 0;

  // ── Fight history ─────────────────────────────────────────────────────────
  // Each row: W/L | Fighter1\nFighter2 | KD | Str | Td | Sub | Event\nDate | Method | Round | Time

  const fullHistory = [];
  $(SEL.historyRow).each((_, row) => {
    try {
      const tds = $(row).find('td').toArray();
      if (tds.length < 9) return;

      // Col 1: result — look for b-flag_style_green (win) or b-flag_style_red (loss)
      const resultEl = $(tds[0]).find('a.b-flag');
      const isWin  = resultEl.hasClass('b-flag_style_green');
      const isLoss = resultEl.hasClass('b-flag_style_red');
      if (!isWin && !isLoss) return;
      const result = isWin ? 'W' : 'L';

      // Col 2: fighter names — pick the one that isn't this fighter
      const fighterLinks = $(tds[1]).find('a.b-link_style_black').toArray()
        .map(a => $(a).text().trim()).filter(Boolean);
      const opponent = fighterLinks.find(n => n.toLowerCase() !== name.toLowerCase())
        || fighterLinks[1] || '';

      // Col 7: event name + date (two <p> elements)
      const eventPs   = $(tds[6]).find('p').toArray().map(p => $(p).text().trim());
      const eventName = eventPs[0] || '';
      const eventDate = parseDate(eventPs[1] || '');
      const year      = eventDate ? eventDate.getFullYear() : 0;

      // Col 8: method
      const methodRaw = $(tds[7]).find('p').first().text().trim();
      const method    = normalizeMethod(methodRaw);

      // Col 9: round
      const round = parseInt($(tds[8]).find('p').first().text().trim()) || 1;

      if (opponent && eventName) {
        fullHistory.push({ result, opponent, method, round, event: eventName, year });
      }
    } catch {
      // Skip malformed rows silently
    }
  });

  return {
    name, nickname, height, reach, stance, weight, age,
    wins, losses, draws,
    striking:    { slpm, str_acc, sapm, str_def },
    grappling:   { td_per15, td_acc, td_def, sub_per15 },
    fullHistory,
  };
}

// ── Derived stat computation ───────────────────────────────────────────────────

/**
 * Compute streak, finishes, losses_by, and finish_rate from full fight history.
 * Uses the full scraped history for accuracy; display history is capped at 6 entries.
 * @param {Array}  fullHistory
 * @param {number} wins - total career wins from record
 * @returns {object}
 */
function deriveStats(fullHistory, wins) {
  let streak     = 0;
  let streakType = 'W';
  for (const fight of fullHistory) {
    if (streak === 0) streakType = fight.result;
    if (fight.result === streakType) streak++;
    else break;
  }

  const winFights  = fullHistory.filter(h => h.result === 'W');
  const lossFights = fullHistory.filter(h => h.result === 'L');

  const finishes = {
    ko:  winFights.filter(h => h.method === 'KO' || h.method === 'TKO').length,
    sub: winFights.filter(h => h.method === 'SUB').length,
    dec: winFights.filter(h => h.method === 'DEC').length,
  };

  const losses_by = {
    ko:  lossFights.filter(h => h.method === 'KO' || h.method === 'TKO').length,
    sub: lossFights.filter(h => h.method === 'SUB').length,
    dec: lossFights.filter(h => h.method === 'DEC').length,
  };

  const totalWins   = wins || winFights.length;
  const finish_rate = totalWins > 0
    ? Math.round((finishes.ko + finishes.sub) / totalWins * 100)
    : 0;

  return { streak, streakType, finishes, losses_by, finish_rate };
}

// ── Merge and validate ────────────────────────────────────────────────────────

/**
 * Merge live scraped data with editorial seed fields into a complete Fighter object.
 * Scraped stats take precedence for live fields; seed for editorial/extended fields.
 * @param {object} scraped - data from scrapeFighterPage()
 * @param {object} seed    - entry from fighter-seed.json
 * @returns {object} complete Fighter object matching PLANNING.md schema
 */
function mergeFighter(scraped, seed) {
  const { streak, streakType, finishes, losses_by, finish_rate } =
    deriveStats(scraped.fullHistory, scraped.wins);

  return {
    id:       seed.id,
    name:     scraped.name      || seed.ufcstats_name,
    nickname: scraped.nickname  || seed.nickname || '',
    weight:   scraped.weight    || 'Unknown',
    org:      seed.org,
    rank:     seed.rank,
    age:      scraped.age       || 0,
    height:   scraped.height    || '',
    reach:    scraped.reach     || '',
    stance:   scraped.stance    || '',
    camp:     seed.camp,
    country:  seed.country,

    archetype:  seed.archetype,
    mods:       seed.mods || [],

    record:     `${scraped.wins}-${scraped.losses}`,
    wins:       scraped.wins,
    losses:     scraped.losses,
    draws:      scraped.draws,
    streak,
    streakType,
    finishes,
    losses_by,
    finish_rate,

    chin:       seed.chin,
    cardio:     seed.cardio,
    weight_cut: seed.weight_cut,

    striking: {
      slpm:             scraped.striking.slpm,
      str_acc:          scraped.striking.str_acc,
      sapm:             scraped.striking.sapm,
      str_def:          scraped.striking.str_def,
      head_pct:         seed.striking_extended.head_pct,
      body_pct:         seed.striking_extended.body_pct,
      leg_pct:          seed.striking_extended.leg_pct,
      kd_landed:        seed.striking_extended.kd_landed,
      kd_suffered:      seed.striking_extended.kd_suffered,
      clinch_str_pct:   seed.striking_extended.clinch_str_pct,
      distance_str_pct: seed.striking_extended.distance_str_pct,
      ground_str_pct:   seed.striking_extended.ground_str_pct,
    },

    grappling: {
      td_per15:        scraped.grappling.td_per15,
      td_acc:          scraped.grappling.td_acc,
      td_def:          scraped.grappling.td_def,
      sub_per15:       scraped.grappling.sub_per15,
      top_time_pct:    seed.grappling_extended.top_time_pct,
      bottom_time_pct: seed.grappling_extended.bottom_time_pct,
      ctrl_time_per15: seed.grappling_extended.ctrl_time_per15,
      pass_rate:       seed.grappling_extended.pass_rate,
      reversal_rate:   seed.grappling_extended.reversal_rate,
    },

    // Last 6 fights from full scraped history, with optional editorial overrides
    history: scraped.fullHistory.slice(0, 6).map(h => {
      const ov = (seed.history_overrides || {})[h.opponent];
      return ov ? { ...h, ...ov } : h;
    }),

    // Always empty — user-entered via localStorage Market tab
    market: { ml_open: '', ml_current: '', odds_ko: '', odds_sub: '', odds_dec: '', public_pct: '', notes: '' },

    trader_notes: seed.trader_notes || '',
  };
}

/** Required top-level fields for schema validation. */
const REQUIRED_FIELDS = [
  'id', 'name', 'weight', 'org', 'rank', 'wins', 'losses',
  'archetype', 'chin', 'cardio', 'weight_cut', 'striking', 'grappling', 'history',
];

/**
 * Validate a merged Fighter object. Returns missing required fields.
 * @param {object} fighter
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateFighter(fighter) {
  const missing = REQUIRED_FIELDS.filter(field => {
    const v = fighter[field];
    return v === undefined || v === null || v === '';
  });
  return { valid: missing.length === 0, missing };
}

// ── Events scraping ───────────────────────────────────────────────────────────

/**
 * Scrape upcoming events from UFCStats and return an array matching the EVENTS schema.
 * Fetches up to 8 upcoming events in card order.
 * @returns {Promise<Array>}
 */
async function scrapeUpcomingEvents() {
  const html = await fetchHtml(`${BASE_URL}/statistics/events/upcoming`);
  const $    = cheerio.load(html);

  const eventLinks = [];

  $('table.b-statistics__table--events tr, table.b-statistics__table tr').each((_, row) => {
    const link     = $(row).find('a.b-link_style_black, a.b-link_style_white').first();
    const href     = link.attr('href') || '';
    const name     = link.text().trim();
    const dateText = $(row).find('span.b-statistics__date').text().trim();
    const location = $(row).find('td').last().text().trim();

    if (href.includes('event-details') && name) {
      const url      = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      const isoDate  = parseDateToISO(dateText);
      const [city, venue] = splitLocation(location);
      eventLinks.push({ url, name, date: isoDate, city, venue });
    }
  });

  // Also try the standard upcoming events table structure
  if (eventLinks.length === 0) {
    const rows = html.match(/event-details\/[a-f0-9]+/g) || [];
    const names = html.match(/class="b-link b-link_style[^"]*">([^<]{5,80})<\/a>/g) || [];
    // Fallback handled below
  }

  const events    = [];
  const maxEvents = Math.min(eventLinks.length, 8);

  for (let i = 0; i < maxEvents; i++) {
    const meta = eventLinks[i];
    await sleep(DELAY_MS);
    try {
      const eventData = await scrapeEventPage(meta.url, meta.name, meta.date, meta.venue, meta.city);
      events.push({ ...eventData, id: i + 1 });
    } catch (err) {
      console.warn(`  ⚠ Skipping event "${meta.name}": ${err.message}`);
    }
  }

  return events;
}

/**
 * Scrape a single event detail page and return an event object.
 * @param {string} url
 * @param {string} name
 * @param {string} date
 * @param {string} venue
 * @param {string} city
 * @returns {Promise<object>}
 */
async function scrapeEventPage(url, name, date, venue, city) {
  const html  = await fetchHtml(url);
  const $     = cheerio.load(html);
  const bouts = [];

  // Event name from the page if available
  const pageName = $('h2.b-content__title span.b-content__title-highlight, span.b-content__title-highlight')
    .first().text().trim() || name;

  // Venue/city from event info
  const infoItems = {};
  $('li.b-list__box-list-item_type_block').each((_, el) => {
    const label = $(el).find('i.b-list__box-item-title_type_width').text().replace(':', '').trim().toUpperCase();
    const value = $(el).clone().children().remove().end().text().trim();
    if (label && value) infoItems[label] = value;
  });
  const pageVenue = infoItems['LOCATION'] || venue || 'TBD';
  const pageDate  = infoItems['DATE']     || date  || '';
  const isoDate   = parseDateToISO(pageDate) || date || '';

  // Fight card bouts
  $('tr.b-fight-details__table-row__hover').each((_, row) => {
    try {
      const fighters = $(row).find('p.b-fight-details__table-text a.b-link_style_black')
        .toArray().map(a => $(a).text().trim()).filter(Boolean);
      const weightRaw = $(row).find('td').eq(6).find('p').first().text().trim();
      const isTitle   = $(row).find('img[alt*="title"], img[title*="title"]').length > 0
        || $(row).text().toLowerCase().includes('title');
      const weight = normalizeWeight(weightRaw);

      if (fighters.length >= 2) {
        bouts.push({ f1: fighters[0], f2: fighters[1], weight, title: isTitle });
      }
    } catch {
      // Skip malformed rows
    }
  });

  // UFCStats lists fights from main event first (top of card)
  const org = (pageName || name).toUpperCase().includes('UFC') ? 'UFC'
    : (pageName || name).toUpperCase().includes('BELLATOR') ? 'Bellator'
    : (pageName || name).toUpperCase().includes('PFL') ? 'PFL'
    : 'UFC';

  return {
    name:   pageName || name,
    org,
    date:   isoDate,
    venue:  pageVenue.split(',')[0].trim() || venue || 'TBD',
    city:   pageVenue.includes(',') ? pageVenue.split(',').slice(1).join(',').trim() : city || 'TBD',
    card: {
      main:          bouts[0] ? { ...bouts[0] } : null,
      comain:        bouts[1] ? { ...bouts[1] } : null,
      prelims:       bouts.slice(2, Math.max(2, bouts.length - 2)).map(({ f1, f2, weight }) => ({ f1, f2, weight })),
      early_prelims: bouts.slice(Math.max(2, bouts.length - 2)).map(({ f1, f2, weight }) => ({ f1, f2, weight })),
    },
  };
}

/**
 * Parse a date string to ISO format "YYYY-MM-DD".
 * Handles "March 21, 2026", "Nov. 15, 2025", "Sep. 14, 2024".
 * @param {string} dateText
 * @returns {string}
 */
function parseDateToISO(dateText) {
  const d = parseDate(dateText);
  if (!d) return '';
  const yr  = d.getFullYear();
  const mo  = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

/**
 * Split a location string into [city, venue].
 * @param {string} location
 * @returns {[string, string]}
 */
function splitLocation(location) {
  const parts = location.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts.slice(1).join(', '), parts[0]];
  return [location, ''];
}

// ── File generation ───────────────────────────────────────────────────────────

const FIGHTERS_SCHEMA_COMMENT = `/**
 * fighters.js — GENERATED FILE. Do not edit manually.
 * Run \`npm run fetch-data\` to refresh from UFCStats.com.
 * To add a new fighter: update scripts/fighter-seed.json and re-run fetch-data.
 *
 * Fighter object schema:
 * {
 *   id: Number,
 *   name: String,
 *   nickname: String,
 *   weight: String,           // 'Lightweight' | 'Welterweight' | 'Middleweight' | 'Bantamweight' | 'Heavyweight'
 *   org: String,              // 'UFC'
 *   rank: String,             // 'CHAMPION' or '#N'
 *   age: Number,              // computed from DOB at scrape time
 *   height: String,           // "5'10\\""
 *   reach: String,            // '70"'
 *   stance: String,           // 'Orthodox' | 'Southpaw' | 'Switch'
 *   camp: String,             // from seed
 *   country: String,          // from seed
 *   archetype: String,        // from seed — one of ARCH_COLORS keys
 *   mods: String[],           // from seed — up to 3 modifier tags
 *   record: String,           // derived: '\${wins}-\${losses}'
 *   wins: Number,
 *   losses: Number,
 *   draws: Number,
 *   streak: Number,           // derived from history
 *   streakType: String,       // 'W' | 'L' (derived)
 *   finishes: { ko: Number, sub: Number, dec: Number },   // derived from full history
 *   losses_by: { ko: Number, sub: Number, dec: Number },  // derived from full history
 *   finish_rate: Number,      // % of wins by finish (derived)
 *   chin: String,             // from seed — 'Iron' | 'Solid' | 'Questionable' | 'Stopped Before'
 *   cardio: String,           // from seed — 'Elite' | 'Good' | 'Average' | 'Concern'
 *   weight_cut: String,       // from seed — 'Minimal' | 'Moderate' | 'Heavy Cutter' | 'Drain Risk'
 *   striking: {
 *     slpm: Number,           // UFCStats live
 *     str_acc: Number,        // UFCStats live
 *     sapm: Number,           // UFCStats live
 *     str_def: Number,        // UFCStats live
 *     head_pct: Number,       // from seed
 *     body_pct: Number,       // from seed
 *     leg_pct: Number,        // from seed
 *     kd_landed: Number,      // from seed
 *     kd_suffered: Number,    // from seed
 *     clinch_str_pct: Number,   // from seed
 *     distance_str_pct: Number, // from seed
 *     ground_str_pct: Number,   // from seed
 *   },
 *   grappling: {
 *     td_per15: Number,       // UFCStats live
 *     td_acc: Number,         // UFCStats live
 *     td_def: Number,         // UFCStats live
 *     sub_per15: Number,      // UFCStats live
 *     top_time_pct: Number,   // from seed
 *     bottom_time_pct: Number, // from seed
 *     ctrl_time_per15: Number, // from seed
 *     pass_rate: Number,      // from seed
 *     reversal_rate: Number,  // from seed
 *   },
 *   history: [{ result: 'W'|'L', opponent: String, method: String, round: Number, event: String, year: Number, opp_quality?: 'elite'|'contender'|'gatekeeper'|'unknown' }],
 *   market: { ml_open: '', ml_current: '', odds_ko: '', odds_sub: '', odds_dec: '', public_pct: '', notes: '' },
 *   trader_notes: String,     // from seed
 * }
 */`;

const EVENTS_SCHEMA_COMMENT = `/**
 * events.js — GENERATED FILE. Do not edit manually.
 * Run \`npm run fetch-data\` to refresh from UFCStats.com.
 *
 * Event object schema:
 * {
 *   id: Number,
 *   name: String,
 *   org: String,              // 'UFC' | 'Bellator' | 'PFL'
 *   date: String,             // ISO date 'YYYY-MM-DD'
 *   venue: String,
 *   city: String,
 *   card: {
 *     main:         { f1: String, f2: String, weight: String, title: Boolean, weigh_in?: String|null, judges?: String[] },
 *     comain:       { f1: String, f2: String, weight: String, title: Boolean, weigh_in?: String|null, judges?: String[] },
 *     prelims:      [{ f1: String, f2: String, weight: String, weigh_in?: String|null, judges?: String[] }],
 *     early_prelims:[{ f1: String, f2: String, weight: String, weigh_in?: String|null, judges?: String[] }],
 *   }
 * }
 */`;

/**
 * Serialize a Fighter object to compact JS source that matches the original file style.
 * @param {object} f
 * @returns {string}
 */
function serializeFighter(f) {
  const history = f.history
    .map(h => `{result:'${h.result}',opponent:${JSON.stringify(h.opponent)},method:'${h.method}',round:${h.round},event:${JSON.stringify(h.event)},year:${h.year}${h.opp_quality ? `,opp_quality:'${h.opp_quality}'` : ''}}`)
    .join(',\n      ');

  return `  { id:${f.id}, name:${JSON.stringify(f.name)}, nickname:${JSON.stringify(f.nickname)}, weight:${JSON.stringify(f.weight)}, org:'${f.org}', rank:${JSON.stringify(f.rank)},
    age:${f.age}, height:${JSON.stringify(f.height)}, reach:${JSON.stringify(f.reach)}, stance:${JSON.stringify(f.stance)}, camp:${JSON.stringify(f.camp)}, country:${JSON.stringify(f.country)},
    archetype:${JSON.stringify(f.archetype)}, mods:${JSON.stringify(f.mods)},
    record:${JSON.stringify(f.record)}, wins:${f.wins}, losses:${f.losses}, draws:${f.draws}, streak:${f.streak}, streakType:'${f.streakType}',
    finishes:{ko:${f.finishes.ko},sub:${f.finishes.sub},dec:${f.finishes.dec}}, losses_by:{ko:${f.losses_by.ko},sub:${f.losses_by.sub},dec:${f.losses_by.dec}}, finish_rate:${f.finish_rate},
    chin:${JSON.stringify(f.chin)}, cardio:${JSON.stringify(f.cardio)}, weight_cut:${JSON.stringify(f.weight_cut)},
    striking:{ slpm:${f.striking.slpm}, str_acc:${f.striking.str_acc}, sapm:${f.striking.sapm}, str_def:${f.striking.str_def}, head_pct:${f.striking.head_pct}, body_pct:${f.striking.body_pct}, leg_pct:${f.striking.leg_pct}, kd_landed:${f.striking.kd_landed}, kd_suffered:${f.striking.kd_suffered}, clinch_str_pct:${f.striking.clinch_str_pct}, distance_str_pct:${f.striking.distance_str_pct}, ground_str_pct:${f.striking.ground_str_pct} },
    grappling:{ td_per15:${f.grappling.td_per15}, td_acc:${f.grappling.td_acc}, td_def:${f.grappling.td_def}, sub_per15:${f.grappling.sub_per15}, top_time_pct:${f.grappling.top_time_pct}, bottom_time_pct:${f.grappling.bottom_time_pct}, ctrl_time_per15:${f.grappling.ctrl_time_per15}, pass_rate:${f.grappling.pass_rate}, reversal_rate:${f.grappling.reversal_rate} },
    history:[
      ${history}
    ],
    trader_notes:${JSON.stringify(f.trader_notes)} }`;
}

function generateFightersFile(fighters, timestamp) {
  const body = fighters.map(serializeFighter).join(',\n');
  return `${FIGHTERS_SCHEMA_COMMENT}\n// Last updated: ${timestamp}\n\nexport const FIGHTERS = [\n${body},\n];\n`;
}

function serializeFight(fight, includeTitle = false) {
  if (!fight) return 'null';
  const base = `{f1:${JSON.stringify(fight.f1)},f2:${JSON.stringify(fight.f2)},weight:${JSON.stringify(fight.weight)}`;
  const titlePart   = includeTitle ? `,title:${fight.title || false}` : '';
  const weighInPart = fight.weigh_in != null ? `,weigh_in:${JSON.stringify(fight.weigh_in)}` : '';
  const judgesPart  = fight.judges && fight.judges.length > 0 ? `,judges:${JSON.stringify(fight.judges)}` : '';
  return `${base}${titlePart}${weighInPart}${judgesPart}}`;
}

function applyEventOverrides(events, overrides) {
  if (!overrides || !overrides.length) return events;
  return events.map(ev => {
    const ovEntry = overrides.find(o => o.event_name === ev.name);
    if (!ovEntry) return ev;
    const applyFightOv = (fight) => {
      if (!fight) return fight;
      const ov = ovEntry.fights.find(f =>
        f.f1.toLowerCase() === fight.f1.toLowerCase() &&
        f.f2.toLowerCase() === fight.f2.toLowerCase()
      );
      return ov ? { ...fight, weigh_in: ov.weigh_in, judges: ov.judges } : fight;
    };
    return {
      ...ev,
      card: {
        main:          applyFightOv(ev.card.main),
        comain:        applyFightOv(ev.card.comain),
        prelims:       (ev.card.prelims      || []).map(applyFightOv),
        early_prelims: (ev.card.early_prelims || []).map(applyFightOv),
      },
    };
  });
}

function generateEventsFile(events, timestamp, overrides) {
  const enriched = applyEventOverrides(events, overrides);
  const body = enriched.map((e, i) => {
    const prelims      = (e.card.prelims      || []).map(f => `        ${serializeFight(f)}`).join(',\n');
    const earlyPrelims = (e.card.early_prelims || []).map(f => `        ${serializeFight(f)}`).join(',\n');
    return `  { id:${i + 1}, name:${JSON.stringify(e.name)}, org:'${e.org}', date:'${e.date}', venue:${JSON.stringify(e.venue)}, city:${JSON.stringify(e.city)},
    card:{
      main:   ${serializeFight(e.card.main,   true)},
      comain: ${serializeFight(e.card.comain, true)},
      prelims:[
${prelims}
      ],
      early_prelims:[
${earlyPrelims}
      ],
    }}`;
  }).join(',\n');
  return `${EVENTS_SCHEMA_COMMENT}\n// Last updated: ${timestamp}\n\nexport const EVENTS = [\n${body},\n];\n`;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

function writeCache(name, data) {
  writeFileSync(join(SCRIPTS, `${name}.raw.json`), JSON.stringify(data, null, 2), 'utf8');
}

function readCache(name) {
  const path = join(SCRIPTS, `${name}.raw.json`);
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return null; }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🥊  Audwihr fetch-data — UFCStats scraper`);
  console.log(`    Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'WRITE'} | CI: ${CI_MODE} | Fresh: ${FRESH}\n`);

  const seed    = JSON.parse(readFileSync(join(SCRIPTS, 'fighter-seed.json'), 'utf8'));
  const timestamp = new Date().toISOString();

  const fighters = [];
  const warnings = [];
  const errors   = [];

  // ── Fighters ───────────────────────────────────────────────────────────────

  for (const seedFighter of seed.fighters) {
    const { id, ufcstats_name, ufcstats_url } = seedFighter;
    console.log(`  [${String(id).padStart(2, '0')}] ${ufcstats_name} ...`);

    if (!ufcstats_url) {
      errors.push(`${ufcstats_name}: missing ufcstats_url in seed`);
      console.error(`       ✗ No ufcstats_url in seed — skipping`);
      if (CI_MODE) { console.error('\n✗  CI mode: aborting.\n'); process.exit(1); }
      continue;
    }

    try {
      const cacheKey = `fighter_${id}`;
      let scraped    = (!FRESH && !DRY_RUN) ? readCache(cacheKey) : null;

      if (scraped) {
        console.log(`       (cached)`);
      } else {
        await sleep(DELAY_MS);
        scraped = await scrapeFighterPage(ufcstats_url, ufcstats_name);
        if (!DRY_RUN) writeCache(cacheKey, scraped);
      }

      const fighter          = mergeFighter(scraped, seedFighter);
      const { valid, missing } = validateFighter(fighter);

      if (!valid) {
        warnings.push(`${ufcstats_name}: missing fields [${missing.join(', ')}]`);
        console.warn(`       ⚠ Missing: ${missing.join(', ')}`);
      } else {
        const streak = `${fighter.streak}${fighter.streakType}`;
        console.log(`       ✓ ${fighter.record} | SLpM ${fighter.striking.slpm} | TD Def ${fighter.grappling.td_def}% | streak ${streak}`);
      }

      fighters.push(fighter);
    } catch (err) {
      errors.push(`${ufcstats_name}: ${err.message}`);
      console.error(`       ✗ ${err.message}`);
      if (CI_MODE) { console.error('\n✗  CI mode: aborting.\n'); process.exit(1); }
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  console.log(`\n  Scraping upcoming events...`);
  let events = [];
  try {
    await sleep(DELAY_MS);
    events = await scrapeUpcomingEvents();
    if (!DRY_RUN) writeCache('events', events);
    console.log(`  ✓ ${events.length} upcoming event(s) found`);
  } catch (err) {
    console.warn(`  ⚠ Events scrape failed: ${err.message}`);
    if (CI_MODE) { console.error('\n✗  CI mode: aborting.\n'); process.exit(1); }
    const cached = readCache('events');
    if (cached) { events = cached; console.warn(`  ↩ Using cached events (${cached.length})`); }
  }

  // ── Output ─────────────────────────────────────────────────────────────────

  const fightersJs = generateFightersFile(fighters, timestamp);
  const eventsJs   = generateEventsFile(events, timestamp, seed.event_overrides);

  if (DRY_RUN) {
    console.log('\n── DRY RUN: fighters.js preview (first 25 lines) ───────────────────────────');
    console.log(fightersJs.split('\n').slice(0, 25).join('\n'));
    console.log('\n── DRY RUN: events.js preview (first 10 lines) ─────────────────────────────');
    console.log(eventsJs.split('\n').slice(0, 10).join('\n'));
  } else {
    if (fighters.length > 0) {
      writeFileSync(join(SRC_DATA, 'fighters.js'), fightersJs, 'utf8');
      console.log(`\n  ✓ Wrote src/data/fighters.js (${fighters.length} fighters)`);
    } else {
      console.warn('\n  ⚠ No fighters scraped — fighters.js NOT overwritten');
    }
    if (events.length > 0) {
      writeFileSync(join(SRC_DATA, 'events.js'), eventsJs, 'utf8');
      console.log(`  ✓ Wrote src/data/events.js (${events.length} events)`);
    } else {
      console.warn('  ⚠ No events scraped — events.js NOT overwritten');
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n────────────────────────────────────────────────────────────────────────────');
  console.log(`  Fighters: ${fighters.length}/${seed.fighters.length} OK | Warnings: ${warnings.length} | Errors: ${errors.length}`);
  if (warnings.length) warnings.forEach(w => console.warn(`  ⚠ ${w}`));
  if (errors.length)   errors.forEach(e   => console.error(`  ✗ ${e}`));
  if (CI_MODE && errors.length > 0) process.exit(1);
  console.log('\n  Done.\n');
}

main().catch(err => {
  console.error('\n✗  Fatal:', err.message);
  process.exit(1);
});
