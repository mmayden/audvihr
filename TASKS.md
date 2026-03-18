# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `master` (Phase 15 complete — no active sprint)
**Last completed:** Phase 15 — Matchup Context Engine (v0.15.0, 2026-03-17)
**Next:** See Backlog below. Cut a `feature/phase-16-*` branch when the next phase is scoped.

---

## ✅ Completed Sprints

### ✅ Phase 15 — Matchup Context Engine (v0.15.0) — 2026-03-17

- [x] `src/constants/matchupWarnings.js` — `computeMatchupWarnings(f1, f2)`; ARCHETYPE_RULES (14), STYLE_CLASHES (8), MOD_RULES (10); pure function, no side effects, no fighter names interpolated
- [x] CompareScreen — MATCHUP NOTES section between hero header and stat table; fighter last name + "EDGE" subject badge; four type variants (style/risk/fade/clash)
- [x] Phase 15 CSS — `.matchup-notes`, `.matchup-note`, `.matchup-note--style/risk/fade/clash`, `.matchup-note-meta`, `.matchup-note-headline`, `.matchup-note-subject`, `.matchup-note-body`
- [x] `matchupWarnings.test.js` — 27 tests: guard, shape, directional rules (both directions), symmetric clashes (bidirectional), modifier rules (generic + conditioned), combined, determinism
- [x] CHANGELOG.md [Unreleased] → v0.15.0; TASKS.md, PLANNING.md, CLAUDE.md updated

---

### ✅ Phase 14 — QoL + Visual Overhaul (v0.14.0) — 2026-03-17

#### Navigation & Discovery
- [x] `FighterSearch` component — type-to-search combobox; ARIA-compliant; XSS-safe; blur race guard
- [x] Quick compare from fighter profile — VS./COMPARE button in FighterScreen hero → `/compare/:id`
- [x] One-click compare from calendar — COMPARE button per in-roster bout; `useCompareNav()` module-scope hook
- [ ] Recently viewed fighter strip (deferred — optional stretch; `recent_fighters` sessionStorage key reserved)

#### Data Context
- [x] `computePercentiles` utility — per-stat percentile rank vs full 69-fighter roster
- [x] `TOP X%` percentile badges in TabOverview — finish_rate, slpm, sapm, str_def, td_def
- [x] `statTiers.js` + stat tier labels in CompareScreen cells — ELITE / ABOVE AVG / AVG / BELOW AVG
- [x] Category edge stripe in CompareScreen — `categoryEdges` useMemo; `.cat-row--f1-edge/f2-edge` (3px left border)

#### Visual Identity
- [x] Arch-badge + mod-badge pill rendering — `.arch-badge` / `.mod-badge` CSS classes everywhere
- [x] `FighterCard` component — portrait/initials + name + record + arch/mod badges; interactive + static contexts
- [x] CompareScreen hero header — two `FighterCard` components + VS center + normalized implied probability gap
- [x] TabOverview FLAGS → `.flags-pill-row` — CHIN / CARDIO / CUT as colored inline pills

#### Pick Log
- [x] `src/utils/pickLog.js` — `readPickLog()`, `appendPick()`, `updatePickOutcome()`; 200-entry cap; plain text only
- [x] Pick log UI in MarketsScreen — `+ PICK` per card, inline form, PICKS topbar panel with W/L/P record
- [x] Storage key table in CLAUDE.md updated with `pick_log` key

#### Testing & Docs
- [x] 392 tests all passing; 0 lint errors; 0 CVEs
- [x] CHANGELOG.md promoted to v0.14.0; TASKS.md, PLANNING.md, CLAUDE.md all updated

---

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

## Backlog (Unscheduled — Post Phase 15)

#### High value
- [ ] **CORS proxy for live RSS** — one Netlify/Vercel edge function; `useNews` hook is fully ready, this is pure infra
- [ ] **Fighter stat range search** — filter roster by stat thresholds ("TD def > 80%", "SLpM > 5"); new FilterScreen or panel in FighterScreen sidebar
- [ ] **Stat trend lines** — per-fight stat trajectory over last N fights; requires scraper enhancement to store per-fight stats alongside career averages
- [ ] **Historical opening line database** — searchable archive of opening lines per fighter across all past fights
- [ ] **MUAY THAI + CLINCH FIGHTER in ARCH_COLORS** — both archetypes have rules in `matchupWarnings.js` but no entry in `src/constants/archetypes.js`. Add before assigning either archetype to any fighter in `fighter-seed.json`. Suggested: MUAY THAI → `var(--orange)`; CLINCH FIGHTER → `var(--purple)`. Zero security surface — pure visual fix.

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
