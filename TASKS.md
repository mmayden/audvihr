# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `master`
**Phase:** 13 — Sharing + Export
**Status:** Not started.

### Phase 13 Active Tasks

- [ ] React Router integration (`react-router-dom`)
  - Routes: `/` (menu), `/fighters/:id`, `/compare/:f1id/:f2id`, `/calendar`, `/markets`, `/news`
  - URL params: fighter IDs only (numeric slugs) — no sensitive data, no localStorage state in URLs
  - Preserve existing screen navigation; URL changes on screen transition
  - `noindex` meta tag stays — shareable links are for personal use, not SEO
  - **Security:** validate URL params as integers; reject non-numeric slugs before passing to FIGHTERS lookup
- [ ] Shareable compare URL
  - `/compare/12/7` → opens CompareScreen pre-loaded with those two fighters
  - Copy-to-clipboard button in CompareScreen header (navigator.clipboard.writeText)
  - **Security:** clipboard write is user-initiated only (button click); no auto-write on render
- [ ] Export: checklist + notes as markdown
  - Client-side markdown string from checklist state + notes + fighter names
  - Download via `URL.createObjectURL(new Blob([md], { type: 'text/plain' }))` — no library
  - Revoke object URL after download to avoid memory leak
  - Output includes: fight date, fighters, checklist items (checked/unchecked), notes, edge signals
  - **Security:** all values are text; no HTML generation; no external service receives data
- [ ] Export: CLV log as CSV
  - Client-side CSV string from `readCLVLog()` output
  - Same Blob/createObjectURL download pattern; revoke after download
  - **Security:** client-side only; CSV values must be sanitised against formula injection (prefix values starting with `=`, `+`, `-`, `@` with a single quote)
- [ ] Tests + docs: URL routing smoke tests; export format tested; CHANGELOG updated; `npm audit` clean before merge

---

## ✅ Completed Sprints

### ✅ Phase 12 — Live News Layer (v0.12.0) — 2026-03-16

- [x] News source evaluation: MMA Fighting RSS + MMA Junkie RSS selected; documented in PLANNING.md; `connect-src` updated in `netlify.toml` + `vercel.json`
- [x] `src/utils/newsParser.js` — `stripHtml` (DOMParser textContent only — no innerHTML), `parseRssFeed` (DOMParser application/xml), `classifyCategory`, `classifyRelevance`, `matchFighterName` (last-name, ≥3 chars), `rssItemToNewsItem`; headline ≤160, body ≤600 chars
- [x] `src/hooks/useNews.js` — fetches 2 RSS sources in parallel; 30-min sessionStorage cache (`cache_news_v1`); per-source silent degradation; falls back to static `NEWS` mock when CORS blocks; returns `{ items, loading, isLive }`
- [x] Fighter name matching — last-name `includes()` lookup against FIGHTERS; `fighter_id`/`fighter_name` populated; null on no match
- [x] `NewsScreen.jsx` — consumes `useNews()`; LIVE/MOCK source badge in topbar; per-item LIVE/MOCK badge; filter dropdown derives from live items
- [x] `TabOverview.jsx` — `newsItems` prop; RECENT NEWS section (top 2 matched items) below TRADER NOTES
- [x] `FighterScreen.jsx` — calls `useNews()` once; derives `fighterNews` via `useMemo`; passes to TabOverview
- [x] `eslint.config.js` — `DOMParser` added to browser globals
- [x] Security: all feed content text-extracted only; XSS test coverage (`<script>`, `img onerror`, `javascript:` href) in `newsParser.test.js`
- [x] 308 tests all passing (up from 239); 0 lint errors; build passes (95.22 kB gzipped)

### ✅ Phase 11 — Alerts + Notifications (v0.11.0) — 2026-03-16

- [x] `public/sw.js` — minimal Service Worker (install/activate only; no fetch handler; scope `/`)
- [x] SW registration in `src/main.jsx` — no inline script, no CSP `unsafe-inline`
- [x] `src/utils/alerts.js` — `readAlertsEnabled`, `writeAlertsEnabled`, `readAlertRules`, `writeAlertRules`, `readPrevLines`, `writePrevLines`, `detectMovements()` — pure functions; all localStorage/sessionStorage reads try/catch-wrapped with typed defaults
- [x] `src/hooks/useAlerts.js` — `alertsEnabled`, `alertRules`, `permissionState`, `requestPermission`, `toggleAlerts`, `toggleFightAlert`, `setFightThreshold`; silent degradation when Notification absent/denied
- [x] `MenuScreen.jsx` — ⚙ ALERTS settings panel: global toggle + permission badge + REQUEST button
- [x] `MarketsScreen.jsx` — bell icon per fight card; inline threshold input; calls `useAlerts(oddsData)` for monitoring
- [x] Alert body: string concatenation only — no template-literal HTML tags, no `innerHTML`
- [x] `worker-src 'self'` added to CSP in both `netlify.toml` + `vercel.json`
- [x] `navigator` + `Notification` added to ESLint browser globals
- [x] 239 tests all passing (up from 186); 0 lint errors; 0 CVEs

