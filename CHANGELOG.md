# CHANGELOG.md — Audwihr

All notable changes to this project. Format: [version] — date — description.

---

## [Unreleased]

---

## [0.12.0] — 2026-03-16

### Phase 12 — Live News Layer

#### Added
- `src/utils/newsParser.js` — pure RSS parsing and sanitization utilities. `stripHtml(str)` extracts text via `DOMParser('text/html').body.textContent` — no markup survives. `parseRssFeed(xmlText)` parses RSS XML via `DOMParser('application/xml')`, returns `[]` on parse error. `classifyCategory(headline, body)` → `'fight'|'injury'|'camp'|'weigh-in'|'result'` by keyword matching. `classifyRelevance(headline, body)` → `'high'|'medium'|'low'`. `matchFighterName(headline, body, fighters)` → `fighter_id|null` by last-name occurrence (≥ 3 chars). `rssItemToNewsItem(rawItem, source, fighters, idx)` — full transform to NewsItem schema with `isLive: true`; headline capped at 160 chars, body at 600 chars.
- `src/hooks/useNews.js` — `useNews()` hook. Fetches MMA Fighting RSS (`https://www.mmafighting.com/rss/current`) and MMA Junkie RSS (`https://mmajunkie.usatoday.com/feed`) in parallel. 30-min sessionStorage cache (`cache_news_v1`). Per-source silent degradation (CORS, network, non-200). Falls back to static `NEWS` mock with `isLive: false` when all sources yield nothing. Returns `{ items, loading, isLive }`.
- `src/screens/NewsScreen.jsx` — updated to consume `useNews()`. Source status badge in topbar (`LOADING` / `LIVE` / `MOCK`). Per-item `LIVE`/`MOCK` badge on each news card. Fighter filter dropdown and filtered list derive from live items.
- `src/tabs/TabOverview.jsx` — added `newsItems` prop (array of up to 2 `NewsItem` objects matched to this fighter). Renders a `RECENT NEWS` section below TRADER NOTES when items are present; each shows category, live/mock badge, date, and headline.
- `src/screens/FighterScreen.jsx` — calls `useNews()` once; derives `fighterNews` (top 2 items matching `sel.id`) via `useMemo`; passes to `TabOverview`.
- `src/styles/app.css` — `.news-source-badge`, `.news-source-badge--live`, `.news-source-badge--mock`, `.news-item-badge`, `.news-item-badge--live`, `.news-item-badge--mock`, `.overview-news-list`, `.overview-news-item`, `.overview-news-meta`, `.overview-news-cat`, `.overview-news-date`, `.overview-news-headline`.
- `netlify.toml` + `vercel.json` — added `https://www.mmafighting.com` and `https://mmajunkie.usatoday.com` to `connect-src`.

#### Security
- Feed content is text-extracted only — `stripHtml()` uses `DOMParser` + `.textContent`; no HTML is passed to the DOM. `dangerouslySetInnerHTML` is not used with feed content.
- XSS inputs tested explicitly: `<script>`, `<img onerror>`, `<a href="javascript:">` — all neutralised in `newsParser.test.js`.

#### Testing
- `src/utils/newsParser.test.js` — 44 tests covering all branches of all 6 exported functions, including XSS attack vectors in title and description fields.
- `src/hooks/useNews.test.js` — 12 tests: initial state, live fetch success (merge + sort + isLive), per-source silent degradation (CORS rejection, HTTP 403, empty RSS), full fallback to mock, and sessionStorage cache hit (no second fetch).

---

## [0.11.0] — 2026-03-16

### Phase 11 — Alerts + Notifications

