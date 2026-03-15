# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `feature/phase-8-css-extraction`
**Status:** Inline styles → CSS classes pass complete. Ready to merge.

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

## 🔲 Phase 7 — Live Odds + Market Intelligence

**Branch:** `feature/phase-7-live-odds` (not yet cut)
**Scope revision:** Expanded from The Odds API only → full three-API unified market view + historical price charts + personal CLV log. See BRAINSTORMING.md §8 for full rationale.

**APIs:**
- The Odds API — `VITE_ODDS_API_KEY` (placeholder in `.env.example`). 500 req/month free.
- Polymarket CLOB API — no auth for reads. `https://clob.polymarket.com`. `/prices-history` endpoint live.
- Kalshi REST API — `VITE_KALSHI_API_KEY` (add to `.env.example`). Free API key at trading-api.kalshi.com.

### Must Have — Core Differentiator

**Hooks (data layer)**
- [x] Cut branch `feature/phase-7-live-odds`
- [x] `src/hooks/useOdds.js` — The Odds API moneylines; cache in `sessionStorage`; graceful degradation if key absent or quota exceeded
- [x] `src/hooks/usePolymarket.js` — Polymarket CLOB current prices + `/prices-history`; cache current prices in `sessionStorage`; persist CLV snapshots to `localStorage`
- [x] `src/hooks/useKalshi.js` — Kalshi current + historical prices; cache in `sessionStorage`; graceful degradation if key absent

**Transform / validation utils**
- [x] `src/utils/normalizeOdds.js` — `normalizeOddsApiResponse()`, `normalizePolymarketMarket()`, `normalizeKalshiMarket()`, `normalizePriceHistory()`, `fightKey()`, `probToML()`: validate + reshape raw API responses; 29 tests covering all shapes

**Display**
- [x] Unified market row in MarketsScreen — one row per fight, columns: Sportsbook | Polymarket | Kalshi + arb alert
- [x] Arb detection updated to compare across all three live sources (not just mock platforms)
- [x] Probability movement line chart in MarketsScreen (Polymarket + Kalshi price history, lazy-loaded per card)
- [x] Same price history chart in fighter Market tab for roster fighters
- [x] Personal CLV log view in MarketsScreen — top-100 recent snapshots (toggle button in topbar)

**Fallback + roster handling**
- [x] All three hooks degrade silently to mock/manual data if API unavailable
- [ ] "Archetype unknown — stats only" stub fighter shape for non-roster fighters returned by The Odds API (live-only fights shown as stubs in MarketsScreen — name + prices, no editorial layer)

**Infrastructure**
- [x] `VITE_KALSHI_API_KEY` added to `.env.example` with documentation comment
- [x] CSP updated: `connect-src https://api.the-odds-api.com https://clob.polymarket.com https://trading-api.kalshi.com` in `netlify.toml` + `vercel.json`
- [x] Tests: all three hooks (mock fetch, error/quota, empty response, malformed response) — 29 normalizer + 20 hook tests
- [x] Lint clean, all tests pass, `npm run build` passes
- [ ] Merge to `master`, tag v0.7.0

### Should Have — High Value, Low Lift

- [ ] Move compare stat rows to `src/constants/compareRows.js` (zero behavior change, config-driven)
- [ ] Add `opp_quality` field to fight history entries in `scripts/fighter-seed.json` per fighter (elite / contender / gatekeeper / unknown)
- [ ] Add `weigh_in` result field to event fight card entries in `scripts/fighter-seed.json` (missed / made / under)
- [ ] Add `judges: []` field to event card data in seed (manual curation — enables decision prop research)
- [ ] Simple client-side edge score in CompareScreen — weighted rules: archetype mismatch + market discrepancy + flag count → displayed as research prompt, not a pick

### Nice to Have — If Time Allows

- [ ] Tapology community % column in MarketsScreen as "public money" fade signal
- [ ] Export checklist + notes + CLV log as markdown (download link)

---

## Backlog (Unscheduled)

### High value
- [ ] Matchup context engine — archetype-aware auto-warnings in compare view ("WRESTLER vs COUNTER STRIKER — takedown threat flagged + judge venue bias noted")
- [ ] Trend lines in fighter history — stat trajectory over last N fights (requires scraper enhancement to store per-fight stats, not just career averages)
- [ ] Fighter portrait images — hosting solution TBD (Cloudinary / repo assets); even UFC site headshots would make profiles feel premium
- [ ] Add more fighters — expand to full top-15 per division
- [ ] Fighter search by stat range (e.g. "TD def > 80%", "SLpM > 5")
- [ ] Chart.js for fighter stat visualizations — stat bars are good but trend charts would make profiles feel modern

### Medium value
- [ ] Mobile responsive layout — sidebar collapses to bottom nav on narrow viewports; blocked until inline styles → CSS classes pass is done
- [ ] Inline styles → named CSS classes systematic extraction — required for mobile and theming; currently JSX carries layout/typography decisions that belong in app.css
- [ ] React Router / URL state — bookmarkable fighter profiles, shareable compare URLs; defer until personal/shareable decision is made
- [ ] Export trade notes as PDF or markdown (checklist + notes + CLV log)
- [ ] Dark/light theme toggle — CSS variable swap, all colors already tokenized; blocked on inline styles pass

### Low / nice-to-have
- [ ] Keyboard navigation — arrow keys in sidebar, tab key across screens
- [ ] Visual reskin pass — final art direction, typographic hierarchy audit (mono vs sans consistency across all stat displays)
- [ ] Sound design pass — click feedback, confirmation sounds (user opt-in only)
- [ ] Manual "refresh data" button in app — re-runs scraper locally for same-day stat updates without full rebuild

---

## Definition of Done (per phase)

1. All tasks in the sprint are checked off
2. Manual smoke test passes (all screens render, no console errors)
3. localStorage functions correctly (odds/notes/checklist persist on reload)
4. Changes committed to feature branch
5. Merged to `master` with `--no-ff`, tagged vN.N.N
6. CHANGELOG.md updated
7. New feature branch cut for next phase