### ✅ Phase 10 — Mobile + UX Polish (v0.10.0) — 2026-03-16

- [x] `src/hooks/useTheme.js` — persists `'light'|'dark'|'system'` to localStorage; applies `data-theme` on `<html>`; exports `{ theme, toggle, label }`
- [x] `App.jsx` — bottom nav (`.bottom-nav`), hidden desktop / fixed mobile; floating theme toggle (desktop top-right); `navTo()` helper clears deep-fighter state
- [x] `FighterScreen.jsx` + `CalendarScreen.jsx` — `sidebarOpen` state, ROSTER/EVENTS topbar button, `.sidebar-backdrop`, `.sidebar--open`
- [x] Portrait support in FighterScreen — `<img>` when `sel.portrait` set; 2-letter JetBrains Mono initials fallback
- [x] `app.css` — light-theme CSS variable set + `prefers-color-scheme` fallback; `@media (max-width: 767px)` responsive block; `fighter-link` → `--blue`; `.flag-value` + `.stat-cell-attr-val` → `font-family: var(--mono)`
- [x] `FighterScreen.test.jsx` + `App.test.jsx` + `useTheme.test.js` added (35 new tests)
- [x] 186 tests all passing; 0 lint errors; 0 CVEs; `vi.hoisted()` pattern documented

### ✅ Phase 9 — Roster Expansion + Public Signal (v0.9.0) — 2026-03-16

- [x] Opening line preservation — `appendOpeningLine` + `readOpeningLines` in `clv.js`; `useOdds` writes on first fetch; MarketsScreen SPORTSBOOK column shows "OPEN f1ml / f2ml"
- [x] "NOT IN ROSTER" badge on live-only stub fight rows in MarketsScreen
- [x] Roster expansion — 55 new fighters (IDs 15–69), all 8 weight classes, 69/69 scraped OK; archetype/mod/qualitative flags verified
- [x] Tapology community % — build-time scrape; `scrapeTapologyEventPct()` + `matchTapologyPct()`; `tapology_pct` embedded in `events.js`; MarketsScreen PUBLIC row + FADE badge (≥15pt divergence)
- [x] 165 tests (all passing), 0 lint errors, 0 audit vulnerabilities; CHANGELOG and TASKS updated

### ✅ Phase 8 — CSS Extraction + Phase 7 Should-Haves (v0.8.0) — 2026-03-16

- [x] Extract inline styles → named CSS classes (~33 style blocks → 35 CSS classes in app.css)
- [x] `src/constants/compareRows.js` — 15 stat-row definitions extracted from CompareScreen
- [x] `opp_quality` field on fight history entries (elite / contender / gatekeeper / unknown)
- [x] `weigh_in` and `judges` fields on event card fight entries (UFC 314–317 covered)
- [x] Edge signal panel in CompareScreen — `computeEdgeSignals()` (archetype mismatch, modifier flags, market discrepancy); labeled "RESEARCH PROMPT — NOT A PICK"
- [x] CHANGELOG promoted to v0.8.0, TASKS updated

### ✅ Phase 7 — Live Odds + Market Intelligence (v0.7.0) — 2026-03-16

- [x] `src/utils/normalizeOdds.js` — 6 transform/validate functions; 31 tests
- [x] `src/utils/cache.js` — shared sessionStorage helpers; 100% coverage
- [x] `src/utils/clv.js` — shared CLV log helpers; 100% coverage
- [x] `src/hooks/useOdds.js` — The Odds API; silent degradation; sessionStorage cache
- [x] `src/hooks/usePolymarket.js` — Polymarket CLOB; CLV snapshot; lazy history
- [x] `src/hooks/useKalshi.js` — Kalshi REST; CLV snapshot; lazy history; silent degradation
- [x] `src/components/PriceChart.jsx` — SVG sparkline; 9 tests
- [x] Unified market row in MarketsScreen (SPORTSBOOK | POLYMARKET | KALSHI + arb); arb detection; lazy charts; CLV log panel
- [x] TabMarket live prices + auto-loaded history for matched roster fighters
- [x] `VITE_KALSHI_API_KEY` in `.env.example`; CSP updated in `netlify.toml` + `vercel.json`
- [x] 142 tests, 0 lint errors, `npm run build` passes (71 kB gzipped); Merge to `master`, tag v0.7.0