#### Added
- `public/sw.js` — minimal Service Worker (install + activate only; no fetch handler; scope `/`). Registered in `src/main.jsx` via `navigator.serviceWorker.register` to satisfy browser push-notification infrastructure.
- `src/utils/alerts.js` — pure alert utility module. Exports: `readAlertsEnabled`, `writeAlertsEnabled` (localStorage `alerts_enabled` key); `readAlertRules`, `writeAlertRules` (localStorage `alert_rules` key, shape `{ [fightKey]: { enabled, threshold } }`); `readPrevLines`, `writePrevLines` (sessionStorage `alerts_prev_lines` key, cleared on tab close); `detectMovements(oddsData, prevLines, rules, defaultThreshold)` — returns array of movement objects for fights whose F1 moneyline moved ≥ threshold. All reads are try/catch-wrapped with typed defaults.
- `src/hooks/useAlerts.js` — `useAlerts(oddsData?)` React hook. Manages `alertsEnabled` (global on/off), `alertRules` (per-fight enabled + threshold), `permissionState` (Notification API state), `requestPermission`, `toggleAlerts`, `toggleFightAlert(key)`, `setFightThreshold(key, n)`. On each `oddsData` change: calls `detectMovements`, fires `new Notification(title, { body })` for any movements found, advances the sessionStorage prev-lines snapshot. Silent degradation when Notification API is absent, permission is not `'granted'`, alerts are globally disabled, or no per-fight rule is enabled.
- `src/screens/MenuScreen.jsx` — gear settings panel (`⚙ ALERTS` button in topbar). Shows global on/off toggle (`.alert-settings-toggle`), permission status badge (`.alert-permission-badge`), REQUEST button (shown when permission is `'default'`), and usage hint. Calls `useAlerts()` (settings-only; no oddsData → no monitoring in menu context).
- `src/screens/MarketsScreen.jsx` — bell icon (`.mkt-alert-bell`) per market card header; calls `toggleFightAlert(fightKey)` on click. When alert is enabled, a threshold number input (`.mkt-alert-threshold`) appears inline (default 5 ML points). Calls `useAlerts(oddsData)` to monitor sportsbook lines.
- `src/styles/app.css` — `.mkt-alert-bell`, `.mkt-alert-bell.on`, `.mkt-alert-threshold`, `.alert-settings-panel`, `.alert-settings-row`, `.alert-settings-label`, `.alert-settings-toggle`, `.alert-settings-toggle.on`, `.alert-permission-badge`, `.alert-perm--{granted,denied,default,unsupported}`, `.alert-settings-request-btn`, `.alert-settings-hint`
- `eslint.config.js` — added `navigator` and `Notification` to browser globals.

#### Testing
- `src/utils/alerts.test.js` — 31 tests covering all branches of `readAlertsEnabled`, `writeAlertsEnabled`, `readAlertRules`, `writeAlertRules`, `readPrevLines`, `writePrevLines`, and `detectMovements` (empty input, no rule, no prev line, below threshold, at threshold, shortening direction, drifting direction, multiple fights, missing sportsbook data).
- `src/hooks/useAlerts.test.js` — 21 tests: initial state (localStorage restore, permission states, unsupported), `toggleAlerts` (flip + persistence), `toggleFightAlert` (enable/disable/preserve threshold/persistence), `setFightThreshold` (update + create), `requestPermission` (granted result, no-op when unsupported), notification firing (fires when conditions met, not when globally off, not when permission denied, not when oddsData null).
- 239 total tests, all passing; 0 lint errors; `npm run build` passes (93.83 kB gzipped)

---

## [0.10.0] — 2026-03-16

### Phase 10 — Mobile + UX Polish

#### Added
- `src/hooks/useTheme.js` — `useTheme()` hook: persists user colour-scheme preference (`'light'|'dark'|'system'`) to localStorage via `useLocalStorage`; applies `data-theme` attribute on `<html>` on change; `'system'` removes the attribute so the CSS `prefers-color-scheme` media query takes over; exports `{ theme, toggle, label }`
- `src/App.jsx` — bottom navigation bar (`.bottom-nav`) with 5 screen buttons, hidden on desktop, shown on mobile (< 768 px) as a fixed 56 px bar; floating theme toggle (`.theme-toggle-floating`) fixed top-right on desktop; inline theme toggle (`.bottom-nav-theme`) in bottom nav on mobile; `navTo()` helper clears deep-fighter state on nav-item tap
- `src/screens/FighterScreen.jsx` — `sidebarOpen` state; ROSTER toggle button in topbar (desktop-hidden, mobile-shown); `.sidebar-backdrop` rendered when open; `.sidebar--open` class; `portrait` field support: `portrait-img` when present, `portrait-initials` (first 2 name initials, JetBrains Mono) when null
- `src/screens/CalendarScreen.jsx` — same `sidebarOpen` pattern with EVENTS topbar button
- `src/styles/app.css` — light-theme CSS variable set (`[data-theme="light"]`, 12 token overrides) + `@media (prefers-color-scheme: light)` fallback; `@media (max-width: 767px)` responsive block: bottom nav, mobile `.app` height (`100dvh - 56px`), sidebar overlay, compact hero card, fight log column reduction, compare stacking, padding reduction; `fighter-link` changed to `var(--blue)` (amber down to 2 semantic meanings); `.flag-value` + `.stat-cell-attr-val` get `font-family: var(--mono)` (typography consistency)
- `scripts/fighter-seed.json` schema — `portrait` field documented (nullable, self-hosted in `/public/assets/portraits/`, no CSP change)

