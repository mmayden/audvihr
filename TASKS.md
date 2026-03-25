# TASKS.md — Audwihr Roadmap & Sprint Board

## How This File Works

- **Roadmap** = phases, what each one delivers, migration triggers
- **Current Sprint** = the active branch and its specific tasks
- When a phase completes: check off tasks, move phase to Done, update CHANGELOG.md

---

## Current Sprint

**Branch:** `master`
**Status:** v0.18.4-dev — Build quality guardrails + UI polish shipped. Next: Deployment to audvihr.space.

### Build Quality, Security Guardrails & UI Polish (v0.18.4) — 2026-03-25

- [x] Self-hosted fonts via `@fontsource-variable` — eliminated Google Fonts CDN; tightened CSP (`style-src 'self'`, `font-src 'self'`)
- [x] Pre-commit hooks — `husky` + `lint-staged` (ESLint on staged `.js/.jsx` files)
- [x] Security header parity test — 47 tests validating `netlify.toml` ↔ `vercel.json` header sync, CSP completeness, CSP hardening, `index.html` security
- [x] `npm run validate` — lint + test + audit in one command
- [x] ARENA theme removed — MONOLITH sole colour scheme; `useTheme` hook + tests deleted; theme toggle removed from App.jsx, MenuScreen, and bottom nav
- [x] Documentation refresh — PLANNING.md (stale CSP, file structure, decisions log), TASKS.md, CHANGELOG.md, CLAUDE.md, README.md modernized
- [x] Stripe donate link — "♡ SUPPORT THIS PROJECT" in MenuScreen below nav menu; `.menu-donate` CSS class; opens `donate.stripe.com` in new tab
- [x] 527 tests passing (47 new); 0 lint errors; 0 CVEs
- [x] **War Room design system** — complete `app.css` visual overhaul: corner bracket reticles on cards, dashed border headers, 200/800 weight typography contrast, stat bar terminus dots with glow, threat-level color coding (green/amber/red), spring-eased button transitions with scale lift, staggered entrance animations, live indicator pulse, gradient progress bars, checkbox glow, scanline background overlay, portrait corner ticks, input focus glow rings. Zero JSX changes — all existing class names preserved. 527 tests pass, 0 lint errors.

### Phase 17 — Deployment + Free Odds Pipeline (scoped 2026-03-24)

#### Deployment — audvihr.space via Vercel + Namecheap
- [ ] Connect repo to Vercel (auto-detect Vite; `vercel.json` already configured)
- [ ] Add env vars in Vercel project settings: `VITE_ODDS_API_KEY`, `VITE_KALSHI_API_KEY` (optional — app degrades silently)
- [ ] Add custom domain `audvihr.space` in Vercel project → Domains
- [ ] Namecheap Advanced DNS: A record `@` → `76.76.21.21`; CNAME `www` → `cname.vercel-dns.com.`
- [ ] Verify domain + TLS provisioning in Vercel
- [ ] Configure `www.audvihr.space` → `audvihr.space` redirect (308, canonical apex)
- [ ] Smoke test: all screens render, CSP headers active, HTTPS enforced, `noindex` meta present

#### ✅ Build-Time Odds Scraper — BestFightOdds (free, no API key) — DONE v0.18.3
- [x] `scripts/fetch-odds.js` — cheerio scraper; browser UA; `--dry-run`/`--ci`/`--fresh` flags; 500ms delay; local `.raw.json` cache; silent degradation
- [x] `src/data/odds.js` — generated output keyed by `fightKey`; multi-book moneylines + best line per fight
- [x] Wire into `prebuild`: `"prebuild": "node scripts/fetch-data.js --ci && node scripts/fetch-odds.js --ci"`
- [x] Update `MarketsScreen` + `TabMarket` to read build-time odds as baseline (merge with live Polymarket data)
- [x] `useOdds.js` + `useKalshi.js` fully optional — build-time BFO replaces paid APIs as free sportsbook data source
- [x] Tests for odds data shape + fightKey matching (10 tests in `src/data/odds.test.js`)
- [x] CSP review: BestFightOdds is build-time only (no `connect-src` change needed)
- [x] COOP + CORP security headers added to `vercel.json` + `netlify.toml`
- [x] CLAUDE.md, PLANNING.md, CHANGELOG.md updated
- [x] `npm audit` clean (flatted fix); 491 tests pass; 0 lint errors