### ✅ Phase 5 — Fighter News Feed (v0.5.0) — complete

- [x] Design NEWS data model (id, date, fighter_id, category, headline, body, source, relevance)
- [x] `src/data/news.js` with full schema comment and 12 mock items (now serves as static fallback for `useNews`)
- [x] `src/screens/NewsScreen.jsx` — sorted news list with fighter links
- [x] Filter by category (fight / injury / camp / weigh-in / result)
- [x] Filter by fighter (select from roster)
- [x] `FighterName` links from news items → fighter profile
- [x] News CSS added to `app.css`

---

## Roadmap

### ✅ Phase 2b — Expand Roster (v0.3.0)
- 14 fighters across 5 weight classes
- LW: Makhachev, Poirier, Pimblett, Oliveira, Gaethje, Tsarukyan
- WW: Muhammad, Edwards, Della Maddalena
- MW: du Plessis | BW: O'Malley, Dvalishvili | HW: Jones, Aspinall

### ✅ Phase 1 — Core Roster + Compare
- Single HTML file, React via CDN
- Dark theme, menu screen
- Fighter roster grid → detail view
- Side-by-side comparison
- Basic trade checklist (12 items)
- 6 mock fighters

### ✅ Phase 2 — Archetype System + Full Profiles + localStorage
- Full data model (60+ data points per fighter)
- Sidebar roster navigation
- 6-tab fighter profiles (Overview, Striking, Grappling, Physical, History, Market)
- Archetype tags (8 primary, 10 modifiers)
- 17-item trade checklist with category grouping
- localStorage persistence (checklist state, odds, notes)
- Manual odds entry with auto implied probability + line movement detection
- Public bet % inflation warning

### ✅ Phase 3 — Fight Calendar (v0.4.0)
- Fight calendar screen, EVENTS data, countdown, promotion filter, fighter links

### ✅ Phase 3a — Vite Migration (v0.4.0)
- Full Vite + React project, 14 modular components, 0 CVEs, deployable to Netlify/Vercel

### ✅ Phase 4 — Markets Dashboard (v0.4.0)
- 8 active UFC markets across Polymarket, Kalshi, Novig
- Moneyline + implied % per platform per fighter
- Cross-platform arb detection (best-of sum < 100%)
- Method props per fight (KO/TKO, Sub, Dec odds)
- Filter by platform, title fights, watchlist; sort by closing/volume/event
- Watchlist persisted to localStorage

### ✅ Phase 5 — Fighter News Feed (v0.5.0)
- 12 mock news items, category + fighter filters, relevance signal, fighter deep links
- `news.js` data file now serves as static fallback for the Phase 12 live `useNews` hook

### ✅ Phase 6 — Live Data Layer (v0.6.0)
- UFCStats build-time scraper (cheerio, native fetch) — no API key required
- Fighter stats auto-populated from live UFCStats pages at build time
- Fight history parsed from full career records
- `scripts/fighter-seed.json` provides editorial fields scraper can't source
- `prebuild` hook: scraper runs automatically before every `npm run build`
- Cache layer for incremental rebuilds; `--fresh` flag for full refresh

---

### ✅ Phase 7 — Live Odds + Market Intelligence (v0.7.0) — merged to master

- Three live hooks: `useOdds` (The Odds API), `usePolymarket` (CLOB, no auth), `useKalshi` (REST)
- `normalizeOdds.js` — 6 transform/validate functions; all return null/[] on invalid input, never throw
- `cache.js` + `clv.js` — shared sessionStorage/localStorage helpers; 100% coverage
- `PriceChart.jsx` — SVG sparkline; no Chart.js dependency
- MarketsScreen: unified 3-column live row; arb across 3 sources; lazy charts; CLV log panel
- TabMarket: live prices + auto-loaded history for matched roster fighters
- CSP updated: 3 API domains in `netlify.toml` + `vercel.json`
- 142 tests, 0 lint errors, `npm run build` passes

### ✅ Phase 8 — CSS Extraction + Phase 7 Should-Haves (v0.8.0) — merged to master