#### Testing
- `src/hooks/useTheme.test.js` — 9 tests: system default, localStorage restore, toggle directions, label values, persistence
- `src/App.test.jsx` — 5 tests: bottom nav labels, navigation on tap, active class, toggle buttons present, `data-theme` set on toggle
- `src/screens/FighterScreen.test.jsx` — 7 tests: initials fallback, portrait img, max-2 initials, ROSTER button, backdrop opens/closes, `sidebar--open` class
- 186 total tests, all passing; 0 lint errors


---

## [0.9.0] — 2026-03-16

### Phase 9 — Roster Expansion + Public Signal

#### Added
- `src/utils/clv.js` — `appendOpeningLine(fightKeyStr, f1ml, f2ml, ts)`: writes a one-time opening-line snapshot to `opening_lines` localStorage key; no-op if fightKey already present (never overwrites the true opening). `readOpeningLines()`: reads all stored opening lines; returns `{}` on missing/invalid. `CLV_OPENING_KEY` constant exported.
- `src/hooks/useOdds.js` — after every fresh API fetch, calls `appendOpeningLine` for each fight with sportsbook prices; cache hits do not re-write (first-fetch-only semantic preserved)
- `src/screens/MarketsScreen.jsx` — opening line displayed in SPORTSBOOK column ("OPEN -130 / +110") when stored; "NOT IN ROSTER" badge on live-only stub fight rows; Tapology public picks row: "PUBLIC Fighter 68% / Opponent 32%" below arb row when `tapology_pct` present; amber `var(--accent)` + FADE badge when |public_pct − sportsbook_implied| ≥ 15pt; `tapologyByKey` IIFE at module level (static derived map — no useMemo); EVENTS imported
- `src/styles/app.css` — `.mkt-opening-line`, `.mkt-not-in-roster`, `.mkt-public-row`, `.mkt-public-row--fade`, `.mkt-public-label`, `.mkt-public-sep`, `.mkt-public-fade-badge` CSS classes added
- `scripts/fighter-seed.json` — 55 new fighter entries (IDs 15–69) covering all 8 active weight classes; editorial data complete (archetype, mods, chin, cardio, weight_cut, trader_notes, history_overrides). UFCStats URLs sourced for all 55 via letter-page pagination + UFC 311 event page for Moicano (listed under Carneiro). All `"pending"` flags removed. 69/69 fighters now have live UFCStats stats. Divisions: FLW (7), BW (7), FW (7), LW (4), WW (7), MW (9), LHW (7), HW (8).
- `scripts/fetch-data.js` — `"pending": true` flag support: fighters with this flag are skipped cleanly (log message only, no error pushed, no CI abort); `scrapeTapologyEventPct(eventName)` — fetches Tapology `#sectionPicks` with browser Chrome UA (default UA returns 403), parses `.chartRow` pairs for last-name labels + pick% (SVG heights decorative — use `.number` text); `matchTapologyPct(ufcName, tapMap)` — fuzzy matches UFCStats full names to Tapology labels via NFD-normalized last name; integrated into `scrapeUpcomingEvents()` after each event scrape, degrades silently on failure; `fetchHtmlBrowser()` helper added

