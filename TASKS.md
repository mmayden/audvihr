# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `feature/phase-5-news`
**Goal:** Fighter News Feed — manual curated news items linked to fighter profiles

### Phase 5 — Fighter News Feed
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
- [ ] Commit and merge to `main`, tag v0.5.0

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

### 🔲 Phase 6 — Live Data Layer
**Branch:** `feature/phase-6-live-data`

- UFCStats scraper or SportRadar API integration
- Fighter stats auto-populated and updated
- Fight history pulled automatically
- Remove all mock data; FIGHTERS array becomes an API response shape

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
