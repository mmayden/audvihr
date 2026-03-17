# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `feature/phase-14-qol-visual`
**Phase:** 14 — QoL + Visual Overhaul
**Status:** Planning

### Overview

Phase 14 targets three things that make the tool feel like a product rather than a spreadsheet:

1. **Navigation friction** — replace scroll dropdowns with type-to-search everywhere; add quick-compare from profile and calendar
2. **Data context** — raw numbers become meaningful with percentile badges and tier labels; no more "is 4.5 SLpM good?"
3. **Visual identity** — pill-style archetype/modifier badges, fighter card components with portraits, compare screen hero header

**Security note:** The new pick log writes to localStorage. Key `pick_log` is exclusively owned by `src/utils/pickLog.js`. All reads must be `try/catch`-wrapped with a typed default (`[]`). Any user input (outcome notes) is stored as plain text — no HTML, no eval. The fighter search input filters a static in-memory array — no API calls, no reflected output via innerHTML.

---

### Phase 14 Tasks

#### Navigation & Discovery

- [ ] **`FighterSearch` component** (`src/components/FighterSearch.jsx`)
  - Text input that filters FIGHTERS in real time (case-insensitive, trims whitespace)
  - Renders a dropdown list of matching fighters; selects on click or Enter
  - Used in CompareScreen fighter selectors (replaces scroll dropdowns) and FighterScreen roster sidebar
  - Input sanitized with `.trim()` + `.toLowerCase()` before filtering; never passed to innerHTML
  - `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` on input; `role="option"` + `aria-selected` on list items
  - Add `src/components/FighterSearch.test.jsx` — test: filter renders correct results, empty state, keyboard Enter selects, XSS input (`<script>`) does not reach DOM

- [ ] **Quick compare from fighter profile**
  - Add a **VS.** button in FighterScreen hero card
  - Navigates to `/compare/:currentFighterId` (one-fighter pre-load) or `/compare/:currentFighterId/:previousFighterId` if a "previous" fighter is in recent history
  - No new route needed — CompareScreen already handles partial pre-load gracefully (`f2id` resolves to null → empty second slot)

- [ ] **One-click compare from calendar**
  - Each fight row in CalendarScreen gets a **COMPARE** button
  - Navigates to `/compare/:f1id/:f2id` — both fighters looked up by name against FIGHTERS roster
  - If either fighter is not in roster: button is hidden (not shown as disabled) — avoids dead-end navigation
  - Name → ID lookup extracted to a pure util `findFighterByName(name, fighters)` in `src/utils/fighters.js`

- [ ] **Recently viewed fighter strip** (optional stretch — add only if quick-compare is clean)
  - Last 3 viewed fighter IDs in sessionStorage (key: `recent_fighters`, owned by `FighterScreen` only)
  - Shown as small portrait/initial pills at the top of the roster sidebar
  - Tap/click → navigate directly to that fighter's profile

#### Data Context

- [ ] **`computePercentiles` utility** (`src/utils/percentiles.js`)
  - Takes a fighter object and the full FIGHTERS array
  - Returns `{ slpm, str_acc, sapm, str_def, td_def, td_per15, finish_rate }` as 0–100 percentile ranks
  - Pure function, no side effects, fully testable
  - Add `src/utils/percentiles.test.js` — test: champion-tier fighter ranks top, gatekeeper ranks low; ties handled correctly

- [ ] **Percentile badges in TabOverview**
  - Next to SLpM, Str Def, TD Def, and Finish Rate in the Key Numbers section
  - Badge label: `TOP X%` (e.g. `TOP 8%`) computed via `computePercentiles`
  - Tiers: ≤10% → `--green`; 11–35% → `--accent`; 36–65% → `--text-dim`; >65% → no badge (below average, not shown)
  - New CSS class `.percentile-badge` — JetBrains Mono, small caps, no hardcoded colors

- [ ] **Stat tier labels in compare rows**
  - Each stat cell in CompareScreen gets a sub-label: `ELITE` / `ABOVE AVG` / `AVG` / `BELOW AVG`
  - Thresholds defined in a new constant `src/constants/statTiers.js` (one object per stat, four threshold values)
  - Labels use `--text-dim` (muted, secondary) — they add context without competing with the primary number
  - No color coding on labels themselves — just text; percentile badge handles color signal

- [ ] **Color-coded matchup edge indicator on compare rows**
  - A 3px left-border stripe on each compare row category group (not individual rows)
  - Green border: F1 wins majority of rows in category; Red: F2 wins; No border: split/even
  - Computed from existing `compareRows.js` win/lose flags — no new data needed
  - CSS modifier: `.compare-category--f1-edge`, `.compare-category--f2-edge`; colors from `--green`/`--red`

