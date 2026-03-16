# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `master`
**Phase:** 9 — Roster Expansion + Public Signal
**Status:** Active. v0.8.1 docs/standards cleanup committed. Phase 9 kick-off 2026-03-16.

### Phase 9 Active Tasks

- [x] Opening line preservation in CLV log
  - [x] `appendOpeningLine(fightKey, f1ml, f2ml, timestamp)` + `readOpeningLines()` in `src/utils/clv.js`
  - [x] `useOdds.js` writes opening snapshot on first fetch (no-op if already stored)
  - [x] MarketsScreen SPORTSBOOK column shows "OPEN -130 / +110" when opening line stored
  - [ ] TabMarket shows opening line delta alongside current line (deferred — TabMarket reads from localStorage separately)
- [x] "NOT IN ROSTER" stub fighter shape for non-roster fighters from The Odds API
  - [x] MarketsScreen renders "NOT IN ROSTER" badge on live-only stub fight rows
- [ ] Roster expansion — top 10 per active weight class (~60 fighters total)
  - [x] Editorial seed data written for 55 new fighters (IDs 15–69), all 8 weight classes
  - [x] `fetch-data.js` — `"pending": true` flag support to skip URL-less entries cleanly
  - [x] Source UFCStats URLs for all 55 pending fighters and remove `"pending"` flags — scraped via UFCStats letter pages (with pagination) + event page for Moicano (listed as Carneiro; found via UFC 311 event page)
  - [x] Run `npm run fetch-data:fresh` to populate all new fighters with live stats — 69/69 OK, 0 warnings
  - [ ] Verify archetype/mod assignments and qualitative flags after scrape
- [x] Tapology community % column in MarketsScreen — build-time scrape (CORS rules out runtime; decision logged in PLANNING.md)
  - [x] Add `scrapeTapologyEventPct()` to `fetch-data.js` — scrapes Tapology #sectionPicks via browser UA; `.chartRow` pairs give last name + pick%; `matchTapologyPct()` fuzzes UFCStats name to label
  - [x] Embed `tapology_pct: { f1: number, f2: number }` per fight in generated `events.js` (via `serializeFight()`)
  - [x] MarketsScreen shows "PUBLIC Fighter 68% / Opponent 32%" row per fight card when `tapology_pct` is present
  - [x] Fade-signal logic: if |public_pct - sportsbook_implied| ≥ 15pt, render row in `var(--accent)` amber + FADE badge
- [ ] Tests + docs: all new utils covered; JSDoc on any new components; CHANGELOG updated
- [ ] `npm audit` clean, `npm run lint` 0 errors before merge

---

### ✅ Phase 8 — CSS Extraction + Phase 7 Should-Haves (v0.8.0) — merged to master

- [x] Extract inline styles → named CSS classes (~33 style blocks → 35 CSS classes in app.css)
- [x] `src/constants/compareRows.js` — 15 stat-row definitions extracted from CompareScreen
- [x] `opp_quality` field on fight history entries (elite / contender / gatekeeper / unknown)
- [x] `weigh_in` and `judges` fields on event card fight entries (UFC 314–317 covered)
- [x] Edge signal panel in CompareScreen — `computeEdgeSignals()` (archetype mismatch, modifier flags, market discrepancy); labeled "RESEARCH PROMPT — NOT A PICK"
- [x] CHANGELOG promoted to v0.8.0, TASKS updated, memory updated

---

### ✅ Phase 7 — Live Odds + Market Intelligence (v0.7.0) — merged to master

**Must Have — done:**
- [x] Cut branch `feature/phase-7-live-odds`
- [x] `src/utils/normalizeOdds.js` — 6 transform/validate functions; 31 tests
- [x] `src/utils/cache.js` — shared sessionStorage helpers; 100% coverage
- [x] `src/utils/clv.js` — shared CLV log helpers; 100% coverage
- [x] `src/hooks/useOdds.js` — The Odds API; silent degradation; sessionStorage cache
- [x] `src/hooks/usePolymarket.js` — Polymarket CLOB; CLV snapshot; lazy history
- [x] `src/hooks/useKalshi.js` — Kalshi REST; CLV snapshot; lazy history; silent degradation
- [x] `src/components/PriceChart.jsx` — SVG sparkline; 9 tests
- [x] Unified market row in MarketsScreen (SPORTSBOOK | POLYMARKET | KALSHI + arb)
- [x] Arb detection across all three live sources
- [x] Lazy price history charts in MarketsScreen (expand/collapse per card)
- [x] Price history charts in fighter Market tab (matched by name)
- [x] Personal CLV log panel in MarketsScreen
- [x] All hooks degrade silently; live-only fights shown as price-only stubs
- [x] `VITE_KALSHI_API_KEY` in `.env.example`; CSP updated in `netlify.toml` + `vercel.json`
- [x] 142 tests, 0 lint errors, `npm run build` passes (71 kB gzipped)
- [x] `MenuScreen` version badge → `v0.7.0 — LIVE ODDS`
- [x] Merge to `master`, tag v0.7.0