---

## Proposed Next Sprint — Phase 18: Women's Divisions + Keyboard Nav (v0.19.0)

> Cut `feature/phase-18` from `master`. Two independently shippable workstreams — women's roster is data-heavy, keyboard nav is code-only. Sequence: keyboard nav first (immediate value, zero data dependency), then women's divisions.

**Branch:** `feature/phase-18` (not yet cut)

### Workstream A — Keyboard Navigation

- [ ] `FighterScreen` sidebar: arrow keys move focus through `.sidebar-fighter` rows; `Enter` selects; `Escape` closes; `aria-activedescendant` on the container; test coverage
- [ ] `CalendarScreen` sidebar: same pattern
- [ ] `CompareScreen` `FighterSearch` dropdowns: already uses `role=combobox`; verify `aria-activedescendant` is wired to the highlighted option; add keyboard navigation tests
- [ ] Global `Tab` audit: confirm all interactive elements are reachable in logical DOM order on all 5 screens; fix any focus traps or skipped elements
- [ ] `App.jsx` bottom nav: confirm `Tab` cycles through all 5 nav items; `Enter`/`Space` activates; already has `aria-label`

### Workstream B — Women's Divisions

- [ ] `fighter-seed.json`: add ~30 Strawweight / Flyweight / Bantamweight fighters (archetype, mods, chin, cardio, weight_cut, notes, ufcstats_url)
- [ ] `scripts/fetch-data.js`: verify scraper handles women's division weight class strings from UFCStats (`Women's Strawweight` etc.)
- [ ] Run `npm run build` to confirm all new fighters scrape cleanly (0 errors in scrape log)
- [ ] `FighterScreen` weight filter: add women's division options (currently shows only men's divisions)
- [ ] `statFilters.js` physical predicates: verify `height` / `reach` thresholds are sensible for women's roster (may need separate tier calibration)
- [ ] Smoke test: open FighterScreen, select a women's division fighter, confirm all 6 tabs render, percentile badges work, compare works

### Quality Gate (before merge)
- [ ] `npm run test:run` — all existing 527 tests still pass; new keyboard nav tests added (target: ≥ 15 new tests)
- [ ] `npm run lint` — 0 errors
- [ ] `npm audit` — 0 critical/high CVEs
- [ ] CHANGELOG.md `[Unreleased]` → `[0.19.0]`
- [ ] TASKS.md, PLANNING.md, CLAUDE.md updated

---

## ✅ Completed Sprints

### ✅ v0.18.2 — DisclaimerGate + Arena Atmosphere — 2026-03-24

**Branch:** `feature/phase-17-mobile` → merged to `master`

- [x] **DisclaimerGate** — two-step acceptance gate (age 18+ → risk acknowledgement); wraps entire app; `disclaimer_accepted` localStorage key; try/catch reads; UI-only compliance
- [x] **Arena atmosphere** — 4-layer parallax backdrop (deep atmosphere, LED grid, ambient pulse, vignette); mouse-driven smooth lerp via `requestAnimationFrame`
- [x] **Frosted glass** — `backdrop-filter: blur(14px)` + `--surface-glass` token on topbar, bottom-nav, sidebar overlay
- [x] **Sphere CSS tokens** — `--sphere-base`, `--sphere-mid`, `--sphere-glow`, `--sphere-pulse-color`, `--surface-glass` in `:root`
- [x] **`--text-dim` WCAG AA fix** — MONOLITH `#3e4a62` → `#7890b0` (~5:1); ARENA `#6a5840` → `#a08870` (~4.5:1)
- [x] **TabOverview stat bars** — percentile badges replaced with 6 coloured horizontal bars (green/cyan/red) + tier labels
- [x] **FighterScreen hero** — compact 88px avatar box with cyan accent border
- [x] **`arena-test.html`** — standalone visual prototype in `public/` (reference only)
- [x] **App.test.jsx fix** — `beforeEach` pre-accepts disclaimer gate so bottom nav tests pass
- [x] 481 tests passing; 0 lint errors; 0 CVEs
- [x] CHANGELOG, TASKS, PLANNING, CLAUDE.md updated