#### Visual Identity

- [ ] **Archetype + modifier pill badges** (CSS only — no new component needed)
  - New CSS class `.arch-badge` — pill shape (`border-radius: 4px`, padding, monospace, uppercase)
  - New CSS class `.mod-badge` — smaller pill, slightly dimmer
  - Applied in: FighterScreen hero card, CompareScreen fighter header, TabOverview
  - Replace the current colored inline text spans with `.arch-badge` + inline color style (color still from `ARCH_COLORS` lookup → inline style is correct here per CLAUDE.md)
  - Add `.mod-badge` pill rendering for modifier tags (currently rendered as plain text)

- [ ] **`FighterCard` component** (`src/components/FighterCard.jsx`)
  - Compact card: portrait (or 2-letter initials fallback) + name + record + archetype badge + top 2 mod badges
  - Used in CompareScreen fighter selector (replacing raw text dropdowns) and potentially in roster sidebar
  - Props: `fighter` (Fighter object), `onClick` (optional), `isSelected` (bool)
  - `role="button"`, `aria-pressed={isSelected}`, `aria-label={fighter.name}` when interactive
  - Add `src/components/FighterCard.test.jsx`

- [ ] **CompareScreen hero header**
  - When both fighters are selected: show two `FighterCard` components side by side above the stat table
  - Between them: a center divider with `VS` and the implied probability gap (from live odds if available, else from sportsbook column if populated)
  - Replaces the current plain text fighter name display at the top of the compare screen

- [ ] **Updated TabOverview card layout**
  - Current: labeled text sections stacked vertically
  - Target: portrait/initials top-left; name + record + streak badge top-right; archetype + mods as pill badges below; then flags row (chin/cardio/weight cut as inline pills); then trader notes
  - Flags use existing CHIN_COLOR / CARDIO_COLOR / CUT_COLOR inline style (runtime lookup map — inline style is correct per CLAUDE.md)

#### Pick Log

- [ ] **`src/utils/pickLog.js`**
  - `readPickLog()` — `try/catch`, returns `[]` on error
  - `appendPick({ fightKey, fighter, method, confidence, outcome, notes, ts })` — appends to array in localStorage; cap at 200 entries (same eviction pattern as CLV log)
  - `updatePickOutcome(fightKey, outcome)` — updates `outcome` field on existing entry
  - `KEY = 'pick_log'` — exported constant; only this module reads/writes it
  - All input fields stored as plain text strings — no HTML, no eval
  - Add `src/utils/pickLog.test.js` — test: append, cap enforcement, outcome update, try/catch on corrupt data, XSS strings stored as plain text

- [ ] **Pick log UI in MarketsScreen**
  - Small "+ PICK" button per fight row (next to the alert bell)
  - Opens an inline form: fighter selector (pre-filled from row), method (KO/TKO/Sub/Dec), confidence (1–5), notes textarea
  - Notes field: stored as-is, rendered via JSX (safe by default) — no innerHTML
  - After a fight: "RESULT" button to log outcome; pick row shows W/L badge and CLV-like delta
  - Log panel (collapsible, below CLV panel): shows last 20 picks with W/L/P record and ROI if odds were entered

- [ ] **Storage key table in CLAUDE.md updated** with `pick_log` key, owned by `src/utils/pickLog.js`

#### Testing & Docs

- [ ] All new utils at ≥80% branch coverage
- [ ] All new components have smoke tests + conditional render paths tested
- [ ] `npm run lint` exits 0; `npm audit` clean
- [ ] CHANGELOG.md `[Unreleased]` updated as tasks complete
- [ ] PLANNING.md decisions log updated with Phase 14 architectural decisions

---

## ✅ Completed Sprints

### ✅ Post-Phase-13 Maintenance — Code Quality & Modular Design Cleanup

- [x] Fix `TabMarket.jsx` useEffect dependency array — removed `eslint-disable-line react-hooks/exhaustive-deps`; explicit dep list (`hasLive`, `chartLoaded`, `polyMatch`, `kalshiMatch`, `polyFetchHistory`, `kalshiFetchHistory`). Safe because `if (!hasLive || chartLoaded) return` guard prevents re-execution.
- [x] Replace inline ternary `style={{ color }}` blocks with CSS modifier classes across 3 tab files:
  - `TabMarket.jsx`: `.line-movement-bar--up/down`, `.mc-public-warning`, `.mc-public-ok`
  - `TabPhysical.jsx`: `.val--loss`, `.val--dec-loss`, `.val--clean` on loss method breakdown
  - `TabStriking.jsx`: `.val--loss` / `.val--clean` on KD suffered stat