#### Testing
- `src/utils/clv.test.js` — 11 new tests for `appendOpeningLine` and `readOpeningLines`: first-write, no-overwrite, multi-fight, default-ts, missing-args, invalid-JSON, round-trip read; 161 total tests (up from 142), all passing
- `src/screens/MarketsScreen.test.jsx` — 4 new Phase 9 targeted tests: NOT IN ROSTER badge (live-only stub fight), opening line display (localStorage-seeded, matched live fight), Tapology PUBLIC row (mocked EVENTS with tapology_pct), FADE badge (public/sportsbook ≥15pt divergence). Hook mocks refactored to vi.fn() for per-test override via vi.mocked(); EVENTS mocked at module level to inject tapology_pct. 165 total tests, all passing.

#### Verification
- Editorial data for all 55 new fighters (IDs 15–69) reviewed: archetypes, modifier flags, chin/cardio/weight_cut qualitative ratings confirmed accurate against fighter profiles.

---

## [0.8.1] — 2026-03-16

### Code Quality
- `ChecklistPanel`, `CalendarScreen`, `CompareScreen`, `FighterScreen`, `MarketsScreen` — converted from `export function` to `export const` arrow functions (CLAUDE.md standard; all 5 were missed in the v0.8.0 commit)
- `MarketsScreen` — JSDoc block relocated from above module-level constants to directly above the component declaration

### Testing
- `src/components/ErrorBoundary.test.jsx` — 5 new tests: children pass-through, default fallback UI, custom fallback prop, RETRY button reset cycle, unknown-error message; coverage 0% → 100%
- `src/utils/normalizeOdds.test.js` — 7 new edge-case tests for `extractNamesFromQuestion` and `cleanName` (non-string question input, event-context stripping, dash separator, `defeat`/`win against` patterns); branch coverage improved

### Docs & Planning
- `PLANNING.md` — Vision statement (north star, what Audwihr replaces, what it is not); competitive landscape expanded to full platform breakdown (UFCStats, Tapology, Sherdog, FightMatrix, MMA Decisions, BestFightOdds, Action Network, OddsJam, Unabated, OddsShark, Oddible, Polymarket, Kalshi); Research Findings section (community sentiment, market size, sharp bettor workflow); Phase 9–13 roadmap outline with per-phase security notes; Security Model updated with anticipated Phase 9–13 attack surfaces; 7 new decisions log entries
- `TASKS.md` — Phase 9–13 added to roadmap with full task lists; backlog reorganized post-Phase-13

---

## [0.8.0] — 2026-03-15

### Changed
- Inline styles → named CSS classes extraction across all 13 affected files (Phase 8). ~33 static `style={{}}` blocks replaced with 35 new semantic CSS classes in `app.css`. Dynamic/computed styles (archetype colors, countdown colors, org badge colors, stat conditional colors) correctly kept inline. Unblocks mobile layout and theming work. JS bundle −2 kB; CSS +4 kB.
- `scripts/fetch-data.js` — `mergeFighter()` applies `history_overrides`; `serializeFighter()` emits `opp_quality` when present; `serializeFight()` emits optional `weigh_in` / `judges`; new `applyEventOverrides()` helper; `generateEventsFile()` accepts overrides arg; schema comments updated

### Added (Phase 7 should-haves)
- `src/constants/compareRows.js` — 15 stat-row definitions extracted from `CompareScreen`; each is a `(f1, f2) → row` function; zero behavior change
- `opp_quality` field on fight history entries — editorial label (elite / contender / gatekeeper / unknown) per opponent; stored in `scripts/fighter-seed.json` as `history_overrides` and merged at build time; emitted in `fighters.js`
- `weigh_in` and `judges` fields on event card fight entries — stored in `scripts/fighter-seed.json` as `event_overrides`; applied by `applyEventOverrides()` in `fetch-data.js`; UFC 314–317 covered
- Edge signal panel in `CompareScreen` — `computeEdgeSignals()` fires on stat-row edge (contested row win count), archetype matchup (WRESTLER vs COUNTER STRIKER, PRESSURE FIGHTER vs KICKBOXER, etc.), modifier flags (DURABILITY RISK, FRONT-RUNNER, LATE BLOOMER), and market discrepancy (≥15pt gap between implied% and stat-row share when ml_current is set); panel labeled "RESEARCH PROMPT — NOT A PICK"

