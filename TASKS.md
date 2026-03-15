# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `feature/phase-6-live-data`
**Goal:** Live Data Layer — UFCStats build-time scraper replaces all hand-authored fighter/event data

### Phase 6 — Live Data Layer
- [x] `scripts/fighter-seed.json` — 14 fighters with editorial fields + `ufcstats_url`
- [x] Discover and verify all 14 UFCStats fighter URLs (letter-browse + event page scraping)
- [x] `scripts/fetch-data.js` — UFCStats scraper (Node ESM, cheerio, native fetch)
  - [x] Fighter stats: record, age, height, reach, stance, SLpM, str_acc, sapm, str_def, TD/15, TD acc, TD def, sub/15
  - [x] Derived stats: streak, finishes (ko/sub/dec), losses_by, finish_rate
  - [x] Fight history: result, opponent, method, round, event, year
  - [x] Cache layer: `*.raw.json` per fighter, `--fresh` flag to bypass
  - [x] Validation: all required fields checked; non-zero exit on error in CI mode
  - [x] `--dry-run`, `--ci`, `--fresh` CLI flags
- [x] `npm run fetch-data` / `fetch-data:dry` / `fetch-data:fresh` / `prebuild` scripts
- [x] `cheerio ^1.2.0` devDependency
- [x] `.env.example` committed with `VITE_ODDS_API_KEY` placeholder
- [x] `*.raw.json` gitignored (scraper cache)
- [x] `src/data/fighters.js` generated with live data — 14/14 verified correct
- [x] ESLint clean (0 errors)
- [x] All 32 tests passing
- [x] Version bumped to v0.6.0, menu badge updated to `LIVE DATA`
- [ ] Commit and merge to `master`, tag v0.6.0

---

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

## ✅ Completed Sprints

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

## Backlog (Unscheduled)

- [ ] Fighter portrait images (hosting solution TBD)
- [ ] Matchup context engine (archetype-aware auto-warnings in compare view)
- [ ] Export trade notes as PDF or markdown
- [ ] Sound design pass (click feedback, ambient, confirmation sounds)
- [ ] Visual reskin pass (final art direction)
- [ ] Mobile responsive layout
- [ ] Dark/light theme toggle
- [ ] Keyboard navigation
- [ ] Fighter search by stat range (e.g. "TD def > 80%")

---

## Definition of Done (per phase)

1. All tasks in the sprint are checked off
2. Manual smoke test passes (all screens render, no console errors)
3. localStorage functions correctly (odds/notes/checklist persist on reload)
4. Changes committed to feature branch
5. PR merged to `main`
6. CHANGELOG.md updated
7. New feature branch cut for next phase