- [x] `ChecklistPanel.jsx` — add `role="checkbox"`, `aria-checked`, `aria-label` to checklist item divs (accessibility compliance)
- [x] `StatBar.jsx` — add explicit `max > 0` guard to prevent silent `Infinity` on zero-max input
- [x] `app.css` — add 8 new semantic CSS modifier classes for all the above (CSS variables only, no hardcoded colors)
- [x] All 333 tests passing; 0 lint errors

### ✅ Phase 13 — Sharing + Export (v0.13.0) — 2026-03-17

- [x] React Router v7: BrowserRouter in App.jsx; routes for all 6 screens; FighterScreenRoute + CompareScreenRoute wrappers validate URL params as positive integers
- [x] Shareable compare URL `/compare/:f1id/:f2id`; COPY LINK button in CompareScreen topbar (user-initiated clipboard write only)
- [x] `src/utils/export.js` — `sanitizeCsvCell`, `checklistToMarkdown`, `clvLogToCsv`, `downloadBlob`; Blob/object-URL revoke pattern
- [x] CompareScreen ↓ MD export button; MarketsScreen CLV panel ↓ CSV export button
- [x] SPA fallback: `netlify.toml` redirects, `vercel.json` rewrites, `vite.config.js` historyApiFallback
- [x] 333 tests all passing (up from 308); 0 lint errors; `Blob` + `URL` added to ESLint globals

### ✅ Phase 12 — Live News Layer (v0.12.0) — 2026-03-16

- [x] News source evaluation: MMA Fighting RSS + MMA Junkie RSS selected; documented in PLANNING.md; `connect-src` updated in `netlify.toml` + `vercel.json`
- [x] `src/utils/newsParser.js` — `stripHtml` (DOMParser textContent only), `parseRssFeed`, `classifyCategory`, `classifyRelevance`, `matchFighterName`, `rssItemToNewsItem`; headline ≤160, body ≤600 chars
- [x] `src/hooks/useNews.js` — fetches 2 RSS sources in parallel; 30-min sessionStorage cache; per-source silent degradation; falls back to static `NEWS` mock; returns `{ items, loading, isLive }`
- [x] `NewsScreen.jsx` — LIVE/MOCK source badge in topbar; per-item LIVE/MOCK badge; filter dropdown derives from live items
- [x] `TabOverview.jsx` — `newsItems` prop; RECENT NEWS section (top 2 matched items)
- [x] `FighterScreen.jsx` — calls `useNews()` once; derives `fighterNews` via `useMemo`; passes to TabOverview
- [x] Security: all feed content text-extracted only; XSS test coverage in `newsParser.test.js`
- [x] 308 tests all passing (up from 239); 0 lint errors; build passes (95.22 kB gzipped)

### ✅ Phase 11 — Alerts + Notifications (v0.11.0) — 2026-03-16

- [x] `public/sw.js` — minimal Service Worker (install/activate only; no fetch handler; scope `/`)
- [x] SW registration in `src/main.jsx`
- [x] `src/utils/alerts.js` — pure functions; all localStorage/sessionStorage reads try/catch with typed defaults
- [x] `src/hooks/useAlerts.js` — `alertsEnabled`, `alertRules`, `permissionState`, `requestPermission`, `toggleAlerts`, `toggleFightAlert`, `setFightThreshold`; silent degradation when Notification absent/denied
- [x] `MenuScreen.jsx` — ⚙ ALERTS settings panel; `MarketsScreen.jsx` — bell icon per fight card
- [x] Alert body: string concatenation only — no template-literal HTML, no innerHTML
- [x] `worker-src 'self'` added to CSP in both `netlify.toml` + `vercel.json`
- [x] 239 tests all passing; 0 lint errors; 0 CVEs

### ✅ Phase 10 — Mobile + UX Polish (v0.10.0) — 2026-03-16

- [x] `src/hooks/useTheme.js` — persists `'light'|'dark'|'system'`; `data-theme` on `<html>`
- [x] `App.jsx` — bottom nav (`.bottom-nav`), hidden desktop / fixed mobile; floating theme toggle (desktop)
- [x] `FighterScreen.jsx` + `CalendarScreen.jsx` — `sidebarOpen` state, ROSTER/EVENTS button, `.sidebar-backdrop`
- [x] Portrait support — `<img>` when `sel.portrait` set; 2-letter initials fallback
- [x] Light-theme CSS variable set + `prefers-color-scheme` fallback; responsive block `@media (max-width: 767px)`
- [x] 186 tests all passing; 0 lint errors; 0 CVEs

### ✅ Phase 9 — Roster Expansion + Public Signal (v0.9.0) — 2026-03-16