---

## [0.7.0] — 2026-03-15

### Added
- `src/hooks/useOdds.js` — The Odds API hook; live UFC moneylines; sessionStorage cache (15-min TTL); degrades silently when key absent or quota exceeded; `refetch()` for manual cache bust
- `src/hooks/usePolymarket.js` — Polymarket CLOB hook; active UFC markets, no auth; sessionStorage cache (10-min TTL); CLV snapshots to localStorage on every fresh fetch; lazy `fetchHistory(conditionId, tokenId)`
- `src/hooks/useKalshi.js` — Kalshi REST API hook; fetches across `KXUFC`/`KXMMA` series; sessionStorage cache; CLV snapshots; lazy `fetchHistory(ticker)`; degrades silently when key absent
- `src/utils/normalizeOdds.js` — `fightKey()`, `probToML()`, `normalizeOddsApiResponse()`, `normalizePolymarketMarket()`, `normalizeKalshiMarket()`, `normalizePriceHistory()` — defensive transform/validate; all return null/[] on invalid input, never throw
- `src/utils/cache.js` — `readCache()`, `writeCache()`, `evictCache()` — shared sessionStorage cache helpers with configurable TTL; 100% coverage
- `src/utils/clv.js` — `appendCLVEntries()`, `readCLVLog()` — CLV log persistence helpers; cap at 500 entries; 100% coverage
- `src/components/PriceChart.jsx` — SVG sparkline; 50% reference line; area fill; terminal dot; configurable color/height; `< 2 data points` fallback; no chart.js dependency
- `VITE_KALSHI_API_KEY` added to `.env.example` with inline documentation; `!.env.example` negation added to `.gitignore`
- 142 tests total (up from 97); all passing — 31 new tests across normalizeOdds, cache, clv, PriceChart, MarketsScreen (smoke), and fetchHistory paths in all three hooks

### Changed
- `src/screens/MarketsScreen.jsx` — unified three-column live market row (SPORTSBOOK | POLYMARKET | KALSHI); `LivePriceCell` at module scope; arb detection across all three live sources; lazy price history chart per card (expand/collapse); CLV log panel (top-100 recent snapshots); live fights merged with mock MARKETS, live-only fights appended as price-only stubs; `● LIVE` indicator; falls back to mock platform rows when all APIs offline
- `src/tabs/TabMarket.jsx` — live price display added (Polymarket + Kalshi current price when fighter matched by last name); price history charts auto-loaded for matched fighters; manual entry unchanged
- `netlify.toml` + `vercel.json` — CSP `connect-src` updated: `https://api.the-odds-api.com https://clob.polymarket.com https://trading-api.kalshi.com`
- `eslint.config.js` — browser globals extended (`sessionStorage`, `fetch`, etc.); test-file config adds `global` and `process`
- `MenuScreen.jsx` — version badge updated to `v0.7.0 — LIVE ODDS`

### Security
- Kalshi API key sent from browser (Authorization header) — accepted constraint for personal/self-hosted tool; documented in PLANNING.md decisions log with remediation scope (proxy required if ever multi-user)
- PLANNING.md security table updated to reflect Phase 7 API key status

### Planning context (recorded 2026-03-15)
- Phase 7 scope was expanded from The Odds API only → three-API unified market view after competitive landscape review
- Polymarket CLOB `/prices-history` endpoint confirmed live (no auth) — enables probability movement charts
- Kalshi historical market endpoints confirmed available (free API key)
- Oddible (2026) assessed — tracker category, not research OS; validates market direction without occupying Audwihr's intersection

---

## [0.6.2] — 2026-03-15

### Code Quality
- All components converted from `export function` to `export const` arrow function style (CLAUDE.md standard): `StatBar`, `FighterName`, `TabOverview`, `TabStriking`, `TabGrappling`, `TabPhysical`, `TabHistory`, `TabMarket`, `MenuScreen`, `NewsScreen`
- `RELEVANCE_COLOR` and `CATEGORY_COLOR` extracted from `NewsScreen` into `src/constants/qualifiers.js` alongside `CHIN_COLOR`, `CARDIO_COLOR`, etc. (CLAUDE.md: shared constants belong in `src/constants/`)
- `MenuScreen` version badge updated to `v0.6.2`