---

### ✅ v0.18.1 — Visual Identity + Bug Fix — 2026-03-18

**Branch:** `feature/phase-17-mobile`

- [x] **MONOLITH theme** (`:root`): near-void cold blue-blacks; electric cyan `#00c8ff` accent; cold text `#dce6f8`; deeper shadows
- [x] **ARENA theme** (`[data-theme="light"]`): deep charcoal-amber darks; ember orange `#e06828` accent; warm cream text `#f0e2cc`; tobacco borders — not white (ARENA theme later removed in v0.18.4-dev)
- [x] OS `prefers-color-scheme: light` mapped to ARENA palette (ARENA theme later removed in v0.18.4-dev)
- [x] `--accent-bg` / `--accent-bg-mid` CSS tokens added to all three theme blocks; all 10 hardcoded `rgba(212,168,67,...)` gold tints replaced
- [x] `.topbar` padding `0 80px 0 20px` on desktop (button overlay fix); mobile override `0 14px`
- [x] `useTheme.js` — toggle label changed to `'ARENA'` / `'MONOLITH'`
- [x] `useTheme.test.js` — 2 label assertions updated
- [x] `package.json` + `MenuScreen.jsx` version badge → `v0.18.1`
- [x] CHANGELOG, TASKS, PLANNING, CLAUDE.md updated
- [x] 481 tests passing; 0 lint errors; 0 CVEs

---

### ✅ v0.18.0 — Phase 17 Mobile-First UX — 2026-03-18

**Branch:** `feature/phase-17-mobile` → merged to `master`

#### Bottom Nav
- [x] Emoji icon above text label (`flex-direction: column`); `aria-label` on each button; `aria-hidden="true"` on icon span
- [x] Active state: `font-weight: 700` on label + accent border-top — unambiguous at all sizes
- [x] `min-height: var(--touch-target, 44px)` on all five nav items

#### Fighter Screen (mobile)
- [x] Tab bar: swipe-scroll fluid; `scrollbar-width: none` suppressed globally
- [x] Hero portrait: 88px at ≤767px; 64×64px at ≤480px
- [x] Stat filters panel: `max-height: 50vh; overflow-y: auto`; CLEAR ALL reachable; chips `min-height: var(--touch-target-sm, 36px)`

#### Compare Screen (mobile)
- [x] Hero: `grid-template-columns: 1fr` at ≤480px → F1 / VS / F2 stack vertically
- [x] Stat table: `overflow-x: auto` + `.ctable { min-width: 400px }` at ≤480px
- [x] MATCHUP NOTES cards: full-width, no horizontal scroll

#### Calendar Screen (mobile)
- [x] Swipe-to-close sidebar (`onTouchStart`/`onTouchEnd`; velocity ≥ 80px/s OR drag ≥ 112px)
- [x] COMPARE button `min-height: var(--touch-target-sm, 36px)`

#### Markets Screen (mobile)
- [x] `mkt-live-row` collapses to `grid-template-columns: 1fr`
- [x] `.mkt-alert-threshold` `font-size: 16px` — prevents iOS auto-zoom
- [x] PICKS panel: `max-height: 60vh; overflow-y: auto`

#### News Screen (mobile)
- [x] Category chips: `flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none`
- [x] Headline: `-webkit-line-clamp: 3` at ≤480px; tap to expand via `.news-headline--expanded`; `role="button"`, `tabIndex={0}`, `aria-expanded`, `onKeyDown` (Enter/Space)

