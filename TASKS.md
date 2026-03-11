# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `feature/phase-3-calendar`
**Goal:** Build the Fight Calendar screen — upcoming events, card breakdowns, fighter links

### Tasks
- [ ] Add static event data model (events array with card structure)
- [ ] Build CalendarScreen component — event list with date/countdown
- [ ] Event detail view: main event / co-main / prelims breakdown
- [ ] Fighter name links from calendar → fighter profile
- [ ] Filter by promotion (UFC / Bellator / PFL)
- [ ] Run smoke test: calendar renders, fighter links navigate correctly
- [ ] Commit and merge to `main`
- [ ] Cut branch `feature/phase-4-markets`

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

### 🔲 Phase 3 — Fight Calendar
**Branch:** `feature/phase-3-calendar`

- Upcoming events list (manual data entry to start)
- Event detail: card breakdown, main event / co-main / prelims
- Fighter links from calendar → fighter profile
- Basic date/countdown display
- Filter by promotion (UFC / Bellator / PFL)

**Migration note:** If file exceeds ~2000 lines before this phase, migrate to Vite first (see Phase 3a below).

### 🔲 Phase 3a — Vite Migration (trigger-based)
**Trigger:** File > ~2000 lines OR need for multi-file imports

- `npm create vite@latest audwihr -- --template react`
- Split into component files matching current structure
- All functionality must pass smoke test before merge
- No new features in this phase — migration only

### 🔲 Phase 4 — Markets Dashboard
**Branch:** `feature/phase-4-markets`

- Live market prices pulled from Polymarket/Kalshi (public APIs where available)
- Market list view: active UFC markets sorted by volume / closing time
- Quick-add to watchlist
- Implied probability tracker across platforms (arbitrage spotting)

### 🔲 Phase 5 — Fighter News Feed
**Branch:** `feature/phase-5-news`

- Aggregated fighter news (camp switches, injury reports, fight announcements)
- Manual curation to start, RSS/scraper later
- Link to relevant fighter profile

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