### ✅ Phase 7 — Should Have — complete

- [x] Move compare stat rows to `src/constants/compareRows.js` (config-driven, zero behavior change)
- [x] Add `opp_quality` field to fight history entries in `scripts/fighter-seed.json` (elite / contender / gatekeeper / unknown)
- [x] Add `weigh_in` result field to event fight card entries in `scripts/fighter-seed.json` (missed / made / under)
- [x] Add `judges: []` field to event card data in seed (manual — enables decision prop research)
- [x] Simple client-side edge score in CompareScreen — stat rows + archetype + flags + market discrepancy → research prompt panel, not a pick

---

## ✅ Completed Sprints

### ✅ Phase 5 — Fighter News Feed (v0.5.0) — complete
- [x] Design NEWS data model (id, date, fighter_id, category, headline, body, source, relevance)
- [x] `src/data/news.js` with full schema comment and 12 mock items
- [x] `src/screens/NewsScreen.jsx` — sorted news list with fighter links
- [x] Filter by category (fight / injury / camp / weigh-in / result)
- [x] Filter by fighter (select from roster)
- [x] `FighterName` links from news items → fighter profile
- [x] News CSS added to `app.css`
- [x] Menu badge updated to ACTIVE, version bumped to v0.5.0
- [x] `npm run build` passes — 66 kB gzipped
- [x] ESLint clean (0 errors, 0 warnings)
- [x] Smoke test: filters work, fighter link navigates correctly
- [x] Commit and merge to `master`, tag v0.5.0

---

### expand-roster — complete
- [x] Add fighters — Lightweight division (Oliveira, Gaethje, Tsarukyan)
- [x] Add fighters — Welterweight division (Muhammad, Edwards, Della Maddalena)
- [x] Add fighters — Heavyweight (Jones, Aspinall)
- [x] Verify all fighter data internally consistent
- [x] Merged to `main`, tagged v0.3.0

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
**Branch:** `feature/phase-4-markets`

- 8 active UFC markets across Polymarket, Kalshi, Novig
- Moneyline + implied % per platform per fighter
- Cross-platform arb detection (best-of sum < 100%)
- Method props per fight (KO/TKO, Sub, Dec odds)
- Filter by platform, title fights, watchlist; sort by closing/volume/event
- Watchlist persisted to localStorage

### ✅ Phase 5 — Fighter News Feed (v0.5.0)
- 12 mock news items, category + fighter filters, relevance signal, fighter deep links

### ✅ Phase 6 — Live Data Layer (v0.6.0)
**Branch:** `feature/phase-6-live-data`

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

### Nice to Have (from Phase 7) — Absorbed into Phase 9

- [ ] Tapology community % column in MarketsScreen as "public money" fade signal → Phase 9
- [ ] Export checklist + notes + CLV log as markdown (download link) → Phase 13
- [ ] "Archetype unknown" stub fighter shape for non-roster fighters from The Odds API → Phase 9

---

## Roadmap

### Phase 9 — Roster Expansion + Public Signal (next)

**Theme:** Make Audwihr useful on any given UFC card, not just the 14 seeded fighters.

