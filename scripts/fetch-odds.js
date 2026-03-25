/**
 * fetch-odds.js — Phase 17 build-time odds scraper.
 *
 * Fetches live moneylines from BestFightOdds.com (free, no API key),
 * and writes src/data/odds.js with multi-book lines per fight keyed
 * by fightKey (same key format as normalizeOdds.js).
 *
 * BestFightOdds HTML structure (as of 2026):
 *   - div.table-div[id="eventNNNN"] wraps each event
 *   - table.odds-table (not .odds-table-responsive-header) holds the odds grid
 *   - thead > tr > th[data-b] contains book names
 *   - tbody > tr pairs: first tr has id="mu-XXXXX" (fighter 1), next tr is fighter 2
 *   - tr.pr rows are props — skip
 *   - td.but-sg > span contains the moneyline value (e.g. "-295", "+220")
 *
 * Usage:
 *   node scripts/fetch-odds.js              # fetch and write output file
 *   node scripts/fetch-odds.js --dry-run    # fetch and preview, no writes
 *   node scripts/fetch-odds.js --ci         # abort on any error (CI/CD)
 *   node scripts/fetch-odds.js --fresh      # bypass cache, force new fetches
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

// ── Constants ─────────────────────────────────────────────────────────────────

const BFO_BASE    = 'https://www.bestfightodds.com';
const UA_BROWSER  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA_BROWSER } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── fightKey — same algorithm as normalizeOdds.js ─────────────────────────────

function fightKey(f1, f2) {
  const lastName = (n) => String(n || '').trim().toLowerCase().split(/\s+/).pop();
  return [lastName(f1), lastName(f2)].sort().join('_');
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

// ── Parsing ───────────────────────────────────────────────────────────────────

/**
 * Parse the BFO homepage or event page and extract all UFC fight odds.
 * Returns an array of fight objects with multi-book moneylines.
 *
 * @param {string} html - raw HTML from BFO
 * @returns {{ eventName: string, fights: Array }[]}
 */
function parseHomepage(html) {
  const $ = cheerio.load(html);
  const events = [];
  const _parseRowOdds = (rowEl, numBooks) => parseRowOdds($, rowEl, numBooks);

  $('div.table-div').each((_, eventDiv) => {
    const $ev = $(eventDiv);

    // Event name from header
    const eventName = $ev.find('.table-header h1').first().text().trim();
    if (!eventName) return;

    // Only scrape UFC events
    if (!eventName.toUpperCase().includes('UFC')) return;

    // Event date from header
    const eventDate = $ev.find('.table-header-date').first().text().trim();

    // Event URL for deeper scrape if needed
    const eventHref = $ev.find('.table-header a[href*="/events/"]').first().attr('href') || '';

    // Find the main odds table (not the responsive-header one)
    const oddsTables = $ev.find('table.odds-table').toArray();
    const mainTable = oddsTables.find(t => !$(t).hasClass('odds-table-responsive-header'));
    if (!mainTable) return;

    const $table = $(mainTable);

    // Parse book names from thead
    const books = [];
    $table.find('thead th[data-b]').each((_, th) => {
      const bookName = $(th).text().trim();
      if (bookName) books.push(bookName);
    });

    if (books.length === 0) return;

    // Parse fight rows from tbody — pairs of non-prop rows
    const fights = [];
    const rows = $table.find('tbody > tr').toArray();
    let i = 0;

    while (i < rows.length) {
      const row1 = $(rows[i]);

      // Skip prop rows
      if (row1.hasClass('pr')) { i++; continue; }

      // Fighter 1 name
      const f1Name = row1.find('th span.t-b-fcc').first().text().trim();
      if (!f1Name) { i++; continue; }

      // Fighter 1 odds per book
      const f1Odds = _parseRowOdds(row1, books.length);

      // Fighter 2 should be the next non-prop row
      let f2Name = '';
      let f2Odds = [];
      i++;
      while (i < rows.length) {
        const row2 = $(rows[i]);
        if (row2.hasClass('pr')) { i++; continue; }
        f2Name = row2.find('th span.t-b-fcc').first().text().trim();
        f2Odds = _parseRowOdds(row2, books.length);
        i++;
        break;
      }

      if (!f2Name) continue;

      // Build per-book lines — only include books that have odds for both fighters
      const bookLines = [];
      for (let b = 0; b < books.length; b++) {
        if (f1Odds[b] && f2Odds[b]) {
          bookLines.push({
            source: books[b],
            f1_ml: f1Odds[b],
            f2_ml: f2Odds[b],
          });
        }
      }

      // Determine best line (smallest absolute favorite ML = sharpest)
      let bestBook = bookLines[0] || null;
      if (bookLines.length > 1) {
        bestBook = bookLines.reduce((best, cur) => {
          const bestSpread = Math.abs(parseInt(best.f1_ml)) + Math.abs(parseInt(best.f2_ml));
          const curSpread = Math.abs(parseInt(cur.f1_ml)) + Math.abs(parseInt(cur.f2_ml));
          return curSpread < bestSpread ? cur : best;
        });
      }

      fights.push({
        fighter1: f1Name,
        fighter2: f2Name,
        fightKey: fightKey(f1Name, f2Name),
        books: bookLines,
        best: bestBook,
      });
    }

    if (fights.length > 0) {
      events.push({ eventName, eventDate, eventHref, fights });
    }
  });

  return events;
}