### Documentation
- `CLAUDE.md`: file structure updated to match actual source tree (added `ErrorBoundary`, `date.js`, `useWatchlist`, `markets.js`, `news.js`, `scripts/`, `test/`; removed retired `ComingSoon.jsx`); Key Constraints rewritten to reflect current state (Vite done, live data live, Phase 7 next); testing note updated; `main` → `master`
- `PLANNING.md`: file structure heading bumped; `utils/` and `components/` blocks updated; security section updated with Phase 7 Odds API guidance; decisions log extended with three v0.6.1 entries

---

## [0.6.1] — 2026-03-15

### Added
- `src/components/ErrorBoundary.jsx` — class component error boundary; wraps all screens in `App.jsx` so a single screen crash cannot take down the entire app; includes RETRY button
- `src/utils/date.js` — shared `daysUntil` / `isPast` utilities extracted from `CalendarScreen` and `MarketsScreen` (was duplicated); `src/utils/date.test.js` with 6 tests

### Fixed
- `CompareScreen`: row property `hi` was silently ignored at line 75 (`r.higherIsBetter` read); all rows now consistently use `higherIsBetter` — Win/lose highlights now correctly apply to Win Streak, SLpM, and Str Absorbed rows

### Code Quality
- `MarketsScreen`: add `isNaN` guard to `parseInt(p.f1_ml)` (CLAUDE.md pattern — maintain `parseInt` with `isNaN` guard)
- `CompareScreen`: rename `f1id`/`f2id` → `fighter1Id`/`fighter2Id`
- `FighterScreen`: rename `wf` → `weightFilter`; pre-compute `q = search.toLowerCase()` outside the inner loop
- `ChecklistPanel`: wrap `done` in `useMemo([checked])`; wrap `toggle` / `reset` in `useCallback`; memoize `cats`; add `useCallback` import

### Testing
- `ChecklistPanel.test.jsx` — 8 tests covering: renders all 17 items and 5 categories, progress counter, toggle on/off, reset, localStorage persistence, per-storageKey isolation

---

## [0.6.0] — 2026-03-15

### Added
- `scripts/fetch-data.js` — UFCStats build-time scraper (Node 18+ ESM, cheerio, native fetch)
  - Fetches fighter stats directly from `ufcstats_url` stored per fighter in seed file
  - Parses: record, age (from DOB), height, reach, stance, all career stat averages
  - Parses full fight history: result, opponent, method, round, event, year
  - Derives: win streak, finish counts (ko/sub/dec), losses_by, finish_rate
  - Normalizes method strings ("TKO - Punches" → "TKO", "U-DEC" → "DEC", etc.)
  - Merges live stats with `scripts/fighter-seed.json` editorial fields (archetype, mods, trader_notes, etc.)
  - Validates all required fields before write; exits non-zero on any error in CI mode
  - 500ms request delay (100ms in CI) to be polite to UFCStats
  - Cache layer: `*.raw.json` per fighter (gitignored) for incremental rebuilds
  - CLI flags: `--dry-run`, `--fresh`, `--ci`
- `scripts/fighter-seed.json` — editorial seed data for 14 fighters
  - `ufcstats_url`, `ufcstats_name`, archetype, mods, camp, country, chin, cardio, weight_cut, trader_notes
  - Extended striking/grappling fields not available from UFCStats (zone distribution, ctrl time, etc.)
- `npm run fetch-data` / `fetch-data:dry` / `fetch-data:fresh` scripts
- `prebuild` hook — scraper runs automatically before `npm run build`
- `cheerio ^1.2.0` added as devDependency
- `.env.example` — documents `VITE_ODDS_API_KEY` placeholder for future Phase 7+ live odds
- `*.raw.json` added to `.gitignore` (scraper cache, not committed)