- [ ] Expand fighter roster to top 10 per active weight class (target: ~60 fighters total)
  - Divisions: Flyweight, Bantamweight, Featherweight, Lightweight, Welterweight, Middleweight, LHW, Heavyweight (men's)
  - Add editorial seed entries to `scripts/fighter-seed.json` for each fighter
  - Run `npm run fetch-data:fresh` to populate stats from UFCStats
  - Verify all archetype/mod assignments and qualitative flags (chin, cardio, weight_cut)
- [ ] Tapology community % column in MarketsScreen
  - Evaluate: build-time scrape (same pattern as UFCStats) vs. runtime fetch
  - If runtime: add `https://www.tapology.com` to `connect-src` in `netlify.toml` + `vercel.json`
  - If build-time: add scraper helper to `fetch-data.js`; co-locate with event data generation
  - Column renders next to sportsbook implied %: "PUBLIC 68%" in dim text with fade-signal logic
- [ ] Opening line preservation in CLV log
  - When a fight's opening line is first fetched by `useOdds`, write the opening snapshot to localStorage alongside the session snapshots
  - Extend `clv.js` helpers: `appendOpeningLine(fightKey, f1ml, f2ml, timestamp)`
  - Display opening line in MarketsScreen fight row and TabMarket: "OPEN -130 → CURRENT -155"
- [ ] "Archetype unknown" stub fighter shape for non-roster fighters from The Odds API
  - MarketsScreen renders a minimal stub row for live fights with no roster match: name, moneylines, implied %
  - No archetype, no stats, no checklist — clearly labeled "NOT IN ROSTER"
- [ ] Tests + docs: all new utils covered; JSDoc on any new components; CHANGELOG updated
- [ ] `npm audit` clean, `npm run lint` 0 errors before merge

---

### Phase 10 — Mobile + UX Polish

**Theme:** Make Audwihr usable during fight week on a phone. The research happens on mobile.

- [ ] Responsive layout — sidebar collapses to bottom navigation bar on viewports < 768px
  - CSS media queries only (no JS resize listeners) — all layout in `app.css`
  - Bottom nav: Fighters | Compare | Calendar | Markets | News
  - FighterScreen sidebar becomes a scrollable top sheet or filtered list on mobile
- [ ] Fighter portrait images
  - Evaluate hosting: Cloudinary (add `img-src https://res.cloudinary.com` to CSP) vs. `public/assets/` self-hosted (no CSP change)
  - Add `portrait` field to fighter-seed.json schema; keep nullable (no portrait = initials fallback)
  - Portrait displays in FighterScreen hero card and sidebar roster item
- [ ] Visual hierarchy audit
  - Typography consistency pass: mono vs sans across all stat labels and values
  - Accent usage audit: amber should not be used for more than 2 distinct semantic meanings
  - Spacing and density pass on TabOverview and CompareScreen (densest screens)
- [ ] Dark/light theme toggle
  - CSS variable swap only — all colors already tokenized, zero JS required
  - System preference default (`prefers-color-scheme`); manual toggle persisted to localStorage
- [ ] Tests + docs: smoke tests for all screens at mobile viewport; CHANGELOG updated

---

### Phase 11 — Alerts + Notifications

**Theme:** Line movement alerts. The #1 most-requested feature in MMA betting communities. BestFightOdds has never built it.

- [ ] Service Worker registration
  - SW scope limited to `/`; only fetches from existing `connect-src` domains
  - `npm run build` output includes SW registration in `main.jsx` (not inline script — no CSP `unsafe-inline`)
- [ ] Browser Notification API integration
  - Request permission on first use; respect denial gracefully (no re-prompt spam)
  - Alert content: `textContent` only — never `innerHTML` with any variable content
- [ ] Line movement alert rules
  - User-configurable threshold per fight (default: ±5 moneyline points)
  - Alert fires when: (a) line moves beyond threshold, (b) new fight line opens for watchlisted event, (c) fight is cancelled/removed
  - Alerts stored in sessionStorage; dismissed on click; no persistent notification log needed
- [ ] Alert settings UI
  - Toggle alerts per fight in MarketsScreen (bell icon on each row)
  - Global on/off toggle in a settings panel (new gear icon in MenuScreen)
  - Settings persisted to localStorage via `useLocalStorage`
- [ ] Tests + docs: alert rule logic unit-tested; SW registration tested in jsdom; CHANGELOG updated; CSP review documented

---

### Phase 12 — Live News Layer

**Theme:** Replace the 12 mock news items with real camp news, injury reports, and weigh-in results surfaced in context.

**Security note: external feed content is untrusted. All fetched content must be text-extracted only — no HTML pass-through to DOM. `dangerouslySetInnerHTML` is prohibited with feed content.**

- [ ] News source evaluation: MMA Fighting RSS, ESPN MMA RSS, UFC.com news
  - Select 2–3 sources; document in PLANNING.md with `connect-src` entries required
  - Add all selected domains to `connect-src` in `netlify.toml` + `vercel.json`
- [ ] `useNews` hook (`src/hooks/useNews.js`)
  - Fetches RSS feeds via browser `fetch`; parses XML → JS objects; sessionStorage cache (30-min TTL)
  - **Sanitization:** extract `title`, `pubDate`, `description` as text only — strip all HTML tags before storing; use `DOMParser` to parse RSS XML (safe for structured XML, not HTML)
  - Degrade silently when sources unreachable; fall back to `src/data/news.js` mock
  - Map fetched items to existing NEWS schema: `{ id, date, category, headline, body, source, relevance }`
- [ ] Fighter name matching in news items
  - Match fetched news items to roster fighters by name (fuzzy match on last name); populate `fighter_id`
  - Unmatched items have `fighter_id: null` — visible in ALL filter but not fighter filter
- [ ] NewsScreen renders live items with "LIVE" badge vs. mock items with "MOCK" badge during transition
- [ ] Fighter profile integration: TabOverview shows latest 2 news items matched to this fighter
- [ ] Tests + docs: sanitization function fully tested (including XSS attempt inputs); `useNews` hook tested with mocked fetch; CHANGELOG updated

---

### Phase 13 — Sharing + Export

**Theme:** Make research shareable and exportable. The tool becomes more useful when a breakdown can be sent to someone or archived.

**Security note: URLs must not encode secrets. Export must be client-side only — no data leaves the browser to a third party.**

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
  - Output includes: fight date, fighters, checklist items (checked/unchecked), notes, edge signals summary
- [ ] Export: CLV log as CSV
  - Client-side CSV string from `readCLVLog()` output
  - Same Blob download pattern as markdown export
- [ ] Tests + docs: URL routing smoke tests; export output format tested; CHANGELOG updated; `npm audit` clean before merge

---

## Backlog (Unscheduled — Post Phase 13)

### High value
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
5. Merged to `master` with `--no-ff`, tagged vN.N.N
6. CHANGELOG.md updated
7. New feature branch cut for next phase