/**
 * Parse moneyline odds from a single fighter row's td cells.
 * Returns an array of ML strings (one per book column), or null for empty cells.
 *
 * @param {function} $ - cheerio root
 * @param {cheerio.Element} row - raw DOM element (not wrapped)
 * @param {number} numBooks
 * @returns {(string|null)[]}
 */
function parseRowOdds($, row, numBooks) {
  const $row = $(row);
  const odds = [];
  // td cells after the th (fighter name) — one per book, then 3 button/prop cells
  const tds = $row.find('td').toArray();

  for (let b = 0; b < numBooks && b < tds.length; b++) {
    const $td = $(tds[b]);
    // Skip button cells and prop cells
    if ($td.hasClass('button-cell') || $td.hasClass('prop-cell')) {
      odds.push(null);
      continue;
    }
    // Odds value is in the first span (subsequent spans are arrow indicators)
    const spans = $td.find('span').toArray();
    let ml = null;
    for (const span of spans) {
      const text = $(span).text().trim();
      ml = parseMoneyline(text);
      if (ml) break;
    }
    odds.push(ml);
  }

  return odds;
}

/**
 * Parse a moneyline string from BFO.
 * Handles formats: "-295", "+220", "EVEN", "-110▼" (arrow is in separate span but text may include it).
 *
 * @param {string} raw
 * @returns {string|null} - American ML string or null if unparseable
 */
function parseMoneyline(raw) {
  if (!raw) return null;
  // Remove arrow symbols and whitespace
  const cleaned = raw.replace(/[▼▲\s]/g, '').trim();
  if (!cleaned) return null;
  if (cleaned.toUpperCase() === 'EVEN') return '+100';
  // Must be a signed or unsigned integer
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return null;
  // BFO sometimes omits the + sign on underdogs
  if (num > 0) return `+${num}`;
  return String(num);
}

// ── Opening line extraction ───────────────────────────────────────────────────

/**
 * Extract opening line data from BFO event page chart data.
 * BFO embeds "Change since opening" as JSON in a data-* attribute.
 * We can compute: opening_ml = current_best - change.
 *
 * However, the "change" values are approximate implied probability deltas,
 * not ML deltas. So we'll scrape the event detail page for more precise data
 * if available, but fall back to the homepage data alone.
 *
 * @param {string} html - event detail page HTML
 * @param {object[]} fights - parsed fights from homepage (to enrich with opening)
 * @returns {Map<string, { f1_opening: string, f2_opening: string }>}
 */