### Changed
- `src/data/fighters.js` — now a generated file (overwritten by scraper); all 14 fighters use live UFCStats stats
- `src/data/events.js` — now a generated file; upcoming events scraped from UFCStats (0 listed when no scheduled cards)
- Menu version badge: `v0.5.0 — MOCK DATA` → `v0.6.0 — LIVE DATA`

### Code Quality (standards cleanup from Phase 5 branch)
- `CompareScreen`: wrap `rows` derived array in `useMemo` (was rebuilt on every render)
- `FighterScreen`: `function pick` → `const pick` arrow (CLAUDE.md component-scope rule)
- `FighterScreen`: replace hardcoded `'#555'` fallback with `var(--border2)` / `var(--text-dim)` CSS variables
- `PLANNING.md`: rewrite Architecture Philosophy to reflect post-Vite state; remove `ComingSoon.jsx` from file structure

---

## [0.5.0] — 2026-03-15

### Added
- `NewsScreen` — fighter news feed with category and fighter filters
- `src/data/news.js` — 12 mock news items across injury, camp, fight booking, weigh-in, and result categories
- Category filter chips (ALL / FIGHT / INJURY / CAMP / WEIGH-IN / RESULT) with color-coded badges
- Fighter filter dropdown (populated from news roster)
- Relevance signal per item: HIGH (amber) / MEDIUM (blue) / LOW (dim) — trading signal strength
- `FighterName` links from news items navigate directly to fighter profile
- All 5 menu items now ACTIVE — `ComingSoon` screen no longer used
- News CSS added to `app.css`
- Menu version bumped to v0.5.0

### Code Quality
- Tab components (`TabOverview`, `TabStriking`, `TabGrappling`, `TabPhysical`, `TabHistory`, `TabMarket`) — renamed single-letter prop `f` → `fighter` at API level (CLAUDE.md compliance)
- Static constants extracted from component bodies to module scope: `WEIGHT_FILTERS` (FighterScreen), `SORT_LABELS` + `PLATFORMS` (MarketsScreen), `MENU_ITEMS` (MenuScreen)
- Pure helper functions extracted to module scope with `today` parameter: `fmtDate`, `isPast`, `daysUntil`, `countdown` (CalendarScreen); `fmtVolume`, `computeArb`, `totalVolume`, `daysUntil`, `countdown`, `countdownColor` (MarketsScreen)
- `ARCH_COLORS` and `MOD_COLORS` now reference CSS variables (`var(--blue)`, `var(--green)`, etc.) — eliminates hardcoded hex from constants; `--dark-red` added to design system for BRAWLER / FRONT-RUNNER
- Fixed: line movement arrow in `TabMarket` now correctly shows `▼` for downward moves (was always `▲`)
- Fixed: division-by-zero guard added to sub win rate in `TabGrappling`
- Fixed: `isNaN` guard added to public bet % check in `TabMarket` (CLAUDE.md input validation pattern)
- Fixed: `let lastCat` render mutation in `CompareScreen` replaced with pure index comparison (`i === 0 || rows[i-1].cat !== r.cat`) — Strict Mode safe

---

## [0.4.0] — 2026-03-15

### Added
- `MarketsScreen` — full prediction market dashboard with filter bar and sorted market list
- `src/data/markets.js` — 8 mock markets across UFC 315, Fight Night, UFC 316, UFC 317
- `src/hooks/useWatchlist.js` — localStorage-persisted watchlist by market ID
- Moneyline + implied probability display per platform per fighter
- Cross-platform arbitrage detection: best-of implied sum < 100% triggers ⚡ ARB ALERT
- Method props per fight (KO/TKO, Submission, Decision odds)
- Filter by platform (Polymarket / Kalshi / Novig), title fights only, watchlist only
- Sort by closing date, total volume, or event date (cycling toggle)
- Platform color badges: Polymarket (blue), Kalshi (green), Novig (purple)
- Markets menu item activated (badge: ACTIVE), version bumped to v0.4.0 in menu

### Testing & Tooling
- Vitest 4.1.0 test suite: 32 tests across 5 files, all passing
- ESLint 9 flat config (`eslint.config.js`) — 0 errors on `npm run lint`
- `src/test/setup.js` — in-memory localStorage mock fixes jsdom environment issue
- Test coverage: odds utils (7), StatBar (5), FighterName (4), useLocalStorage (6), useWatchlist (5)
- Testing standards documented in CLAUDE.md