#### CSS / Design Tokens
- [x] `--touch-target: 44px` and `--touch-target-sm: 36px` declared in `:root`
- [x] `@media (max-width: 767px)` audited; `@media (max-width: 480px)` block added for small-phone overrides
- [x] `prefers-reduced-motion` block remains last in `app.css`

#### Code Quality
- [x] `formatDate`, `formatEventDate`, `countdown` consolidated into `src/utils/date.js` (eliminated duplicates across 4 screens)

#### Testing
- [x] `CalendarScreen.test.jsx` — 7 tests: sidebar toggle, backdrop, `sidebar--open` class, `aria-expanded`
- [x] `NewsScreen.test.jsx` — 9 tests: headline click, double-click, Enter, Space, `aria-expanded`, `role="button"`
- [x] 481 tests passing; 0 lint errors; 0 CVEs

#### Security
- Touch event handlers are internal DOM events — no new CSP surfaces, no new external domains
- No new npm runtime dependencies
- `font-size ≥ 16px` on `<input>` enforced; rule codified in CLAUDE.md

---

## ✅ Completed Sprints (prior)

### ✅ v0.17.0 — CORS Proxy + Visual & QoL Polish — 2026-03-18

- [x] `netlify/functions/rss-proxy.js` — Netlify Functions v2; strict 2-URL `ALLOWED_URLS` Set; 403 on unlisted url; 512 KB cap; 10s timeout; GET only; no auth header forwarding; served at `/api/rss-proxy` via `config.path`
- [x] `api/rss-proxy.js` — Vercel equivalent; identical security logic; auto-routed from `api/`
- [x] `useNews.js` — all RSS fetches routed through `/api/rss-proxy?url=...`; silent-degradation unchanged
- [x] `netlify.toml` + `vercel.json` — `mmafighting.com` + `mmajunkie.usatoday.com` removed from CSP `connect-src`; Vercel SPA rewrite exclusion updated to also exclude `api/`
- [x] `useNews.test.js` — 2 proxy-routing tests; 456 total passing; 0 lint errors
- [x] CSS: `--bg-elevated`/`--bg-card` tokens in all three theme blocks; `--radius-*`, `--transition`, `--shadow-*` design tokens; global `:focus-visible` ring; 5 inputs upgraded to `--accent` focus border; tab-bar scrollbar suppressed; `@keyframes sidebarSlideIn`; vs-btn CTA elevated; label size improvements; mobile touch targets; card hover depth; `prefers-reduced-motion` block
- [x] ARIA: `aria-expanded` + `aria-label` on ROSTER/EVENTS toggles; `role="button"` + `aria-label` on backdrops (FighterScreen, CalendarScreen)
- [x] CHANGELOG.md `[Unreleased]` × 2 → `[0.17.0]`; TASKS.md Phase 17 scoped; PLANNING.md file structure + version + roadmap table updated

---

### ✅ Post-Phase-16 Visual & QoL Polish — 2026-03-18