- [x] Opening line preservation — `appendOpeningLine` + `readOpeningLines` in `clv.js`
- [x] "NOT IN ROSTER" badge on live-only stub fight rows in MarketsScreen
- [x] Roster expansion — 55 new fighters (IDs 15–69), all 8 weight classes, 69/69 scraped OK
- [x] Tapology community % — build-time scrape; `tapology_pct` in `events.js`; PUBLIC row + FADE badge (≥15pt divergence)
- [x] 165 tests all passing; 0 lint errors; 0 audit vulnerabilities

### ✅ Phase 8 — CSS Extraction + Phase 7 Should-Haves (v0.8.0) — 2026-03-16

- [x] Extract inline styles → named CSS classes (~33 style blocks → 35 CSS classes in app.css)
- [x] `src/constants/compareRows.js` — 15 stat-row definitions extracted from CompareScreen
- [x] `opp_quality` field on fight history entries (elite / contender / gatekeeper / unknown)
- [x] `weigh_in` and `judges` fields on event card fight entries
- [x] Edge signal panel in CompareScreen — `computeEdgeSignals()` — "RESEARCH PROMPT — NOT A PICK"

### ✅ Phase 7 — Live Odds + Market Intelligence (v0.7.0) — 2026-03-16

- [x] `normalizeOdds.js`, `cache.js`, `clv.js` utilities; 100% coverage
- [x] `useOdds`, `usePolymarket`, `useKalshi` hooks; silent degradation on all three
- [x] `PriceChart.jsx` — SVG sparkline; 9 tests
- [x] MarketsScreen: unified 3-column live row; arb detection; lazy charts; CLV log panel
- [x] TabMarket: live prices + auto-loaded history for matched roster fighters
- [x] CSP updated: 3 API domains in `netlify.toml` + `vercel.json`
- [x] 142 tests; 0 lint errors; build passes (71 kB gzipped)

### ✅ Phases 1–6 (v0.1.0–v0.6.1)

- [x] Phase 1–2: single-file prototype, 6 fighters, compare, 17-item checklist, localStorage
- [x] Phase 2b: 14 fighters, 5 weight classes
- [x] Phase 3–3a: fight calendar + Vite migration (retired babel-standalone)
- [x] Phase 4–5: mock markets dashboard + mock news feed
- [x] Phase 6: build-time UFCStats scraper (cheerio), hybrid seed + live data model

---

## Roadmap

### Phase 14 — QoL + Visual Overhaul (current sprint)
See Current Sprint above.

### Backlog (Unscheduled — Post Phase 14)

#### High value
- [ ] **CORS proxy for live RSS** — one Netlify/Vercel edge function; `useNews` hook is fully ready, this is pure infra
- [ ] **Matchup context engine** — archetype-aware auto-warnings in compare view ("WRESTLER vs COUNTER STRIKER — takedown threat flagged + judge venue bias noted"). Rules table in `src/constants/matchupWarnings.js`
- [ ] **Fighter stat range search** — filter roster by stat thresholds ("TD def > 80%", "SLpM > 5"); new FilterScreen or panel in FighterScreen sidebar
- [ ] **Stat trend lines** — per-fight stat trajectory over last N fights; requires scraper enhancement to store per-fight stats alongside career averages
- [ ] **Historical opening line database** — searchable archive of opening lines per fighter across all past fights

#### Medium value
- [ ] **Women's divisions** — Strawweight, Flyweight, Bantamweight rosters (same seed + scrape pattern, ~30 fighters)
- [ ] **Chart.js / Recharts for trend charts** — stat bars are functional but trend charts would unlock trajectory analysis; deliberate dependency decision required before adding
- [ ] **Keyboard navigation** — arrow keys in sidebar, Tab across screens, keyboard-accessible compare selectors
- [ ] **Manual data refresh button** — in-app button triggers `fetch-data.js` equivalent for same-day stat updates without full rebuild; requires a build API endpoint

#### Low / nice-to-have
- [ ] **Visual reskin pass** — final art direction once card components + badge system are in place
- [ ] **Sound design** — optional click feedback, opt-in only; deliberate decision required before adding audio

---

## Definition of Done (per phase)

1. All tasks in the sprint are checked off
2. Manual smoke test passes (all screens render, no console errors)
3. localStorage functions correctly (odds/notes/checklist persist on reload)
4. `npm run test:run` exits 0; `npm run lint` exits 0; `npm audit` clean
5. Changes committed to feature branch; merged to `master`, tagged vN.N.N
6. CHANGELOG.md `[Unreleased]` promoted to version
7. PLANNING.md decisions log updated for any architecture/CSP/data model change
8. New feature branch cut for next phase