---

## [Unreleased] — Phase 3 + Phase 3a

### Added — Phase 3 (Fight Calendar)
- Fight Calendar screen with full card breakdowns (main event, co-main, prelims, early prelims)
- Static EVENTS data model: 5 events across UFC 314–317 + Fight Night
- Countdown display per event (days until / PAST / TODAY)
- Promotion filter (UFC / Bellator / PFL)
- Fighter name links from calendar → fighter profile (deep navigation)
- Past event styling (dimmed, labeled PAST)

### Added — Phase 3a (Vite Migration)
- Full Vite + React project structure (`package.json`, `vite.config.js`, `index.html`)
- `src/` split into `constants/`, `data/`, `hooks/`, `utils/`, `components/`, `tabs/`, `screens/`
- All 14 components extracted as named exports with JSDoc headers
- Data files with schema comments (`fighters.js`, `events.js`)
- `useLS` renamed to `useLocalStorage` throughout
- `SBar` renamed to `StatBar` throughout
- Security meta tags in `index.html` (`noindex`, `theme-color`, `description`)
- App runs in React StrictMode
- Build output (`dist/`) deployable to GitHub Pages, Netlify, or Vercel
- `netlify.toml` and `vercel.json` with full security header suite (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Upgraded to Vite 6.4.1 + @vitejs/plugin-react 4.7.0 — resolves esbuild CVE GHSA-67mh-4wv8-2f99 (0 vulnerabilities)

### Fixed — Phase 3
- `FighterName` extracted from inside `CalendarScreen` (nested component = remounts on every render)
- Duplicate qualifier color maps removed from `TabOverview` and `TabPhysical` — now shared constants in `src/constants/qualifiers.js`

### Project Standards Established
- Security model documented in PLANNING.md (SRI, CSP plan, supply chain risks)
- CLAUDE.md rewritten with enforced standards for all future sessions: security, code quality, documentation, modular design

---

## [0.3.0] — 2026-03-10

### Added
- 8 new fighters: Charles Oliveira, Justin Gaethje, Arman Tsarukyan (LW); Belal Muhammad, Leon Edwards, Jack Della Maddalena (WW); Jon Jones, Tom Aspinall (HW)
- Roster now spans 5 weight classes: Lightweight, Welterweight, Middleweight, Bantamweight, Heavyweight
- Full data model for each new fighter (60+ data points, 6-fight history, trader notes, archetype/modifier tags)

---

## [0.2.0] — 2026-03-10

### Added
- Full data model: 60+ data points per fighter
- Sidebar roster navigation with search and weight class filter
- 6-tab fighter profiles: Overview, Striking, Grappling, Physical, History, Market
- Archetype system: 8 primary archetypes, 10 modifier tags with color coding
- 17-item trade checklist with 5 category groupings
- localStorage persistence for checklist state, odds, and notes per matchup
- Manual odds entry with auto implied probability calculation
- Line movement detection (open vs current, implied % delta)
- Public bet % inflation warning flag
- Compare screen: full stat table with F1/F2 winner highlighting
- All 5 menu items present (Fighters, Compare, Calendar, Markets, News)
- Coming soon screens for Phase 3–5 features

### Changed
- Complete rebuild from v0.1.0 — new layout, new data model, new component structure
- Menu redesigned: simpler, cleaner, no locked/greyed items

### Fighters (mock data)
- Islam Makhachev (LW Champion)
- Dustin Poirier (LW #3)
- Dricus du Plessis (MW Champion)
- Sean O'Malley (BW #2)
- Merab Dvalishvili (BW Champion)
- Paddy Pimblett (LW #9)

---

## [0.1.0] — 2026-03-09

### Added
- Initial build: single HTML file, React via CDN
- Dark tactical theme (amber-on-black)
- Menu screen with numbered navigation
- Fighter roster: grid of player cards
- Fighter detail view: record breakdown, stats, finish rates
- Fighter comparison: side-by-side stat table
- Trade checklist: 12 items across 5 categories with progress bar
- 6 mock fighters