- [x] **CSS variables** — `--bg-elevated` and `--bg-card` defined (fix broken Phase 11 alert style references); `--radius-sm`, `--radius`, `--radius-pill`, `--transition`, `--shadow-sm`, `--shadow-md` added as forward-looking design tokens in `:root`
- [x] **Focus ring** — Global `button:focus-visible`, `a:focus-visible`, `[tabindex]:focus-visible` rule using `var(--accent)`; keyboard navigation now visible
- [x] **Input focus colors** — `.sidebar-input`, `.fighter-search-input`, `.notes-area`, `.mkt-pick-notes`, `.news-fighter-select` upgraded from `--border2` to `--accent` on focus
- [x] **Tab bar scrollbar** — Hidden globally via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`; scrollbar artifact gone on all viewports
- [x] **Sidebar slide animation** — `@keyframes sidebarSlideIn`; mobile overlay slides in from left instead of snapping
- [x] **`vs-btn` CTA** — Default state now uses `--accent` border/color; hover fills accent background; more action-oriented
- [x] **Label readability** — `.stat-cell-label` 9px→10px; `.fin-l` 8px→9px; `.stat-tier-label` 8px→9px
- [x] **Mobile touch targets** — `.filter-chip` min-height 36px; `.sidebar-fighter` padding 11px 14px; portrait 88×88px; tighter `card-identity` padding; `vs-btn` full-width on mobile
- [x] **Card depth** — `.mkt-card` and `.news-card` gain `box-shadow: var(--shadow-sm)` on hover; topbar subtle drop shadow
- [x] **`prefers-reduced-motion`** — All animations/transitions 0.01ms; `.srl-fill` and `.cl-prog-fill` suppressed
- [x] **ARIA** — FighterScreen ROSTER button: `aria-expanded` + `aria-label`; CalendarScreen EVENTS button: same; sidebar backdrops: `role="button"` + `aria-label`
- [x] CHANGELOG.md `[Unreleased]` section written; TASKS.md, PLANNING.md, CLAUDE.md updated
- [x] 454 tests passing; 0 lint errors; 0 CVEs

---

### ✅ Phase 16 — Stat Range Search (v0.16.0) — 2026-03-18

- [x] `src/constants/statFilters.js` — `STAT_FILTERS` (11 presets, 4 categories) + `FILTER_CATEGORIES`; each entry has `id`, `label`, `category`, `predicate(fighter) → boolean`
- [x] `FighterScreen` — collapsible STAT FILTERS panel; toggle with active-count badge; chips grouped by category; AND logic with existing search + weight filter; CLEAR ALL
- [x] `app.css` — `--teal` + `--gold` CSS vars; stat filter panel CSS classes (toggle, body, category label, chip, chip.on, clear)
- [x] `archetypes.js` — MUAY THAI + CLINCH FIGHTER added to ARCH_COLORS (10 archetypes total)
- [x] `statFilters.test.js` — 35 tests; total 454 passing; 0 lint errors
- [x] CHANGELOG v0.16.0; TASKS.md, PLANNING.md, CLAUDE.md updated

---

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

- [x] `src/hooks/useTheme.js` — persists `'light'|'dark'|'system'`; `data-theme` on `<html>` (ARENA theme and toggle later removed in v0.18.4-dev)
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

## Backlog (Unscheduled — Post v0.18.4)

#### High value
- [ ] **Women's divisions** — Strawweight, Flyweight, Bantamweight (~30 fighters); same seed + scrape pipeline; in Proposed Phase 18 sprint
- [ ] **Keyboard navigation** — arrow keys in sidebar, Tab across screens, keyboard-accessible compare selectors; in Proposed Phase 18 sprint
- [ ] **Stat trend lines** — per-fight trajectory over last N fights; requires scraper to store per-fight stats alongside career averages; needs Chart.js/Recharts decision first
- [ ] **Historical opening line database** — searchable archive of opening lines per fighter across all past fights; BFO scraper (`fetch-odds.js`) is the data source for current lines; historical archive requires additional scraping or manual entry

#### Medium value
- [ ] **Chart.js / Recharts for trend charts** — stat bars are functional but trend charts unlock trajectory analysis; deliberate dependency + `npm audit` decision required before adding
- [ ] **Manual data refresh button** — in-app trigger for same-day stat update without full rebuild; requires a new serverless endpoint with origin check + response validation; add to `connect-src` in both deploy configs
- [ ] **Recently viewed fighter strip** — last 3 viewed fighters; `recent_fighters` sessionStorage key already reserved; low effort

#### Low / nice-to-have
- [ ] **Sound design** — optional click feedback, opt-in only; deliberate decision required before adding audio (new browser API surface)

---

## Definition of Done (per phase)

1. All tasks in the sprint are checked off
2. Manual smoke test passes (all screens render, no console errors)
3. localStorage functions correctly (odds/notes/checklist persist on reload)
4. `npm run validate` exits 0 (runs lint + test + audit in sequence)
5. Changes committed to feature branch; merged to `master`, tagged vN.N.N
6. CHANGELOG.md `[Unreleased]` promoted to version
7. PLANNING.md decisions log updated for any architecture/CSP/data model change
8. New feature branch cut for next phase