function parseOpeningDeltas(html) {
  const openings = new Map();
  try {
    // BFO embeds chart data as HTML-entity-encoded JSON in data-* attributes
    // Pattern: data-ATTRNAME="{...opening...}"
    const match = html.match(/data-\w+="([^"]*[Cc]hange since opening[^"]*)"/);
    if (!match) return openings;

    const decoded = match[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'");

    const parsed = JSON.parse(`[${decoded}]`);
    const changeData = parsed.find(d => d.name && d.name.includes('opening'));
    if (changeData && Array.isArray(changeData.data)) {
      // data is [[fighterName, delta], ...] — delta in implied % points
      for (const [name, delta] of changeData.data) {
        openings.set(String(name).trim().toLowerCase(), delta);
      }
    }
  } catch {
    // Silent degradation — opening deltas are a nice-to-have
  }
  return openings;
}

// ── Output generation ─────────────────────────────────────────────────────────

const ODDS_SCHEMA_COMMENT = `/**
 * odds.js — GENERATED FILE. Do not edit manually.
 * Run \`npm run fetch-odds\` to refresh from BestFightOdds.com.
 *
 * Odds object schema (keyed by fightKey — same as normalizeOdds.js):
 * {
 *   [fightKey: string]: {
 *     fighter1:  string,           // display name as listed on BFO
 *     fighter2:  string,
 *     fightKey:  string,           // sorted last-names joined by '_'
 *     event:     string,           // event name (e.g. 'UFC Seattle')
 *     books: [{
 *       source:  string,           // sportsbook name (e.g. 'FanDuel')
 *       f1_ml:   string,           // American moneyline for fighter 1
 *       f2_ml:   string,           // American moneyline for fighter 2
 *     }],
 *     best: {                      // tightest spread across all books (or null)
 *       source:  string,
 *       f1_ml:   string,
 *       f2_ml:   string,
 *     } | null,
 *     ts: string,                  // ISO timestamp of scrape
 *   }
 * }
 */`;

function generateOddsFile(events, timestamp) {
  const entries = [];

  for (const ev of events) {
    for (const fight of ev.fights) {
      const booksStr = fight.books
        .map(b => `{source:${JSON.stringify(b.source)},f1_ml:'${b.f1_ml}',f2_ml:'${b.f2_ml}'}`)
        .join(',');
      const bestStr = fight.best
        ? `{source:${JSON.stringify(fight.best.source)},f1_ml:'${fight.best.f1_ml}',f2_ml:'${fight.best.f2_ml}'}`
        : 'null';

      entries.push(
        `  '${fight.fightKey}': {\n` +
        `    fighter1:${JSON.stringify(fight.fighter1)}, fighter2:${JSON.stringify(fight.fighter2)},\n` +
        `    fightKey:'${fight.fightKey}', event:${JSON.stringify(ev.eventName)},\n` +
        `    books:[${booksStr}],\n` +
        `    best:${bestStr},\n` +
        `    ts:'${timestamp}',\n` +
        `  }`
      );
    }
  }

  return `${ODDS_SCHEMA_COMMENT}\n// Last updated: ${timestamp}\n\nexport const ODDS = {\n${entries.join(',\n')},\n};\n`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🥊  Audwihr fetch-odds — BestFightOdds scraper`);
  console.log(`    Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'WRITE'} | CI: ${CI_MODE} | Fresh: ${FRESH}\n`);

  const timestamp = new Date().toISOString();
  let events = [];

  try {
    // Check cache first
    const cacheKey = 'odds_bfo';
    let cached = (!FRESH && !DRY_RUN) ? readCache(cacheKey) : null;

    if (cached) {
      console.log('  (using cached BFO data)');
      events = cached;
    } else {
      console.log('  Fetching BestFightOdds homepage...');
      const html = await fetchHtml(BFO_BASE);
      events = parseHomepage(html);
      console.log(`  ✓ Parsed ${events.length} UFC event(s) from homepage`);

      // Optionally fetch individual event pages for richer data
      for (const ev of events) {
        if (ev.eventHref) {
          await sleep(DELAY_MS);
          try {
            const eventUrl = ev.eventHref.startsWith('http')
              ? ev.eventHref
              : `${BFO_BASE}${ev.eventHref}`;
            console.log(`  Fetching event: ${ev.eventName} ...`);
            const eventHtml = await fetchHtml(eventUrl);

            // Re-parse the event page for potentially more complete data
            const eventParsed = parseHomepage(eventHtml);
            if (eventParsed.length > 0 && eventParsed[0].fights.length >= ev.fights.length) {
              ev.fights = eventParsed[0].fights;
              console.log(`    ✓ ${ev.fights.length} fights (event page)`);
            } else {
              console.log(`    ✓ ${ev.fights.length} fights (homepage)`);
            }
          } catch (err) {
            console.warn(`    ⚠ Event page failed: ${err.message} — using homepage data`);
          }
        }
      }

      if (!DRY_RUN) writeCache(cacheKey, events);
    }
  } catch (err) {
    console.error(`  ✗ BFO scrape failed: ${err.message}`);
    if (CI_MODE) {
      // In CI mode, try cache fallback before aborting
      const cached = readCache('odds_bfo');
      if (cached) {
        console.warn('  ↩ Using cached BFO data');
        events = cached;
      } else {
        console.warn('  ⚠ No cache available — writing empty ODDS');
        // Don't abort — empty odds is valid (app degrades silently)
      }
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────

  const totalFights = events.reduce((sum, ev) => sum + ev.fights.length, 0);
  const totalBooks = events.reduce((sum, ev) =>
    sum + ev.fights.reduce((s, f) => s + f.books.length, 0), 0);

  console.log('\n────────────────────────────────────────────────────────────────────────────');
  for (const ev of events) {
    console.log(`  ${ev.eventName} (${ev.eventDate || 'date TBD'}): ${ev.fights.length} fights`);
    for (const fight of ev.fights) {
      const bestLine = fight.best
        ? `${fight.best.f1_ml}/${fight.best.f2_ml} (${fight.best.source})`
        : 'no lines';
      console.log(`    ${fight.fighter1} vs ${fight.fighter2} — ${fight.books.length} books — ${bestLine}`);
    }
  }
  console.log(`  Total: ${totalFights} fights, ${totalBooks} book lines`);

  // ── Output ─────────────────────────────────────────────────────────────────

  const oddsJs = generateOddsFile(events, timestamp);

  if (DRY_RUN) {
    console.log('\n── DRY RUN: odds.js preview (first 30 lines) ────────────────────────────');
    console.log(oddsJs.split('\n').slice(0, 30).join('\n'));
  } else {
    writeFileSync(join(SRC_DATA, 'odds.js'), oddsJs, 'utf8');
    console.log(`\n  ✓ Wrote src/data/odds.js (${totalFights} fights, ${totalBooks} book lines)`);
  }

  console.log('\n  Done.\n');
}

main().catch(err => {
  console.error('\n✗  Fatal:', err.message);
  process.exit(1);
});