- ~33 inline `style={{}}` blocks → 35 named CSS classes in `app.css`
- `src/constants/compareRows.js` — 15 stat-row definitions extracted from CompareScreen
- `opp_quality`, `weigh_in`, `judges` editorial fields added to seed + scraper
- Edge signal panel in CompareScreen (`computeEdgeSignals()`) — "RESEARCH PROMPT — NOT A PICK"

### ✅ Phase 9 — Roster Expansion + Public Signal (v0.9.0) — merged to master

- 69 fighters live — top 8–10 per division, all 8 active weight classes
- Tapology community % in MarketsScreen with FADE badge (≥15pt public/sportsbook divergence)
- Opening line preservation (`opening_lines` localStorage key, never evicted)
- NOT IN ROSTER badge on live-only stub fight rows
- 165 tests, 0 lint errors, 0 audit vulnerabilities

---

### ✅ Phase 10 — Mobile + UX Polish (v0.10.0) — merged to master

---

### ✅ Phase 11 — Alerts + Notifications (v0.11.0) — merged to master

---

### ✅ Phase 12 — Live News Layer (v0.12.0) — merged to master

---

### Phase 13 — Sharing + Export

**Theme:** Make research shareable and exportable. The tool becomes more useful when a breakdown can be sent to someone or archived.

**Security note: URLs must not encode secrets or sensitive state. Export must be client-side only — no data leaves the browser to a third party. CSV export must guard against formula injection.**

- [ ] React Router integration (`react-router-dom`)
  - Routes: `/` (menu), `/fighters/:id`, `/compare/:f1id/:f2id`, `/calendar`, `/markets`, `/news`
  - URL params: fighter IDs only (numeric slugs) — no sensitive data, no localStorage state in URLs
  - Preserve existing keyboard/screen navigation; URL changes on screen transition
  - `noindex` meta tag stays — shareable links are for personal use, not SEO
- [ ] Shareable compare URL
  - `/compare/12/7` → opens CompareScreen pre-loaded with those two fighters
  - Copy-to-clipboard button in CompareScreen header
- [ ] Export: checklist + notes as markdown
  - Client-side markdown string generation from checklist state + notes + fighter names
  - Download via `URL.createObjectURL(new Blob([markdown], { type: 'text/plain' }))` — no external library needed
  - Revoke object URL after download
  - Output includes: fight date, fighters, checklist items (checked/unchecked), notes, edge signals summary
- [ ] Export: CLV log as CSV
  - Client-side CSV string from `readCLVLog()` output
  - Same Blob download pattern as markdown export
  - Guard CSV cells against formula injection (prefix `=`, `+`, `-`, `@` with `'`)
- [ ] Tests + docs: URL routing smoke tests; export output format tested; CHANGELOG updated; `npm audit` clean before merge

---

## Backlog (Unscheduled — Post Phase 13)

### High value
- [ ] CORS proxy for live news RSS — makes `useNews` actually load live content in production (Phase 12 hook is ready; proxy is the only missing piece)
- [ ] Matchup context engine — archetype-aware auto-warnings in compare view ("WRESTLER vs COUNTER STRIKER — takedown threat flagged + judge venue bias noted")
- [ ] Trend lines in fighter history — stat trajectory over last N fights (requires scraper enhancement to store per-fight stats, not just career averages)
- [ ] Fighter search by stat range (e.g. "TD def > 80%", "SLpM > 5")
- [ ] Opening line database — searchable historical opening lines per fighter across all past fights

### Medium value
- [ ] Chart.js for fighter stat visualizations — stat bars are good but trend charts would make profiles feel modern
- [ ] Keyboard navigation — arrow keys in sidebar, tab key across screens
- [ ] Manual "refresh data" button in app — re-runs scraper locally for same-day stat updates without full rebuild

### Low / nice-to-have
- [ ] Women's divisions roster — Strawweight, Flyweight, Bantamweight
- [ ] Visual reskin pass — final art direction, typographic hierarchy audit
- [ ] Sound design pass — click feedback, confirmation sounds (user opt-in only)

---

## Definition of Done (per phase)

1. All tasks in the sprint are checked off
2. Manual smoke test passes (all screens render, no console errors)
3. localStorage functions correctly (odds/notes/checklist persist on reload)
4. Changes committed to feature branch
5. Merged to `master`, tagged vN.N.N
6. CHANGELOG.md updated
7. New feature branch cut for next phase
