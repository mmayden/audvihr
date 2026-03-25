# PLANNING.md — Audwihr Architecture & Design

This document is the primary reference for Claude and the developer during long-term development. It captures decisions, data models, constraints, and context that should not need to be re-explained between sessions.

---

## Architecture Philosophy

**Vite + React (current).** The app was migrated from a single-file HTML prototype to a full Vite + React project at Phase 3a. The prototype used `babel-standalone` for runtime JSX compilation (~860KB, 1–3s blank-screen penalty) and was unsuitable for web deployment. The Vite build compiles at build time, outputs a static `dist/` folder, and is deployable to Netlify, Vercel, or GitHub Pages.

**Current stack:**
- Vite 6 + `@vitejs/plugin-react` — fast HMR in dev, optimised production bundle
- React 18 + React Router v7 + StrictMode — all components are function components with hooks
- No state management library — `useState` / `useMemo` / custom hooks only
- No CSS framework — global `app.css` with CSS variables as the design system (MONOLITH + ARENA themes)
- Vitest + Testing Library — co-located unit tests, 80% coverage target on utils/hooks
- Build-time scrapers — `fetch-data.js` (UFCStats + Tapology), `fetch-odds.js` (BestFightOdds) — cheerio + Node native fetch
- Runtime APIs (optional) — Polymarket CLOB (free, unauthenticated), The Odds API + Kalshi (paid, silent degradation when absent)
- Serverless proxy — `/api/rss-proxy` (Netlify Functions v2 / Vercel) for RSS CORS bypass

**Deployment target: Vercel (primary) / Netlify (fallback).** Build output is static (`dist/`). Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, CORP) are configured via `netlify.toml` / `vercel.json`. Custom domain: `audvihr.space` (Namecheap DNS).

---

## Vision

> **Audwihr is a personal MMA research tool.** It consolidates deep fighter analytics, live multi-source market intelligence (sportsbook + Polymarket + Kalshi), a structured pre-fight discipline framework, and long-term CLV tracking into one fast, shareable interface — useful whether you're betting, picking, or just watching.

### What It Replaces

| Tab People Currently Open | What Audwihr Provides |
|---|---|
| UFCStats (raw stats, unusable UI) | Fighter profiles with compare screen and archetype/editorial layer |
| BestFightOdds (odds only, no alerts, no history) | Live sportsbook lines + opening line preservation + line movement alerts |
| Tapology (public picks, ads, shallow stats) | Public % fade signal, fight calendar, fighter deep-links |
| Polymarket / Kalshi (prices with zero fighter context) | Unified 3-market view with arb detection + probability sparklines + CLV |
| Personal spreadsheet (manual CLV log) | Automated CLV snapshots, history fetch, log with 500-entry cap |
| Mental pre-fight checklist | 17-item structured trade checklist, per-matchup notes, persistent per-pairing |

**The founding thesis:** A typical MMA fan or bettor opens 5+ browser tabs for every fight they research. Audwihr collapses that into one interface.

---

## User Personas

Audwihr serves four distinct users. Every feature decision should be evaluated against at least one of them.

### 1. The Sharp Bettor (original primary persona)
Thinks in edges, CLV, RLM, and archetype matchups. Runs a 17-item pre-bet process, tracks closing line value, monitors Polymarket vs sportsbook divergence. Wants alerts when a line moves. Uses every screen. The tool was built for this person — they remain the north star.

**Core needs:** Live odds, CLV tracking, line movement alerts, checklist discipline, arb detection, exportable research.

### 2. The Recreational Bettor
Bets 3–5 fights per card on DraftKings or FanDuel. Has opinions but doesn't run a formal process. Wants to quickly gut-check their instinct — "is my favorite actually the better fighter or am I fading public?" Doesn't know what CLV is. Currently finds the app too jargon-heavy.

**Core needs:** Quick fighter comparison, clear stat context ("is this number good?"), archetype matchup at a glance, checklist as a friction-adder before betting, not as a research system.

### 3. The DFS / Pick'em Player
Enters UFC contests on DraftKings or ESPN. Picks 5 fights per card. Cares about finish rate, method props, and styles matchup. Doesn't care about opening lines or Kalshi. Wants to quickly compare two fighters and get a sense of who wins and how.

**Core needs:** Fast fighter lookup, finish rate and method breakdown, styles/archetype comparison, fight calendar for upcoming card, quick compare from calendar.

### 4. The MMA Content Creator / Casual Fan
Does fight breakdowns for a podcast or Discord. Wants fast access to stats without opening 4 browser tabs. The shareable `/compare/:f1id/:f2id` link is the killer feature — paste a comparison into show notes. Cares about screenshots looking good. Doesn't use the market features at all.

**Core needs:** Shareable compare link, clean visual output, archetype/modifier badges that read well in screenshots, fast fighter search.

---

### North Star Feature Set

1. ✅ **Full roster** — top 8–10 fighters per weight class, all 8 active divisions. 69 fighters live as of v0.9.0.
2. ✅ **Line movement alerts** — push notifications when a line moves X points. Delivered in v0.11.0.
3. ✅ **Opening line preservation** — `opening_lines` localStorage key (never evicted). Delivered in v0.9.0.
4. ✅ **Tapology public % integration** — build-time scrape; PUBLIC row + FADE badge (≥15pt divergence). Delivered in v0.9.0.
5. ✅ **Mobile layout** — responsive bottom nav + sidebar drawer; dark/light/system theme. Delivered in v0.10.0.
6. ✅ **Live news integration** — `useNews` hook; DOMParser text-only sanitization; LIVE/MOCK badges. Delivered in v0.12.0. CORS proxy (same-origin `/api/rss-proxy`) delivered in v0.17.0 — live RSS fully functional in production; RSS origins removed from CSP `connect-src`.
7. ✅ **Shareable research** — React Router URL routing; `/compare/:f1id/:f2id` links; MD + CSV export. Delivered in v0.13.0.
8. ✅ **QoL + visual overhaul** — type-to-search, percentile badges, pill badges, fighter cards, pick log, flags pills, compare hero header. Delivered in v0.14.0.
9. ✅ **Matchup Context Engine** — `computeMatchupWarnings` pure function; MATCHUP NOTES section in CompareScreen with 14 archetype rules, 8 style clashes, 10 modifier warnings. Delivered in v0.15.0.
10. ✅ **Stat Range Search** — 11-preset STAT FILTERS panel in FighterScreen sidebar; AND logic with name search + weight class; MUAY THAI + CLINCH FIGHTER colors filled in. Delivered in v0.16.0.
11. ✅ **Mobile-first development (Phase 17)** — `feature/phase-17-mobile` branch. Bottom nav icon + label (emoji + monospace text). `--touch-target: 44px` / `--touch-target-sm: 36px` CSS tokens in all theme blocks. `@media (max-width: 480px)` block: compare hero stacks (F1/VS/F2), headline line-clamp (3 lines, tap to expand), hero portrait 64×64px, stat table horizontal scroll (`overflow-x: auto` + `min-width: 400px`). Swipe-to-close sidebars (FighterScreen + CalendarScreen). News headline expand/collapse. Market live-row collapses. iOS auto-zoom fix (font-size ≥ 16px). CalendarScreen + NewsScreen screen-level tests (16 new tests, 481 total). Delivered in v0.18.0.
12. ✅ **Build-time free sportsbook data (v0.18.3)** — `scripts/fetch-odds.js` BestFightOdds scraper; multi-book moneylines in `src/data/odds.js`. App ships complete sportsbook data with zero paid API keys. `useOdds` + `useKalshi` fully optional. 3-layer data model: BFO baseline → live Odds API override → Polymarket/Kalshi alongside. COOP + CORP security headers. 491 tests.

### What This Is Not

- **Not a pick service.** Every analysis output is explicitly labeled "RESEARCH PROMPT — NOT A PICK."
- **Not a sportsbook or betting interface.** No bet placement, no real-money transactions.
- **Not an AI picks tool.** No black-box models. All edge signals are auditable rules — archetype lookup tables, threshold comparisons, market spread calculations.
- **Not multi-user (yet).** Kalshi API key in browser bundle is an accepted constraint for personal/self-hosted use. Any path to multi-user requires server-side API proxying first.

---

## Current File Structure (Vite + React — v0.18.3)

The single-file prototype (`mma-trader.html`) was retired at Phase 3a. The project is now a Vite + React app with the following modular layout:

```
netlify/
│   └── functions/
│       └── rss-proxy.js      Netlify Functions v2 — RSS CORS proxy; strict ALLOWED_URLS Set (exact-match only); 403 on unlisted url; 512 KB cap; 10s timeout; GET only; no auth header forwarding; served at /api/rss-proxy via config.path
api/
│   └── rss-proxy.js          Vercel serverless function — identical security logic and allowlist; auto-routed at /api/rss-proxy
public/
│   ├── sw.js                 Service Worker — install/activate only; scope /; no fetch handler; satisfies Notification API requirement
│   ├── arena-test.html       Standalone visual prototype for arena atmosphere development (reference only, not linked from app)
│   └── assets/portraits/     Self-hosted fighter portrait images (*.jpg); no CDN, no CSP change required
src/
├── main.jsx                  Entry point — ReactDOM.createRoot + StrictMode; SW registration
├── App.jsx                   URL router — BrowserRouter + Routes; FighterScreenRoute + CompareScreenRoute at module scope (param validation); DisclaimerGate wrapper; 4-layer parallax arena backdrop; bottom nav (icon + label); theme toggle
├── styles/
│   └── app.css               All global styles, CSS variables (design system), responsive breakpoints (767px / 480px), prefers-reduced-motion block (always last)
├── constants/                Pure lookup tables and rule sets — no I/O, no side effects
│   ├── archetypes.js         ARCH_COLORS (10 archetypes), MOD_COLORS (10 modifiers) — CSS var refs
│   ├── checklist.js          CHECKLIST array (17 items), TABS array (6 tab names)
│   ├── compareRows.js        COMPARE_ROW_DEFS — 15 stat-row definitions; (f1, f2) → row objects; optional statKey for tier labels
│   ├── qualifiers.js         CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, ORG_COLOR, RELEVANCE_COLOR, CATEGORY_COLOR — CSS var refs
│   ├── statTiers.js          STAT_TIERS thresholds + getStatTier() — ELITE/ABOVE AVG/AVG/BELOW AVG for 8 stats
│   ├── matchupWarnings.js    computeMatchupWarnings(f1, f2) → Warning[]; pure function, no side effects; internal ARCHETYPE_RULES (14 directional), STYLE_CLASHES (8 symmetric), MOD_RULES (10 modifier-triggered) not exported
│   └── statFilters.js        STAT_FILTERS (11 presets, 4 categories) + FILTER_CATEGORIES; each: { id, label, category, predicate(fighter) → boolean }
├── data/                     Generated or static data — do not hand-edit fighters.js / events.js
│   ├── fighters.js           FIGHTERS array — generated by fetch-data.js at build time (live UFCStats + seed)
│   ├── events.js             EVENTS array — generated by fetch-data.js at build time (upcoming UFC cards + Tapology %)
│   ├── markets.js            MARKETS array — 8 static mock prediction markets
│   ├── odds.js               ODDS object — generated by fetch-odds.js (BestFightOdds multi-book moneylines); keyed by fightKey; do not hand-edit
│   └── news.js               NEWS array — 12 static mock items; fallback for useNews when all RSS sources fail
├── scripts/                  Build-time tools only — never bundled into the app
│   ├── fetch-data.js         UFCStats + Tapology scraper (Node ESM, cheerio, browser UA for Tapology)
│   ├── fetch-odds.js         BestFightOdds scraper (Node ESM, cheerio, browser UA); multi-book moneylines; --dry-run/--ci/--fresh flags; 500ms delay; .raw.json cache
│   └── fighter-seed.json     Editorial data per fighter (archetype, mods, notes, ufcstats_url, portrait)
├── hooks/
│   ├── useLocalStorage.js    useLocalStorage — JSON-serialised state; try/catch with typed defaults
│   ├── useWatchlist.js       useWatchlist — watchlist Set over useLocalStorage; owns watchlist_markets key
│   ├── useOdds.js            useOdds — The Odds API moneylines; 15-min sessionStorage cache (cache_odds_v1); silent degradation; fully optional since v0.18.3 (BFO build-time data is baseline)
│   ├── usePolymarket.js      usePolymarket — Polymarket CLOB prices + lazy history; CLV snapshot; unauthenticated
│   ├── useKalshi.js          useKalshi — Kalshi REST API prices + lazy history; CLV snapshot; requires VITE_KALSHI_API_KEY; silent degradation
│   ├── useTheme.js           useTheme — 'light'|'dark'|'system'; persists to localStorage (theme key); sets data-theme on <html>
│   ├── useAlerts.js          useAlerts — alert rules, Notification API permission, line-movement dispatch; owns alerts_enabled + alert_rules (localStorage), alerts_prev_lines (sessionStorage)
│   └── useNews.js            useNews — fetches RSS via /api/rss-proxy; 30-min cache (cache_news_v1); per-source silent degradation; fallback to news.js mock; returns { items, loading, isLive }
├── utils/
│   ├── odds.js               mlToImplied(), lineMovement() — pure moneyline math
│   ├── date.js               daysUntil(), isPast(), formatDate(), formatEventDate(), countdown() — shared date helpers
│   ├── normalizeOdds.js      fightKey(), probToML(), normalizeOddsApiResponse(), normalizePolymarketMarket(), normalizeKalshiMarket(), normalizePriceHistory() — API response transforms
│   ├── cache.js              readCache(), writeCache(), evictCache() — sessionStorage TTL helpers
│   ├── clv.js                appendCLVEntries(), readCLVLog(), appendOpeningLine(), readOpeningLines() — owns clv_log (500-entry cap) + opening_lines (never evicted) localStorage keys exclusively
│   ├── alerts.js             readAlertsEnabled/write, readAlertRules/write, readPrevLines/write, detectMovements() — owns alerts_prev_lines sessionStorage key exclusively
│   ├── newsParser.js         stripHtml(), parseRssFeed(), classifyCategory(), classifyRelevance(), matchFighterName(), rssItemToNewsItem() — RSS sanitization; DOMParser textContent only; no DOM injection
│   ├── export.js             sanitizeCsvCell(), checklistToMarkdown(), clvLogToCsv(), downloadBlob() — client-side Blob export; CSV formula injection guard
│   ├── fighters.js           findFighterByName(name, fighters) — pure name → ID lookup; last-name fallback; ≥3-char guard
│   ├── percentiles.js        computePercentiles(fighter, allFighters) — per-stat percentile rank vs full roster
│   └── pickLog.js            readPickLog(), appendPick(), updatePickOutcome() — owns pick_log localStorage key exclusively (200-entry cap)
├── components/
│   ├── StatBar.jsx           Horizontal proportional fill bar; explicit max > 0 guard
│   ├── FighterName.jsx       Name → profile link resolver (used in calendar + news item rows)
│   ├── FighterCard.jsx       Compact card: portrait/initials + name + record + archetype + mod badges; interactive and static (compare header) contexts
│   ├── FighterSearch.jsx     Type-to-search combobox; ARIA-compliant (role=combobox, aria-expanded, aria-activedescendant); XSS-safe; blur race guard
│   ├── ChecklistPanel.jsx    17-item trade checklist with progress bar; role=checkbox + aria-checked on each item
│   ├── ErrorBoundary.jsx     Class component error boundary wrapping all screens; RETRY button
│   ├── DisclaimerGate.jsx    Two-step acceptance gate (age 18+ → risk acknowledgement); wraps entire app; persists to localStorage (disclaimer_accepted key)
│   └── PriceChart.jsx        SVG sparkline for prediction-market probability-over-time
├── tabs/
│   ├── TabOverview.jsx       Key numbers + coloured stat bars with tier labels; flags pills (chin/cardio/cut); trader notes; RECENT NEWS (top 2 matched items)
│   ├── TabStriking.jsx       Striking volume, accuracy, knockdowns, position
│   ├── TabGrappling.jsx      Takedowns, submissions, ground control, transitions
│   ├── TabPhysical.jsx       Physical attributes, camp, durability, loss methods
│   ├── TabHistory.jsx        Fight log table with opponent quality
│   └── TabMarket.jsx         BFO sportsbook odds (build-time, multi-book) + manual moneyline entry + live Polymarket/Kalshi prices; line movement; notes (mkt_{fighter.id} key)
├── screens/
│   ├── MenuScreen.jsx        Main navigation (5 items) + ⚙ ALERTS settings panel; version badge
│   ├── FighterScreen.jsx     Sidebar (useRef swipe-to-close) + hero card + 6-tab profile; calls useNews(); aria-expanded on ROSTER toggle
│   ├── CompareScreen.jsx     Hero header (FighterCard × 2, implied prob gap); MATCHUP NOTES; stat table (tier labels, edge stripe, horizontal scroll ≤480px); edge signals; checklist; COPY LINK; ↓ MD export
│   ├── CalendarScreen.jsx    Event sidebar (useRef swipe-to-close) + card detail + fighter deep-links + COMPARE per in-roster bout; aria-expanded on EVENTS toggle
│   ├── MarketsScreen.jsx     Unified market dashboard — 3-layer data: BFO build-time sportsbook (baseline) → live Odds API (override) → Polymarket/Kalshi (alongside); multi-book breakdown; opening line + Tapology %; alert bell; PICK form; PICKS log; CLV ↓ CSV export
│   └── NewsScreen.jsx        RSS feed with category + fighter filters; LIVE/MOCK badge; headline expand/collapse (expandedIds Set; -webkit-line-clamp at ≤480px)
└── test/
    └── setup.js              Vitest setup — jest-dom matchers + in-memory localStorage mock
```

Test files are co-located with source: `*.test.{js,jsx}` next to the file under test.

---

## Design System

### Color Palette (CSS Variables)

Two named theme palettes. Neither is white. Toggle via `data-theme` on `<html>`.

#### MONOLITH — cold electric dark (`:root`, default)
```css
/* Surface / structure */
--bg:           #07080f   /* near-void dark */
--surface:      #0d0f1a   /* deep blue-black */
--surface2:     #121520   /* elevated surface */
--surface3:     #171b28   /* active/selected state */
--border:       #1e2536   /* dark navy border */
--border2:      #283248   /* hover/active border */

/* Text */
--text:         #b8c4d8   /* cold blue-white body text */
--text-dim:     #7890b0   /* muted labels, metadata (WCAG AA ~5:1 vs bg) */
--text-bright:  #dce6f8   /* headings, primary values */

/* Accent */
--accent:       #00c8ff   /* electric cyan — active states, interactive elements */
--accent-dim:   #006888   /* muted cyan */

/* Semantic colors */
--green:        #22d686   /* positive, wins, BJJ/sub hunter arch */
--red:          #f04050   /* negative, losses, danger, boxer-puncher arch */
--dark-red:     #c83040   /* brawler arch, front-runner modifier */
--blue:         #4a90f0   /* wrestler arch, stat filter chips, F2 compare edge */
--purple:       #9070f0   /* counter striker arch */
--orange:       #f07840   /* kickboxer arch, warnings, edge signal flags */
--teal:         #00b8c0   /* muay thai arch */
--gold:         #c8a040   /* clinch fighter arch */

/* Accent tint backgrounds */
--accent-bg:     rgba(0,200,255,.07)   /* subtle accent fill (chips, banners) */
--accent-bg-mid: rgba(0,200,255,.12)   /* medium accent fill (hover states, badges) */

/* Arena atmosphere (v0.18.2) */
--sphere-base:        #050810           /* deepest arena void */
--sphere-mid:         #0a1020           /* mid-depth arena layer */
--sphere-glow:        #00c8ff           /* horizon glow band */
--sphere-pulse-color: rgba(0,200,255,.03) /* ambient breathing pulse */
--surface-glass:      rgba(13,15,26,.75)  /* frosted glass panels (topbar, nav, sidebar) */
```

#### ARENA — warm ember dark (`[data-theme="light"]` + system light preference)
```css
/* Surface / structure */
--bg:           #0f0c08   /* deep charcoal-amber */
--surface:      #181410   /* warm dark surface */
--surface2:     #221e18   /* elevated surface */
--surface3:     #2c2620   /* active/selected state */
--border:       #3a3028   /* tobacco-brown border */
--border2:      #4a3e32   /* hover/active border */

/* Text */
--text:         #cec0a8   /* warm medium text */
--text-dim:     #a08870   /* warm dim labels (WCAG AA ~4.5:1 vs bg) */
--text-bright:  #f0e2cc   /* warm cream headings */

/* Accent */
--accent:       #e06828   /* ember orange — fight-night energy */
--accent-dim:   #904020   /* dark ember */

/* Semantic colors */
--green:        #50c878   /* positive, wins */
--red:          #d03028   /* blood red — losses, danger */
--dark-red:     #b02020   /* brawler arch, front-runner modifier */
--blue:         #5888d0   /* wrestler arch, stat filter chips, F2 compare edge */
--purple:       #9068c8   /* counter striker arch */
--orange:       #e08840   /* kickboxer arch, warnings */
--teal:         #38a890   /* muay thai arch */
--gold:         #c89038   /* clinch fighter arch */

/* Accent tint backgrounds */
--accent-bg:     rgba(224,104,40,.07)   /* subtle ember fill */
--accent-bg-mid: rgba(224,104,40,.12)   /* medium ember fill */

/* Arena atmosphere (v0.18.2) */
--sphere-base:        #100a04           /* deepest arena void — warm */
--sphere-mid:         #1a1008           /* mid-depth arena layer — warm */
--sphere-glow:        #e06828           /* horizon glow band — ember */
--sphere-pulse-color: rgba(224,104,40,.03) /* ambient breathing pulse */
--surface-glass:      rgba(24,20,16,.75)   /* frosted glass panels */
```

Archetype/semantic color primitives differ between themes. All values are still CSS variables — no hardcoded hex in component code.

### Touch Target Tokens
```css
--touch-target:    44px   /* primary interactive elements: nav items, primary buttons */
--touch-target-sm: 36px   /* secondary chips, compact controls */
```
Declared in all three theme blocks. Use `min-height: var(--touch-target, 44px)` — never magic pixel values. iOS minimum is 44px; WCAG 2.5.8 (Level AA) recommends 24px minimum with adequate spacing; 44px exceeds both standards.

### Typography
- Body: `Inter` (weights 300–700)
- Data/Labels/Code: `JetBrains Mono` (weights 400–500)
- Rule: mono for all numbers, stat labels, badges, tags

### Visual Direction

**Guiding principle:** dense-data readability first, immersive atmosphere second. Think scouting terminal inside an arena, not flat dashboard. Neither theme is white. Animations are purposeful: parallax depth, ambient pulse (killed by `prefers-reduced-motion`), sidebar slide-in.

**Theme identity (v0.18.2):**
- **MONOLITH** — cold, electric, data-terminal. Near-void dark blues with cyan highlights. LED grid subtlety. Frosted glass surfaces. Default.
- **ARENA** — warm, amber-lit, fight-night energy. Deep charcoal-amber with ember orange. Same arena atmosphere with warm tones.

**Arena atmosphere (v0.18.2):**
- 4-layer parallax backdrop: deep atmosphere + LED grid + ambient pulse + edge vignette
- Mouse-driven smooth lerp via `requestAnimationFrame`
- Frosted glass (`backdrop-filter: blur(14px)` + `--surface-glass`) on topbar, bottom-nav, sidebar
- `--sphere-*` CSS tokens in all three theme blocks
- `prefers-reduced-motion` kills ambient pulse animation

**Phase 14 visual targets — all delivered in v0.14.0:**

- ✅ **Pill badges for archetype + modifiers.** `WRESTLER`, `SOUTHPAW`, `CARDIO CONCERN` displayed as pill-shaped badges (rounded, monospace, uppercase). Color from `ARCH_COLORS` / `MOD_COLORS` lookup via inline style (runtime data-keyed lookup — correct per CLAUDE.md). CSS classes `.arch-badge` and `.mod-badge` own shape and spacing.
- ✅ **Fighter cards.** CompareScreen uses `FighterCard` components in the hero header. `FighterCard` shows portrait/initials + name + record + archetype + mod badges. Non-interactive use (compare header) strips card box styling via `.compare-fighter-col .fighter-card` override.
- ✅ **Percentile context on stats.** Key stats in TabOverview show `TOP X%` badges computed against the 69-fighter roster. Tier thresholds in `src/constants/statTiers.js`. Tier labels in CompareScreen cells.
- ✅ **Compare screen hero header.** Two `FighterCard` components side by side + VS center column + normalized implied probability gap when market data is available.
- ✅ **Matchup edge stripe.** 3px left-border stripe on compare row category groups (`.cat-row--f1-edge` / `.cat-row--f2-edge`); pre-computed in `categoryEdges` useMemo.
- ✅ **Flags as inline pills.** TabOverview FLAGS section shows CHIN / CARDIO / CUT as colored rounded pills (`.flags-pill-row`, `.flag-pill`) replacing the stat-grid layout.
- ✅ **Pick log.** `pickLog.js` utility + MarketsScreen inline form + PICKS panel. Research discipline: log your pick before the fight, record outcome after.

**Phase 15 deliverables — all delivered in v0.15.0:**

- ✅ **MATCHUP NOTES section.** Rich warning cards in CompareScreen between hero header and stat table. Four visual variants: style (amber, structural edge), risk (red, durability/cardio/cut flags), fade (green, trajectory), clash (blue, symmetric style interaction). Subject badge shows fighter last name + "EDGE" for directional rules; omitted for symmetric clashes.
- ✅ **`matchupWarnings.js` rules engine.** Pure, testable, fully static — no fighter names, no DOM, no side effects. Lookup tables only. 27 tests covering all branches including bidirectional logic, archetype-conditioned modifier amplification, and null-input guards.

**Phase 16 deliverables — all delivered in v0.16.0:**

- ✅ **STAT FILTERS panel.** Collapsible panel in FighterScreen sidebar with 11 preset chips across 4 categories (STRIKING, GRAPPLING, FINISHING, PHYSICAL). Toggle button shows active-filter count badge. Active chips styled in `--blue`. All active filters applied with AND logic — stacks with existing name search and weight class filter. CLEAR ALL button. State is React-only (`Set<string>`) — no localStorage persistence by design; filters reset on navigation.
- ✅ **MUAY THAI + CLINCH FIGHTER archetype colors.** Both were referenced in matchup rules but had no color entry. Now: MUAY THAI → `--teal` (#3aafa9), CLINCH FIGHTER → `--gold` (#c9a84c). `ARCH_COLORS` is now complete — all 10 archetypes have entries.

**Post-Phase-16 Visual & QoL Polish — delivered 2026-03-18:**

- ✅ **Broken CSS variable fix.** `--bg-elevated` and `--bg-card` were referenced by Phase 11 alert styles but never defined. Added as aliases to `--surface2`/`--surface` in all three theme blocks (`:root`, `[data-theme="light"]`, system preference media query). Alert panel UI now renders correctly.
- ✅ **Design tokens expanded.** `--radius-sm`, `--radius`, `--radius-pill`, `--transition`, `--shadow-sm`, `--shadow-md` added to `:root` for use by future components.
- ✅ **Global keyboard focus ring.** `button:focus-visible`, `a:focus-visible`, `[tabindex]:focus-visible` now show a 2px accent-colored outline. All five inputs with `outline: none` had their focus border upgraded from near-invisible `--border2` to `--accent`.
- ✅ **Tab bar scrollbar suppressed.** `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` applied globally to `.tabs-bar`. No scrollbar artifact on any viewport.
- ✅ **Sidebar slide-in animation.** `@keyframes sidebarSlideIn` added; `.sidebar--open` on mobile animates from `translateX(-100%)` to `translateX(0)` in 0.22s.
- ✅ **VS button elevated to real CTA.** Default state upgraded from muted `--border2`/`--text-dim` to `--accent-dim`/`--accent`; hover fills with solid accent background. Full-width on mobile.
- ✅ **Label readability improvements.** `.stat-cell-label` 9px→10px, `.fin-l` 8px→9px, `.stat-tier-label` 8px→9px — addresses the most visible small-text readability gaps.
- ✅ **Mobile touch target compliance.** `.filter-chip` min-height 36px; `.sidebar-fighter` row padding increased; portrait reduced 160px→88px with tighter card identity gap.
- ✅ **Card depth.** `.mkt-card` and `.news-card` gain `box-shadow: var(--shadow-sm)` on hover. Topbar gets 1px drop shadow for layer separation.
- ✅ **`prefers-reduced-motion` support.** `@media (prefers-reduced-motion: reduce)` block at end of `app.css` cuts all animations/transitions to 0.01ms; stat bar and checklist progress fills suppressed.
- ✅ **ARIA improvements.** `aria-expanded` + `aria-label` on ROSTER/EVENTS sidebar toggles in FighterScreen and CalendarScreen; `role="button"` + `aria-label` on sidebar backdrops.

**Immovable rules:**
- All colors from CSS variables — never hardcode hex values in JSX or CSS classes.
- JetBrains Mono for all numbers, stat labels, badges, and codes.
- Reskin-ready: all colors are CSS variables; a full theme can be swapped in one pass.

---

## Data Model

### Fighter Object (full schema)
```javascript
{
  // Identity
  id: Number,
  name: String,
  nickname: String,
  weight: String,           // 'Lightweight', 'Middleweight', etc.
  org: String,              // 'UFC'
  rank: String,             // 'CHAMPION' or '#N'
  age: Number,
  height: String,           // "5'10\""
  reach: String,            // '70"'
  stance: String,           // 'Orthodox' | 'Southpaw' | 'Switch'
  camp: String,
  country: String,

  // Archetype System
  archetype: String,        // one of ARCH_COLORS keys (primary)
  mods: String[],           // up to 3 modifier tags from MOD_COLORS

  // Record
  record: String,           // '26-1' display string
  wins: Number,
  losses: Number,
  draws: Number,
  streak: Number,
  streakType: String,       // 'W' | 'L'
  finishes: { ko, sub, dec },
  losses_by: { ko, sub, dec },
  finish_rate: Number,      // % of wins by finish

  // Qualitative Flags
  chin: String,             // 'Iron' | 'Solid' | 'Questionable' | 'Stopped Before'
  cardio: String,           // 'Elite' | 'Good' | 'Average' | 'Concern'
  weight_cut: String,       // 'Minimal' | 'Moderate' | 'Heavy Cutter' | 'Drain Risk'

  // Striking (per 15 min unless noted)
  striking: {
    slpm: Number,           // sig strikes landed per min
    str_acc: Number,        // accuracy %
    sapm: Number,           // sig strikes absorbed per min
    str_def: Number,        // defense %
    head_pct: Number,
    body_pct: Number,
    leg_pct: Number,
    kd_landed: Number,
    kd_suffered: Number,
    clinch_str_pct: Number,
    distance_str_pct: Number,
    ground_str_pct: Number,
  },

  // Grappling (per 15 min unless noted)
  grappling: {
    td_per15: Number,
    td_acc: Number,         // %
    td_def: Number,         // %
    sub_per15: Number,
    top_time_pct: Number,
    bottom_time_pct: Number,
    ctrl_time_per15: Number,
    pass_rate: Number,      // %
    reversal_rate: Number,  // %
  },

  // Fight History (last 6–10 fights)
  history: [{
    result: 'W' | 'L',
    opponent: String,
    method: String,         // 'KO' | 'TKO' | 'SUB' | 'DEC' | 'NC'
    round: Number,
    event: String,
    year: Number,
    opp_quality?: String,   // 'elite' | 'contender' | 'gatekeeper' | 'unknown' — editorial, from history_overrides in seed
  }],

  // Market (manual entry, persisted to localStorage separately)
  market: {
    ml_open: String,        // moneyline string e.g. '-200'
    ml_current: String,
    odds_ko: String,
    odds_sub: String,
    odds_dec: String,
    public_pct: String,
    notes: String,
  },

  trader_notes: String,     // qualitative analysis, free text
}
```

### Market Object (Phase 4 — prediction markets dashboard)
```javascript
{
  id:          String,    // unique slug e.g. 'ufc315-main'
  event:       String,    // event name
  eventDate:   String,    // ISO date
  fighter1:    String,    // name (may match FIGHTERS roster)
  fighter2:    String,
  weight:      String,
  isTitle:     Boolean,
  closing:     String,    // ISO date — when market closes
  platforms: [{
    name:   String,       // 'Polymarket' | 'Kalshi' | 'Novig'
    f1_ml:  String,       // American moneyline e.g. '-130'
    f2_ml:  String,
    volume: Number,       // USD 24h volume
  }],
  method_props: [{
    label: String,        // 'KO/TKO' | 'Submission' | 'Decision'
    ml:    String,        // American odds for fight ending this way
  }],
}
```

**Arbitrage detection:** `min(f1_implied across platforms) + min(f2_implied across platforms) < 100`
= guaranteed profit by betting F1 on platform with lowest F1 implied and F2 on platform with lowest F2 implied.

### ODDS Object (generated by fetch-odds.js — Phase 17+)
```javascript
// Keyed by fightKey (sorted last-names joined by '_')
{
  [fightKey: string]: {
    fighter1:  string,           // display name as listed on BFO
    fighter2:  string,
    fightKey:  string,           // sorted last-names joined by '_'
    event:     string,           // event name (e.g. 'UFC Seattle')
    books: [{
      source:  string,           // sportsbook name (e.g. 'FanDuel')
      f1_ml:   string,           // American moneyline for fighter 1
      f2_ml:   string,           // American moneyline for fighter 2
    }],
    best: {                      // tightest spread across all books (or null)
      source:  string,
      f1_ml:   string,
      f2_ml:   string,
    } | null,
    ts: string,                  // ISO timestamp of scrape
  }
}
```

**Data flow:** BFO build-time odds populate `liveByKey.sportsbook` in MarketsScreen as the free baseline. Live Odds API data overrides when `VITE_ODDS_API_KEY` is present. Polymarket + Kalshi populate alongside.

### Event Object (generated by fetch-data.js)
```javascript
{
  id:       String,    // slug e.g. 'ufc-315'
  name:     String,    // 'UFC 315: Fighter vs Fighter'
  date:     String,    // ISO date
  org:      String,    // 'UFC'
  card: {
    main:          FightEntry,
    comain:        FightEntry | null,
    prelims:       FightEntry[],
    early_prelims: FightEntry[],
  },
}

// FightEntry shape
{
  f1:           String,           // fighter name (UFCStats canonical)
  f2:           String,
  weight:       String,           // 'Lightweight', etc.
  isTitle:      Boolean,
  weigh_in?:    String,           // 'made' | 'missed' | 'under' — editorial, from event_overrides
  judges?:      String[],         // judge names — editorial, for decision prop research
  tapology_pct?: { f1: Number, f2: Number },  // build-time Tapology community pick % (absent if scrape failed or event not yet on Tapology)
}
```

### Storage Key Schema

**localStorage** (persists across tabs and sessions):
```
cl_{f1id}_{f2id}           checklist state per matchup (object: {id: boolean}) — storageKey = min(f1,f2)_max(f1,f2)
mkt_{fighter.id}           per-fighter market tab data (ml, odds, notes)
watchlist_markets          array of market IDs added to watchlist
clv_log                    CLV snapshot log — array of up to 500 CLVEntry objects (owned by clv.js ONLY)
opening_lines              opening line archive — { [fightKey]: { f1ml, f2ml, ts } } (never evicted, owned by clv.js ONLY)
theme                      'light' | 'dark' | 'system' (owned by useTheme ONLY)
alerts_enabled             boolean global alert toggle (owned by alerts.js ONLY)
alert_rules                { [fightKey]: { enabled: bool, threshold: number } } (owned by alerts.js ONLY)
pick_log                   array of pick records (200-entry cap) — { fightKey, fighter, method, confidence, outcome, notes, ts } — plain text only (owned by pickLog.js ONLY, Phase 14)
disclaimer_accepted        '1' when user has accepted age + risk gate (owned by DisclaimerGate.jsx ONLY)
```

**sessionStorage** (cleared when tab closes):
```
alerts_prev_lines          { [fightKey]: { f1_ml, f2_ml } } — previous line snapshot for movement detection (owned by alerts.js ONLY)
recent_fighters            array of last 3 viewed fighter IDs — [number, ...] (owned by FighterScreen ONLY, Phase 14 stretch)
cache_odds_v1              The Odds API response cache (15-min TTL, owned by useOdds via cache.js)
cache_news_v1              RSS news feed cache (30-min TTL, owned by useNews via cache.js)
cache_poly_*               Polymarket price cache (10-min TTL, owned by usePolymarket via cache.js)
cache_kalshi_*             Kalshi price cache (10-min TTL, owned by useKalshi via cache.js)
```

**Key ownership is exclusive.** Only the listed owner module may read or write each key. No other module writes to these keys directly.

---

## Archetype System

### Primary Archetypes (single select)

Archetype color is registered in `src/constants/archetypes.js` (`ARCH_COLORS`). All 10 archetypes referenced in `matchupWarnings.js` rules are now present in `ARCH_COLORS`.

| Archetype | CSS Variable | Color | In ARCH_COLORS |
|-----------|-------------|-------|----------------|
| WRESTLER | `--blue` | #5b8dd9 | ✅ |
| BJJ / SUB HUNTER | `--green` | #4caf82 | ✅ |
| PRESSURE FIGHTER | `--accent` | #d4a843 | ✅ |
| COUNTER STRIKER | `--purple` | #8b6fd4 | ✅ |
| KICKBOXER | `--orange` | #d4804a | ✅ |
| BOXER-PUNCHER | `--red` | #d95f5f | ✅ |
| BRAWLER | `--dark-red` | #c0392b | ✅ |
| COMPLETE FIGHTER | `--text` | #c8cdd8 | ✅ |
| MUAY THAI | `--teal` | #3aafa9 | ✅ (Phase 16) |
| CLINCH FIGHTER | `--gold` | #c9a84c | ✅ (Phase 16) |

### Modifier Tags (up to 3)
`SOUTHPAW` `VOLUME STRIKER` `KO POWER` `CARDIO CONCERN` `WEIGHT CUT FLAG` `LATE BLOOMER` `FRONT-RUNNER` `STEP-UP CONCERN` `DURABILITY RISK` `GUARD DANGER`

---

## Trade Checklist (17 items)

| Cat | Color | Items |
|-----|-------|-------|
| MARKET | amber | Sharp money / RLM; Public inflation; Implied prob vs edge |
| STYLES | green | Fight location control; Grappling depth; Striking quality; Archetype trap |
| PHYSICAL | purple | Reach & size; Weight cut; Cardio across rounds |
| RISK | red | Chin & damage; Layoff/camp/motivation; Step-up; Judging tendencies |
| METHOD | blue | Finish method; Live betting angle; Round betting value |

Checklist persists per matchup via localStorage. Key = `cl_{f1id}_{f2id}`.

---

## Security Model

### Current State (Vite + React — v0.18.3)

| Surface | Risk | Status |
|---------|------|--------|
| `babel-standalone` CDN | Runtime code execution (~860KB compiler, supply chain risk) | **Eliminated** — Vite compiles at build time, no runtime JSX compiler |
| CDN scripts (React, ReactDOM) | No SRI — CDN compromise could inject arbitrary JS | **Eliminated** — Vite bundles React into `dist/`, no CDN scripts at runtime |
| Google Fonts CDN | No SRI — low risk (CSS/fonts only, no JS) | Acceptable; add SRI if CSP tightened |
| `localStorage` reads | Malformed JSON parsed directly into state | **Mitigated** — `try/catch` with typed default fallback in `useLocalStorage` |
| User inputs (odds fields, notes) | Reflected into UI | **Mitigated** — React JSX escapes by default; `parseInt`/`isNaN` guard on all numeric fields |
| `dangerouslySetInnerHTML` | XSS if used with user input | **Not used** — do not introduce |
| External RSS feed content | Untrusted HTML/JS injected via feed title/description into DOM | **Mitigated** — `newsParser.js` uses `DOMParser('text/html').body.textContent` for all feed content. Tags never rendered. `dangerouslySetInnerHTML` prohibited for feed content. XSS coverage in `newsParser.test.js`. |
| Secrets / credentials | Hardcoded in source | **Mitigated** — `VITE_ODDS_API_KEY` and `VITE_KALSHI_API_KEY` in `.env` (gitignored). Kalshi key sent from browser (accepted constraint for personal tool — see decisions log). |
| Search engine indexing | Personal trading tool exposed publicly | **Mitigated** — `noindex, nofollow` robots meta tag in `index.html` |
| CORS proxy SSRF | `url` param forwarded to arbitrary upstream servers | **Mitigated** — `ALLOWED_URLS.has(url)` exact-match allowlist in both `netlify/functions/rss-proxy.js` and `api/rss-proxy.js`. 2-entry Set (MMA Fighting + MMA Junkie). Any unlisted URL returns 403 immediately. No prefix matching, no hostname matching, no regex — only `Set.has()`. |
| CORS proxy response abuse | Proxy used to exfiltrate large payloads | **Mitigated** — 512 KB response size cap. 10-second upstream timeout. GET-only. No forwarding of client auth headers. |
| Direct browser fetch to RSS origins | Browser bypasses proxy, exposes RSS domains to CSP connect-src | **Eliminated** — RSS origins removed from CSP `connect-src`. Only `useNews` calls the proxy. Any direct fetch to those origins will now be blocked by CSP. |

### Deployment Security (Phase 3a+)

**Content Security Policy** — configured at the hosting layer (not in HTML). Both `netlify.toml` and `vercel.json` enforce the same policy:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  worker-src 'self';
  style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  connect-src 'self'
              https://api.the-odds-api.com
              https://clob.polymarket.com
              https://trading-api.kalshi.com;
  img-src 'self' data:;
  frame-ancestors 'none'
```

Rules:
- Vite's build is fully compiled static JS — no inline scripts, no `unsafe-inline` needed.
- `worker-src 'self'` covers the minimal SW at `/sw.js`. Do not remove it.
- RSS origins (`mmafighting.com`, `mmajunkie.usatoday.com`) are **not** in `connect-src` — the browser contacts them only through the same-origin `/api/rss-proxy` serverless function.
- Every new external domain added to any directive must be documented in the decisions log with justification.

**Additional security headers (deployed):**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

`Cross-Origin-Opener-Policy: same-origin` prevents the page from being opened by cross-origin popups (blocks cross-origin window handle leaks). `Cross-Origin-Resource-Policy: same-origin` prevents the app's resources from being loaded by cross-origin contexts (Spectre/side-channel mitigation). Both must be present in `netlify.toml` and `vercel.json` — add them when deploying to a new host.

**`npm audit` policy:** Run before every merge to `master`. Block on critical/high severity. Document accepted moderate findings in the decisions log below.

**Phase 7 API surfaces (three hooks — current):**
- **The Odds API** (`https://api.the-odds-api.com`) via `useOdds` — sportsbook moneylines. Key in `VITE_ODDS_API_KEY`. Cache in `sessionStorage`. 500 req/month free tier. Degrade silently.
- **Polymarket CLOB API** (`https://clob.polymarket.com`) via `usePolymarket` — no auth for reads. Fetch current prices + `/prices-history` for probability movement charts. Cache current prices in `sessionStorage`; persist snapshots for CLV to `localStorage`.
- **Kalshi REST API** (`https://trading-api.kalshi.com`) via `useKalshi` — key in `VITE_KALSHI_API_KEY`. Fetch current + historical market prices. Degrade silently if key absent.

**Completed phase surfaces (resolved):**
- **Tapology scrape (Phase 9)** ✅ — build-time HTML scrape (no API key). No runtime `connect-src` entry needed.
- **Fighter portrait images (Phase 10)** ✅ — self-hosted `public/assets/portraits/`. No CSP change required.
- **Service Worker + Notification API (Phase 11)** ✅ — SW scope `/`, no fetch handler. Alert body: string concatenation only (`textContent` semantics). `worker-src 'self'` added to CSP.
- **External news feeds (Phase 12)** ✅ — All feed content text-extracted via DOMParser — no HTML reaches the DOM. XSS coverage in `newsParser.test.js`.
- **CORS proxy for live RSS (2026-03-18)** ✅ — `netlify/functions/rss-proxy.js` (Netlify Functions v2) + `api/rss-proxy.js` (Vercel). Strict `ALLOWED_URLS` Set — exact-match only, 2 entries. 403 on any unlisted url. 512 KB cap, 10s timeout, GET only, no auth header forwarding. `useNews` updated to route all fetches through `/api/rss-proxy?url=...`. `mmafighting.com` + `mmajunkie.usatoday.com` removed from CSP `connect-src` — browser can no longer directly contact these origins.

**Phase 17 mobile surfaces (all resolved):**
- **Touch event handlers (Phase 17)** ✅ — `onTouchStart`/`onTouchEnd` on `.sidebar--open` divs (FighterScreen, CalendarScreen). These are internal DOM events — no new external surfaces, no CSP changes required.
- **iOS auto-zoom prevention (Phase 17)** ✅ — `.mkt-alert-threshold` upgraded to `font-size: 16px` on mobile. Security-neutral but UX-critical; prevents involuntary viewport zoom that could disorient users and make the interface unusable.
- **Bottom nav icons (Phase 17)** ✅ — Emoji characters rendered via JSX text nodes in `aria-hidden` spans. No new external resources, no CSP change. Emoji are static strings — no user input, no injection surface.
- **News headline expand/collapse (Phase 17)** ✅ — State is a `Set<string>` of item IDs (internal), toggled onClick. No user content rendered as HTML — all via JSX text nodes as before. No new storage keys, no new network requests.

**v0.18.3 surfaces (all resolved):**
- **Build-time BFO scraper (v0.18.3)** ✅ — `scripts/fetch-odds.js` scrapes BestFightOdds.com at build time only via cheerio (no runtime fetch). No new `connect-src` entry. `src/data/odds.js` is a static generated file consumed by MarketsScreen and TabMarket.
- **COOP + CORP headers (v0.18.3)** ✅ — `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Resource-Policy: same-origin` added to both `vercel.json` and `netlify.toml`. Prevents cross-origin window handle leaks and Spectre-class side-channel attacks.

**v0.18.2 surfaces (all resolved):**
- **DisclaimerGate (v0.18.2)** ✅ — UI-only compliance gate; no server-side age verification (not required for informational tool with no financial transactions). `disclaimer_accepted` localStorage key: try/catch reads, strict `=== '1'` equality, falls back to `false`. No user input collected — only button clicks. No PII stored. No new CSP entries, no new external domains.
- **Parallax arena backdrop (v0.18.2)** ✅ — 4-layer CSS effect via `requestAnimationFrame` + mouse-driven offset. All layers are CSS gradients and pseudo-elements — no external images, no CDN, no CSP change. `prefers-reduced-motion` kills the ambient pulse animation.
- **Frosted glass surfaces (v0.18.2)** ✅ — `backdrop-filter: blur(14px)` on topbar, bottom-nav, sidebar overlay. CSS-only visual effect — no new external surfaces, no CSP change.
- **`--text-dim` contrast fix (v0.18.2)** ✅ — MONOLITH `#3e4a62` → `#7890b0` (~5:1 vs bg); ARENA `#6a5840` → `#a08870` (~4.5:1 vs bg). WCAG AA compliant.

**Completed phase surfaces (continued):**
- **React Router + shareable URLs (Phase 13)** ✅ — `BrowserRouter` in `App.jsx`. URL params contain only numeric fighter IDs. `FighterScreenRoute` and `CompareScreenRoute` validate params with `/^\d+$/` before FIGHTERS lookup. History API navigation requires no CSP change. SPA fallback added to `netlify.toml` (200 redirect) and `vercel.json` (rewrites). `noindex` tag preserved.
- **Export (Phase 13)** ✅ — `src/utils/export.js`; `downloadBlob()` creates a Blob object URL, clicks anchor, revokes immediately. No third-party library introduced. `sanitizeCsvCell()` guards all CSV output against formula injection (`=`, `+`, `-`, `@` prefixed with `'`). No data leaves the browser.

**Standing rule:** Every new external domain added to `connect-src` or `img-src` must be documented in the decisions log with justification.

---

## Research Findings That Drive Design Decisions

### Statistical Findings
- **Most predictive stat:** significant strikes absorbed/min (defense > offense)
- **Volume beats power** as outcome predictor
- **Takedowns only matter when paired with offense** — cosmetic TDs score near zero
- **Wingspan is statistically significant**; stance is NOT
- **Underdogs +200+ won 39% of UFC bouts in 2024** vs 28% historical (systematic underpricing in high-attention fights)
- **Favorites still win 72%** — not a blanket fade-favorites market
- **RLM (Reverse Line Movement)** = key sharp signal; most reliable when it fires on Pinnacle
- **Weight regain after weigh-in** correlates with winner status
- **Judging hierarchy:** Effective striking → Effective aggressiveness → Octagon control

### Community Workflow Findings (r/MMAbetting, r/sportsbook, Twitter/X — March 2026)
- **5-tab minimum per fight:** UFCStats + BestFightOdds + Tapology + sportsbook + Polymarket/Kalshi. No tool integrates them. This is the founding pain point.
- **"UFCStats is unusable"** — universally cited. Interface described as "built in 2003, never updated." The data is trusted; the UI is disliked.
- **"BFO needs alerts"** — the single most-requested feature in MMA betting communities. Push notifications for line moves on specific fights. BestFightOdds has never built an account system.
- **CLV is manual for MMA** — serious bettors spreadsheet their CLV by hand. The friction is high enough that many skip it. No automated tool serves MMA CLV tracking.
- **Prediction market liquidity is thin** — Polymarket/Kalshi praised as calibration tools, not size-bet venues. Liquidity only exists on main events; undercards have 5–8 cent bid-ask spreads. But the *divergence* between Polymarket and sportsbook is itself informative.
- **AI picks are not trusted** — community has tested multiple AI prediction products. None have demonstrated market-beating accuracy in audited conditions. LLMs are accepted as useful for *organizing* research, not for picks. This validates Audwihr's rules-based, explainable approach.
- **CLV framework is accepted, with caveats** — dominant in r/sportsbook. MMA markets are thinner and noisier than NFL/NBA, so CLV results need longer samples to be reliable. Late-breaking camp/injury info creates genuine inefficiency windows CLV doesn't capture.
- **Sharp bettor workflow:** (1) Generate independent probability, (2) compare to Pinnacle + Polymarket, (3) identify gap, (4) line shop at entry, (5) log CLV at closing. BestFightOdds + Pinnacle + personal spreadsheet = the current "stack." Audwihr targets the gap between UFCStats and the spreadsheet.

### Editorial Layer Findings
- **Archetype and qualitative flags capture information UFCStats numbers cannot.** Community consensus: chin, cardio, weight cut, and matchup dynamics (WRESTLER vs COUNTER STRIKER) are decision variables that raw stats don't encode. The editorial seed layer is Audwihr's unique data moat.
- **CLV for prediction markets is entirely untracked.** No tool stores Polymarket/Kalshi closing prices for MMA. Bettors manually screenshot prices. Audwihr's CLV snapshot + history fetch is the first personal prediction-market CLV log for MMA.
- **Opening lines are not preserved by any free tool.** BFO shows current and historical movement, but older events scroll off. An opening-line archive per fighter/fight is a genuine gap.

### Market Size Context
- Global sports betting market: ~$83–95B gross gaming revenue (2024), projected $180B+ by 2030
- US handle grew from ~$5B (2018, post-PASPA) to $120B+ (2024) as state-by-state legalization expanded
- UFC is consistently top-5 most-bet sport on major US sportsbooks; UFC 300 (April 2024) broke multiple sportsbook records
- UFC betting is moving from sharp-dominated niche to mainstream recreational market — creates public inflation on popular fighters = edge for faders
- Action Network (betting analytics SaaS) sold for ~$240M to Better Collective in 2021. Market for serious sports betting tools is validated.

---

## Competitive Landscape (March 2026)

### Platform-by-Platform Breakdown

#### Fighter Stats & Comparison

| Platform | URL | What It Does | Strengths | Gaps |
|---|---|---|---|---|
| **UFCStats** | ufcstats.com | Official UFC statistical database. Career and per-fight striking, takedowns, submissions. Fight logs back to early UFC. | Ground truth — most complete historical data. Primary scrape target. | Zero analytical UI. No comparison, no trends, no rankings. Manual data entry, can lag days post-event. No API. |
| **Tapology** | tapology.com | Fighter profiles (record, history, reach/height), community predictions, event calendar, all promotions. | Broadest promotion coverage. Best event calendar. Community prediction % is useful as noise/fade signal. Strong SEO. | Statistical depth is minimal — no strike accuracy, no grappling metrics. Betting tools absent. Community % is recreational noise. |
| **Sherdog** | sherdog.com | Original MMA database (1997). Career records, historical event listings, The Ground forums. | Deepest historical record coverage, including regional promotions and pre-2000 era. | Site quality has degraded post-2010s. Stats are record-only (no UFCStats granularity). Unreliable uptime. |
| **FightMatrix** | fightmatrix.com | Algorithmic Elo-style fighter rankings across all promotions. Fight-by-fight rating history, algorithmic fight probabilities. | Only widely-used algorithmic ranking system for MMA. Historical rating curves show career trajectories. Cross-promotion comparisons. | Methodology not fully published. Can produce counterintuitive results. No odds integration. Aesthetically minimal. |
| **MMA Decisions** | mmadecisions.com | Judge scorecards for every UFC decision. Round-by-round per judge. Split/majority/controversial flags. | Unique dataset for decision bettors. No other site compiles judge-level round scores this comprehensively. | Narrow scope. No integration with other data. |

#### Odds Tracking & Betting Research

| Platform | URL | What It Does | Strengths | Gaps |
|---|---|---|---|---|
| **BestFightOdds** | bestfightodds.com | Aggregates moneylines from 20+ sportsbooks (Pinnacle, DraftKings, FanDuel, Circa, etc.). Opening lines, current lines, movement graph. | **The essential tool.** Opening line data + Pinnacle line + movement graph. No account, no ads, fast. Used by every serious MMA bettor without exception. | No alerts. No public %. No fighter analytics. No prediction markets. Historical data for old events goes stale. No API. |
| **Action Network** | actionnetwork.com/mma | Odds aggregation, public betting % (bets and money), sharp money indicators, line alerts, staff picks, bet tracker. | Public betting % is the killer feature — only widely accessible source for MMA. Sharp money indicators (RLM, steam) when they fire. Good mobile app. | $20/mo for useful features. MMA is secondary to NFL/NBA. Public % data thin on non-PPV fights. Sharp tools less reliable at MMA volume. |
| **OddsJam** | oddsjam.com | Arbitrage finder, +EV finder, CLV tracker, line shopping across US books. Covers MMA alongside major sports. | Comprehensive sharp-bettor workflow integration. CLV tracking automated. ~$100/mo. Growing user base. | MMA secondary. Expensive for MMA-primary users. No fighter analytics or research layer. |
| **Unabated** | unabated.com | Line shopping, CLV tracking, +EV finder, Pinnacle-calibrated. Most serious US-facing sharp tool. | CLV tracking built-in and serious. +EV finder calibrated to Pinnacle. Growing community. | MMA coverage is secondary. Requires access to multiple sportsbooks and significant capital to exploit findings. ~$59–149/mo. |
| **OddsShark** | oddsshark.com/ufc | Odds aggregation, historical odds database, ATS records by fighter, consensus picks. | Historical odds database useful for retrospective datasets. | Public % is estimated/modeled, not real data. MMA features limited. Site quality declining. |
| **Oddible** (2026) | oddible.com | Multi-sport odds + Kalshi sync + CLV tracking + basic stats. | Validates the market direction (prediction market aggregation + CLV). | Broad/shallow. No archetypes, no checklist, no fighter depth. A tracker, not a research OS. |

#### Prediction Markets

| Platform | URL | What It Does | Strengths | Gaps |
|---|---|---|---|---|
| **Polymarket** | polymarket.com | Decentralized prediction market (Polygon blockchain). UFC fights consistently listed for PPVs and main events. USDC stablecoins. | Real liquidity on big UFC markets. Sophisticated crowd pricing — often sharp on main events. Transparent on-chain data. CLOB API with `/prices-history` (no auth). | US users geofenced. Liquidity thin on undercards (5–8¢ bid-ask spreads). Zero fighter context. No cross-platform view. |
| **Kalshi** | kalshi.com | US-regulated CFTC-approved event contract exchange. Binary contracts on UFC events. iOS/Android app. | **Legal in all US states** — the key unlock. Financial exchange structure. Full historical API. Growing UFC coverage post-CFTC legal win. | Liquidity very thin vs. Polymarket. Even main event depth is shallow. Fees 1–7% per trade. |

### Audwihr's Unoccupied Intersection

```
Deep Fighter Analytics  (UFCStats-derived + editorial archetype layer)
  +  Multi-Source Market Intelligence  (sportsbook + Polymarket + Kalshi unified)
  +  Historical Price Charts  (probability movement sparklines per fight)
  +  Personal Research Workflow  (17-item checklist + per-matchup notes)
  +  CLV Tracking  (automated prediction-market snapshots — first tool to do this for MMA)
  +  Structured Edge Signals  (auditable rules-based, not black-box ML)
```

**As of March 2026, this intersection is empty.** The Oddible launch validates the market is moving toward prediction market aggregation but confirms no one has combined it with deep fighter analytics and a structured research workflow.

**Primary competitive moat:** Not the data (UFCStats is scrapeable by anyone), but the *workflow integration* and the discipline framework (checklist). The archetype/editorial seed layer is the hardest to replicate — it encodes judgment, not just numbers.

**Most credible threat:** BestFightOdds adding a fighter comparison UI, or Action Network deepening MMA coverage with UFCStats integration. Neither has shown any sign of doing so.

### New API Capabilities (Phase 7 Unlocks)

**Polymarket CLOB API `/prices-history`** — live, no auth, returns price history at configurable intervals. Enables real probability movement charts. Market slug maps to fight.

**Kalshi historical market endpoints** — full historical price data via REST. Free API key. Same chart capability as Polymarket history.

**Tapology community % (quasi-public)** — community pick aggregate % is accessible. The "public money" column: recreational consensus alongside sharp market prices = fade signal. Phase 9 target.

---

## Edge Score Architecture

A simple client-side "edge score" per matchup — no ML, no backend. Weighted rules derived entirely from existing seed data and market data. Surfaces in CompareScreen and fighter Market tab.

**Inputs:**
- Archetype mismatch severity (e.g., WRESTLER vs COUNTER STRIKER → high mismatch)
- Market discrepancy (sportsbook implied % vs Polymarket implied % — divergence = potential edge)
- Qualitative flag count (chin risk + cardio concern + heavy cut = elevated risk multiplier)
- Public money skew (Tapology % vs market implied — if rec crowd is heavy on one side, fade signal)

**Output:** A single score (0–100) or directional signal per fighter in the matchup. Not a pick — a research prompt. "This matchup has high edge potential — review RISK checklist items."

**Why rules-based, not ML:** The seed data is editorial, not large enough for training. Rule transparency matters — a sharp needs to understand *why* the score is what it is, not trust a black box. Rules are auditable, explainable, and adjustable per fight.

---

## Phase 9–17 Roadmap Outline

Ordered by value vs. effort. Full sprint tasks in TASKS.md.

| Phase | Theme | Core Deliverables | Security Notes |
|---|---|---|---|
| **Phase 9** ✅ | Roster expansion + public signal | 69 fighters (top 8–10 per division, all weight classes). Tapology public % column with FADE badge in MarketsScreen. Opening line preservation (`opening_lines` localStorage key). `NOT IN ROSTER` stub rows for live-only fights. | Tapology build-time scrape, browser Chrome UA (CORS prevents runtime). All new fighter seed data validated at scraper boundary. |
| **Phase 10** ✅ | Mobile + UX polish | Responsive bottom nav (< 768 px). Sidebar drawer overlay (FighterScreen + CalendarScreen). Dark/light theme toggle (`useTheme`, localStorage, `data-theme` on `<html>`, system preference via `prefers-color-scheme`). Fighter portrait field (nullable, self-hosted `/public/assets/`, initials fallback). Visual hierarchy audit (`fighter-link` → `--blue`; mono font for `.flag-value` + `.stat-cell-attr-val`). | Portrait images: self-hosted `public/assets/portraits/` — no CSP change required. Cloudinary deferred. Theme toggle: CSS variable swap only, no new external resources. |
| **Phase 11** ✅ | Alerts + notifications | `public/sw.js` minimal SW (install/activate, no fetch handler). `useAlerts(oddsData?)` hook: alertsEnabled + alertRules (localStorage), prevLines (sessionStorage), `detectMovements()` pure fn, browser `Notification` API dispatch. Bell icon + threshold input per fight in MarketsScreen. ⚙ ALERTS settings panel in MenuScreen (global toggle + permission request). Silent degradation when Notification unavailable, denied, or alertsEnabled=false. 239 tests. | SW scope `/`, no fetch handler, `worker-src 'self'` added to CSP. Alert body constructed with string concatenation (`textContent` semantics) — no HTML interpolation, no `innerHTML`, no template-literal HTML tags. `detectMovements()` is pure — no DOM access. All localStorage reads in `alerts.js` are try/catch-wrapped with typed defaults. |
| **Phase 12** ✅ | Live news layer | `useNews` hook: fetches MMA Fighting + MMA Junkie RSS, parses XML via DOMParser, strips HTML to textContent, classifies category/relevance, matches fighters by last name. 30-min sessionStorage cache. Falls back to static mock when CORS blocks (expected in production). LIVE/MOCK badges in NewsScreen + per item. TabOverview RECENT NEWS section (top 2 matched items). | **Critical met:** `stripHtml()` uses DOMParser textContent only — no innerHTML, no dangerouslySetInnerHTML with feed content. XSS test coverage in `newsParser.test.js`. |
| **Phase 13** ✅ | Sharing + export | `react-router-dom` v7: `BrowserRouter` + `Routes` in `App.jsx`; all 6 screens URL-addressable; `FighterScreenRoute` + `CompareScreenRoute` validate numeric URL params. Shareable `/compare/:f1id/:f2id` URL; COPY LINK button (user-initiated clipboard write). `src/utils/export.js`: `checklistToMarkdown()` + `clvLogToCsv()` + `downloadBlob()` (Blob revoke pattern). ↓ MD button in CompareScreen; ↓ CSV button in MarketsScreen CLV panel. SPA fallback in netlify.toml + vercel.json. 333 tests. | URL params: positive integers only — `parseId()` validates with `/^\d+$/` + `parseInt`. Clipboard write user-initiated only. CSV formula injection guard in `sanitizeCsvCell()`. Object URL revoked synchronously after click. No data to third-party services. |
| **Phase 14** ✅ | QoL + visual overhaul | `FighterSearch` combobox (ARIA-compliant; XSS-safe). `FighterCard` component (portrait/initials + arch/mod badges; interactive + static contexts). CompareScreen hero header with `FighterCard` × 2 + normalized implied probability gap. Category edge stripe (`categoryEdges` useMemo; `.cat-row--f1-edge/f2-edge`). `computePercentiles` + `TOP X%` badges in TabOverview. `statTiers.js` + tier labels in compare cells. TabOverview FLAGS → inline `.flags-pill-row` pills. Arch/mod pill badges everywhere. `pickLog.js` utility (200-entry cap, plain text). MarketsScreen `+ PICK` per card + inline form + PICKS log panel. VS./COMPARE in FighterScreen. COMPARE buttons in CalendarScreen. 392 tests; 0 lint errors. | `FighterSearch` input: `.trim()` + `.toLowerCase()` — results via JSX only, no innerHTML. `pick_log` key owned exclusively by `pickLog.js`; stored values coerced to `String()`, never HTML; `try/catch` on every read. Implied probability gap computed from pre-validated numeric values only. `useNavigate` (react-router-dom) — tests use MemoryRouter. No new external domains; no CSP changes; no new runtime npm dependencies. |
| **Phase 15** ✅ | Matchup Context Engine | `src/constants/matchupWarnings.js` — `computeMatchupWarnings(f1, f2)` pure function; returns `Warning[]`. Three rule sets: `ARCHETYPE_RULES` (14 directional matchup edges), `STYLE_CLASHES` (8 symmetric interactions), `MOD_RULES` (10 modifier-triggered notes, optionally conditioned on opponent archetype). All rule strings static — fighter names substituted by CompareScreen at render. MATCHUP NOTES section in CompareScreen between hero header and stat table; four visual variants: style (amber), risk (red), fade (green), clash (blue). 27 tests (27 new); 419 total. | Pure function with no DOM access, no side effects, no external calls. All rule strings are hardcoded static literals — no user input interpolated. `computeMatchupWarnings` called in `useMemo` in CompareScreen; result rendered via JSX text nodes only. No new external domains; no CSP changes; no new runtime dependencies. |
| **Phase 16** ✅ | Stat Range Search | `src/constants/statFilters.js` — 11 preset filter definitions (4 categories: STRIKING, GRAPPLING, FINISHING, PHYSICAL); each: `{ id, label, category, predicate(fighter) → boolean }`. FighterScreen collapsible STAT FILTERS panel: toggle button with active-count badge, chips grouped by category, AND logic with existing name search + weight class filter, CLEAR ALL. MUAY THAI + CLINCH FIGHTER added to ARCH_COLORS (`--teal` #3aafa9, `--gold` #c9a84c). 35 tests (35 new); 454 total. | Predicate functions are pure closures over static thresholds — no I/O, no side effects. Input to predicates is the in-memory FIGHTERS array (build-time scraped, validated at fetch time). No new external domains; no CSP changes; no new runtime dependencies. Active filter set stored as React state (`Set<string>`) — no localStorage, no URL params. |
| **v0.17.0** ✅ | CORS Proxy + Visual & QoL Polish | `netlify/functions/rss-proxy.js` + `api/rss-proxy.js` — same-origin serverless RSS proxy. `useNews` routes all fetches through `/api/rss-proxy?url=...`. MMA Fighting + MMA Junkie removed from CSP `connect-src`. Visual polish: broken CSS variable fix (`--bg-elevated`, `--bg-card`), design tokens, global focus rings, sidebar slide animation, VS button CTA, label readability, mobile touch targets, card depth, `prefers-reduced-motion` support, ARIA on sidebar toggles. 2 tests (proxy routing); 456 total. | SSRF prevention: `ALLOWED_URLS.has(url)` — exact Set equality only, 2-entry allowlist, no patterns. 403 on any unlisted URL. 512 KB response cap, 10s timeout, GET only, no auth header forwarding. RSS origins removed from browser-reachable `connect-src`. Proxy runs server-side only — zero CORS exposure. No new runtime npm dependencies; no new external domains beyond the proxy itself. |
| **v0.18.1** ✅ | Visual Identity + Bug Fix | **Delivered v0.18.1.** MONOLITH theme (cold electric dark, cyan `#00c8ff` accent) + ARENA theme (warm ember dark, orange `#e06828` accent) replace the old light/dark palette. `--accent-bg` / `--accent-bg-mid` CSS tokens; 10 hardcoded gold rgba values removed. `.topbar` padding fix (button overlay). `useTheme` labels → ARENA / MONOLITH. No new external surfaces. | No new CSP entries; no new npm deps; no new external domains. CSS variable substitution only. |
| **v0.18.2** ✅ | DisclaimerGate + Arena Atmosphere | **Delivered v0.18.2.** Two-step DisclaimerGate (age 18+ → risk acknowledgement) wraps entire app; `disclaimer_accepted` localStorage key. Immersive arena backdrop: 4-layer parallax (deep atmosphere, LED grid, ambient pulse, vignette), mouse-driven smooth lerp. Frosted glass on topbar, bottom-nav, sidebar. `--text-dim` WCAG AA contrast fix. `--sphere-*` + `--surface-glass` CSS tokens. TabOverview KEY STATS: percentile badges → coloured stat bars with tier labels. `arena-test.html` visual prototype. 481 tests. | DisclaimerGate: UI-only, no PII, `try/catch` localStorage. Parallax: CSS gradients + pseudo-elements, no CDN. `prefers-reduced-motion` kills pulse. No new CSP entries; no new npm deps; no new external domains. |
| **v0.18.3** ✅ | Build-Time Free Odds Pipeline | **Delivered v0.18.3.** `scripts/fetch-odds.js` — BestFightOdds cheerio scraper (browser UA, `--dry-run`/`--ci`/`--fresh`, 500ms delay, `.raw.json` cache). `src/data/odds.js` — generated multi-book moneylines keyed by fightKey. MarketsScreen 3-layer data: BFO baseline → live Odds API override → Polymarket/Kalshi alongside. TabMarket SPORTSBOOK ODDS section. `useOdds` + `useKalshi` fully optional — app ships complete sportsbook data with zero paid API keys. COOP + CORP headers added. 491 tests (10 new odds tests + test fix for ODDS mock). | BFO is build-time only — no `connect-src` CSP change. COOP + CORP headers prevent cross-origin window handle leaks and Spectre-class side-channel attacks. 0 new npm deps; 0 new external domains at runtime. |
| **Phase 17** ✅ | Mobile-First UX | **Delivered v0.18.0.** Bottom nav: emoji icon + label stack, `min-height: var(--touch-target, 44px)`. `--touch-target: 44px` / `--touch-target-sm: 36px` tokens in all theme blocks. `@media (max-width: 480px)`: compare hero stacks (F1/VS/F2); headline line-clamped 3 lines; `.card-portrait` 64×64px; `.compare-table-wrap { overflow-x: auto }` + `.ctable { min-width: 400px }` for horizontal scroll. Swipe-to-close sidebars (`useRef` + `onTouchStart`/`onTouchEnd`; velocity ≥ 80 px/s OR drag ≥ 112px). Stat filter chips 36px; filters body scrollable. News cat chips horizontal-scroll. Markets live-row 1fr; threshold input 16px (iOS fix); PICKS scrollable. Calendar COMPARE btn 36px. `CalendarScreen.test.jsx` (7 tests) + `NewsScreen.test.jsx` (9 tests). 481 tests total. | No new CSP surfaces (touch events are internal DOM). No new npm dependencies. `font-size ≥ 16px` enforced on `.mkt-alert-threshold` — iOS auto-zoom rule codified in CLAUDE.md. `card-portrait` at 64px is self-hosted, no CSP change. |

---

## Phase 18+ Roadmap Candidates

All 11 North Star features are delivered through v0.18.0. Build-time free sportsbook data pipeline shipped in v0.18.3 (BFO scraper). These are the ranked next candidates based on value vs. effort and security surface introduced.

| Priority | Theme | Candidate | Effort | Security Notes |
|---|---|---|---|---|
| **High** | Data depth | **Stat trend lines** — per-fight trajectory (last N fights) for key stats (slpm, td_acc, str_def). Requires scraper enhancement to store per-fight stats alongside career averages in `fighters.js`. | Med (scraper + new tab/chart component) | No new external surfaces. Per-fight data validated at scraper boundary. If Chart.js/Recharts added: run `npm audit`; new package must not introduce CDN scripts. |
| **High** | Roster coverage | **Women's divisions** — Strawweight, Flyweight, Bantamweight (~30 fighters). Same seed + scrape pipeline as men's roster. | Med (data entry + scrape runs) | No new external surfaces. Same security model as existing roster. UFCStats URLs sourced from letter-page pagination (same pattern). |
| **Med** | Research depth | **Historical opening line database** — searchable archive per fighter across all past fights. Requires either a scrape source for historical odds or a manual entry flow. | High (data source TBD) | If any new external odds source added: `npm audit`, new domain added to `connect-src`, documented in decisions log. |
| **Med** | Navigation | **Keyboard navigation** — arrow keys in sidebar list, Tab across screens, keyboard-accessible compare selectors. Pure UX/ARIA work, no new data surfaces. | Med (ARIA + event handlers) | No new external surfaces. All keyboard events are internal DOM — zero CSP changes. `aria-activedescendant` + `role="listbox"` required for sidebar. |
| **Med** | Data freshness | **Manual data refresh button** — in-app trigger for same-day stat update without full rebuild. Requires a serverless function that wraps the scraper or a scheduled CI job. | High (build API endpoint) | New serverless endpoint must enforce origin check + optional auth token. Response must be validated before merging into app state. Add endpoint to `connect-src` in both deploy configs. |
| **Low** | UX | **Recently viewed fighter strip** — last 3 viewed fighters (sessionStorage `recent_fighters` key already reserved in storage table). Pure client-side. | Low | No new external surfaces. Key already allocated in storage table and owned by FighterScreen. |

### Phase 18 Security Gate (apply before starting any new phase)

Before beginning a new phase, verify:
1. `npm audit` — zero critical/high CVEs on `master` at branch cut
2. Identify every new **external domain** the feature requires → add to both `netlify.toml` and `vercel.json` CSP and document in decisions log
3. Identify every new **storage key** → add to the storage key ownership table in CLAUDE.md; assign exactly one owner module
4. Identify every new **user input surface** → plan sanitization strategy (trim + validate type + clamp length) before writing the component
5. Identify every new **serverless endpoint** → plan allowlist validation, response size cap, method restriction, no auth header forwarding
6. Identify every new **npm dependency** → `npm audit` the package; if it introduces CDN resources, require SRI hash

---

## Known Constraints & Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| Phase 2 | Stay single-file | Not complex enough to justify build tooling yet; local-file use case |
| Phase 2 | Manual odds entry only | No free UFC odds API; user enters from Polymarket/Kalshi directly |
| Phase 2 | Mock data in JS objects | Live data API (UFCStats, SportRadar) planned Phase 6 |
| Phase 2 | No portrait images | Rights/hosting complexity; placeholder until Phase 5 |
| Phase 2 | localStorage not IndexedDB | Data volume is small; no need for relational storage yet |
| Phase 3 | Static EVENTS array | No live event API; user enters card data manually same as fighter data |
| Phase 3 | FighterName at top-level | Was nested inside CalendarScreen (React anti-pattern); extracted to stable module-level component |
| Phase 3a | Vite migration is now required | App will be hosted on web — babel-standalone is a production blocker (~860KB runtime compiler). Must migrate before live deployment. |
| Phase 4 | useWatchlist hook wraps useLocalStorage | Isolates the `watchlist_markets` key and toggle logic; keeps MarketsScreen focused on presentation |
| Phase 4 | computeArb / helpers at module scope | Pure functions with no state dependencies belong outside the component render — consistent with CLAUDE.md module-level constant rule |
| Phase 5 | fighter_id nullable in NEWS items | Some news covers multiple fighters or general events; null fighter_id means the item is not filterable by fighter but still visible in ALL mode |
| Phase 5 | Relevance field on news items | Three-tier signal (high/medium/low) used as a trading-relevance indicator rather than arbitrary tagging — mirrors the checklist's categorical weighting |
| Phase 5 (cleanup) | Tab props renamed f → fighter | Single-letter prop names at API level are prohibited by CLAUDE.md; internal aliases (const s = fighter.striking) kept for brevity |
| Phase 5 (cleanup) | ARCH_COLORS / MOD_COLORS use CSS var() | Colors were previously hardcoded hex, violating the "all colors from CSS variables" standard; --dark-red added to cover BRAWLER / FRONT-RUNNER |
| Phase 6 | Build-time scraper, not live API | UFCStats has no public API. Build-time HTML scraping with cheerio is the only viable approach. Stats are compiled into `fighters.js` at build time — zero runtime network requests, no API key required. |
| Phase 6 | `ufcstats_url` stored in seed file | UFCStats search endpoint returns all fighters alphabetically (not filtered). Direct URL per fighter is the only reliable lookup strategy. |
| Phase 6 | Hybrid seed + scrape data model | UFCStats provides career stats, record, history. Seed provides: archetype, mods, chin, cardio, weight_cut, camp, country, extended striking/grappling breakdowns, trader_notes. Separation of concerns: live source vs editorial judgment. |
| Phase 6 | `prebuild` npm hook runs scraper | Guarantees `fighters.js` and `events.js` are fresh before every `npm run build` in CI. Local dev can use cached `.raw.json` files (500ms per-fighter delay only on cache miss). |
| v0.6.1 | `date.js` extracted from CalendarScreen / MarketsScreen | `daysUntil` and `isPast` were duplicated across two screens. Extracted to `src/utils/date.js` as shared utilities; 6 tests added. |
| v0.6.1 | `ErrorBoundary.jsx` added | Class component error boundary wraps all screens in `App.jsx`. A single screen crash no longer takes down the full app. Includes RETRY button. |
| v0.6.1 | CompareScreen `hi` property bug fixed | Row property `hi: true/false` was silently ignored (line 75 reads `r.higherIsBetter`). All rows now use `higherIsBetter` consistently. Win/lose highlights now correct for Win Streak, SLpM, Str Absorbed rows. |
| 2026-03-15 | Phase 7 scope expanded to three APIs | Original plan was The Odds API only. Grok analysis + community sentiment confirmed that the unique differentiator requires sportsbook + Polymarket + Kalshi in one unified view. No existing tool does this. Polymarket CLOB `/prices-history` endpoint (now live, no auth) enables probability movement charts — changes the ceiling of what Phase 7 can deliver. |
| 2026-03-15 | CLV tracking added to Phase 7 scope | Polymarket/Kalshi CLV tracking is entirely unserved. Community bettors screenshot prices manually. Price snapshots via localStorage (existing infrastructure) + API history fetch = first personal prediction-market CLV log for MMA. Low-code, high-value. |
| 2026-03-15 | "Archetype unknown" fallback required for Phase 7 | The Odds API will return fights with fighters not in the 14-fighter seed. Must render a stub profile (stats only, no editorial layer) rather than crashing. Prevents roster constraint from breaking the markets screen. |
| 2026-03-15 | Edge score deferred to Phase 7 "should have" | Weighted rules-based score (archetype mismatch + market discrepancy + flag count). No ML. Inputs are all available from existing seed data. Valuable but not core to the "oh shit" unlock — which is the unified market view + price history charts. |
| 2026-03-15 | Oddible (2026 competitor) assessed, no threat to core position | Oddible is a multi-sport odds tracker with CLV and Kalshi sync. Lacks deep fighter profiles, archetypes, qualitative flags, trade checklist. Different product category (tracker vs research OS). Validates the market direction but does not occupy the Audwihr intersection. |
| 2026-03-15 | App stays personal-only through Phase 7 | No URL routing, no shareable links, noindex tag stays. Personal lean = faster velocity. React Router deferred to Phase 8+ pending a deliberate decision on whether sharing is ever in scope. |
| 2026-03-15 | Pre-fight focus only through Phase 7 | Live round-by-round data is expensive, requires official data partner (Sportradar/SportsDataIO), and is a different product category. Post-fight review requires historical result storage. Both deferred indefinitely. |
| 2026-03-15 | Client-side Kalshi API key accepted as constraint | `VITE_KALSHI_API_KEY` is sent in an Authorization header from the browser bundle. This is an accepted risk for a personal, self-hosted tool: only the person who deploys the app with their own `.env` can access it; no shared endpoint, noindex, no public exposure. If the app becomes multi-user or public, the Kalshi API calls must be proxied server-side. |
| 2026-03-15 | Shared cache.js + clv.js utilities extracted | `readCache`/`writeCache` were duplicated across 3 hooks; `appendCLVEntries`/`readCLVLog` were duplicated across 2 hooks. Extracted to `src/utils/cache.js` and `src/utils/clv.js`. Both at 100% test coverage. |
| 2026-03-15 | Phase 8 — inline styles → CSS classes (v0.8.0) | ~33 static `style={{}}` blocks replaced with 35 named CSS classes in `app.css`. Dynamic/computed styles (archetype colors, countdown colors, org badge colors, stat conditional colors) kept inline intentionally. Unblocks mobile layout and theming. JS bundle −2 kB; CSS +4 kB. |
| 2026-03-15 | compareRows.js extracted to src/constants/ | 15 stat-row definitions moved from CompareScreen render body to `src/constants/compareRows.js` as `(f1, f2) → row` functions. Zero behavior change; enables future reuse and isolated testing. |
| 2026-03-15 | opp_quality / weigh_in / judges editorial fields added | Added to `fighter-seed.json` as `history_overrides` and `event_overrides`; applied at build time by `fetch-data.js`. Enables opponent quality tracking and decision prop research without changing scraper's live data pipeline. |
| 2026-03-15 | Edge score deferred from ML to rules-based signals | `computeEdgeSignals()` in CompareScreen uses archetype mismatch table, modifier flag sets, and market discrepancy threshold (≥15pt). Labeled "RESEARCH PROMPT — NOT A PICK". Rules are auditable and adjustable per fight — preferred over ML given seed data volume. |
| 2026-03-15 | All 5 remaining `export function` components → `export const` | ChecklistPanel, CalendarScreen, CompareScreen, FighterScreen, MarketsScreen. CLAUDE.md standard: prefer const arrow functions for components. Utils and hooks retain `function` declarations per the exception rule. |
| 2026-03-16 | Vision statement formalized; north star feature set locked | Deep competitive research (March 2026) confirmed Audwihr's intersection is unoccupied. Vision: "research OS for serious MMA bettors" — replaces 5 browser tabs. North star: full roster, line movement alerts, Tapology public %, mobile, live news, shareable URLs. |
| 2026-03-16 | Phase 9–13 roadmap approved | Sequenced by value/effort: Phase 9 (roster + public signal), Phase 10 (mobile + UX), Phase 11 (alerts), Phase 12 (live news), Phase 13 (sharing + export). Each phase has a dedicated security note documenting the new attack surface introduced. |
| 2026-03-16 | Phase 12 live news: external content must be text-only sanitized | RSS/HTML feeds from MMA Fighting, ESPN, etc. are untrusted external content. Must extract text only — no HTML pass-through to DOM. `dangerouslySetInnerHTML` is prohibited with this content. |
| 2026-03-16 | Phase 13 export: client-side only, no third-party data egress | Any PDF/markdown export must be generated entirely in the browser. No data sent to a third-party PDF service. If a library is introduced, run `npm audit` before merge and document accepted findings. |
| 2026-03-16 | Phase 11 Service Worker: same CSP connect-src, no new domains | Line movement alerts use SW polling of existing API endpoints (The Odds API, Polymarket, Kalshi). No new `connect-src` entries needed. Alert text rendering must use textContent not innerHTML. |
| 2026-03-16 | Tapology public %: build-time scrape (v0.9.0, resolved) | Community pick % scraped at build time via `scrapeTapologyEventPct()` in `fetch-data.js`. Same cheerio pattern as UFCStats; browser Chrome UA required (CORS prevents runtime fetch). `tapology_pct` embedded in `events.js` per fight. No new runtime `connect-src` entry. |
| 2026-03-16 | Phase 9 kick-off: opening line first, then stubs, then roster | Sequenced by code-only vs. data effort. Opening line preservation (clv.js + useOdds.js) and "NOT IN ROSTER" stubs are pure code changes — fast, testable. Roster expansion (fighter-seed.json + fetch-data run) is labor-intensive data entry and done last. |
| 2026-03-16 | Opening line key stored separately from CLV snapshot log | `opening_lines` localStorage key holds a flat object `{ [fightKey]: { f1ml, f2ml, ts } }`. Separate from the rolling CLV log so opening lines are never evicted by the 500-entry cap. `CLV_OPENING_KEY` constant in clv.js. |
| 2026-03-16 | "NOT IN ROSTER" stubs shown in MarketsScreen only | Live fights from The Odds API with no matching roster fighter render a stripped-down row (name, moneylines, implied %) in MarketsScreen. FighterScreen, CompareScreen, and TabMarket are profile-centric — no stub profile is created there. |
| 2026-03-24 | Build-time BFO odds scraper replaces paid Odds API as free sportsbook baseline | BestFightOdds.com scraped at build time by `scripts/fetch-odds.js` (cheerio, browser UA, same patterns as fetch-data.js). Multi-book moneylines per UFC fight written to `src/data/odds.js` keyed by fightKey. BFO is build-time only — no `connect-src` change needed. `useOdds.js` (The Odds API) and `useKalshi.js` become fully optional; app ships complete sportsbook data with zero paid API keys. |
| 2026-03-24 | COOP + CORP security headers added to deploy configs | `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-origin` added to both `vercel.json` and `netlify.toml` per CLAUDE.md requirement. Prevents cross-origin window handle leaks and Spectre-class side-channel attacks. |
| 2026-03-16 | Roster expansion seed: 55 fighters added with pending flag | Editorial data (archetype, mods, chin, cardio, notes) written for all 55 new fighters (IDs 15–69). UFCStats URLs not yet sourced — "pending": true flag causes scraper to skip without error. When URLs are filled and flag removed, fighters activate fully on next build. |
| 2026-03-16 | Tapology community % → build-time scrape (not runtime fetch) | Tapology does not send CORS headers — browser-side fetch would fail silently. Build-time HTML scrape (same cheerio pattern as UFCStats) avoids CORS and matches the existing data pipeline. Stale-at-fight-night risk is acceptable: % shifts slowly early in fight week; main value is public-bias signal, not live accuracy. No new connect-src entry needed. fetch-data.js will scrape Tapology event pages and embed tapology_pct per fight in events.js. |
| 2026-03-16 | Phase 9 complete: 69 fighters, Tapology live, opening lines live | All 55 pending fighters sourced and activated (IDs 15–69; 69/69 scrape OK). UFCStats URLs found via letter-page pagination (`?char=X&page=N`); Moicano required UFC 311 event page (listed as Carneiro on UFCStats). Tapology scraper uses browser Chrome UA to bypass 403; `#sectionPicks` div contains `.chartRow` pairs (label + `.number` text — SVG bar heights are decorative). NFD normalization (`str.normalize('NFD').replace(/\p{Diacritic}/gu, '')`) resolves diacritic mismatches (e.g. Procházka). `tapologyByKey` module-level IIFE in MarketsScreen (static derived data → no useMemo). Fade signal fires when |public_pct − sportsbook_implied| ≥ 15pt → amber FADE badge. |
| 2026-03-16 | Phase 10 kick-off: CSS-first mobile, no new JS dependencies | Responsive layout via CSS media queries only — no JS resize listeners, no new packages. Bottom nav replaces sidebar on `< 768px` viewports. Dark/light theme via `:root` CSS variable swap (all colors already tokenized). Portrait images decision deferred to implementation: evaluate self-hosting (`public/assets/`, no CSP change) vs Cloudinary (`img-src` addition required). `portrait` field added to seed schema as nullable. |
| 2026-03-16 | Portrait images: self-hosted `public/assets/` chosen over Cloudinary | No CSP change required. `portrait` field added to `fighter-seed.json` schema as nullable string (path relative to `/public/assets/portraits/`). FighterScreen renders `<img>` when portrait is set; shows 2-letter JetBrains Mono initials otherwise. All 69 fighters default to `null` — images can be dropped into `public/assets/portraits/` without a build step. |
| 2026-03-16 | Theme toggle: `data-theme` attribute on `<html>` drives CSS variable swap | `[data-theme="light"]` and `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) }` in `app.css`. User preference stored as `'light' \| 'dark' \| 'system'` in `localStorage` via `useTheme` hook. `'system'` removes the attribute so the CSS media query governs. Floating button fixed top-right (desktop); inline in bottom nav (mobile). No new packages. |
| 2026-03-16 | Visual hierarchy: `fighter-link` color changed from `--accent` to `--blue` | Amber (`--accent`) was overloaded with 3+ semantic meanings: brand/active state, fighter-positive data highlights, AND navigational links. Moving `fighter-link` to `--blue` (the informational/grappling color) leaves amber with exactly 2 meanings: (1) brand/active/selected state, (2) emphasis on primary data values. |
| 2026-03-16 | Typography: `.flag-value` + `.stat-cell-attr-val` assigned `font-family: var(--mono)` | These classes displayed qualitative codes (ELITE, EXCELLENT, IRON) in Inter (body font). CLAUDE.md standard: all labels, codes, and numbers use JetBrains Mono. Oversight from Phase 8; corrected in Phase 10 visual hierarchy audit. |
| 2026-03-16 | Phase 10 complete: 186 tests, 0 lint, 0 CVEs | Bottom nav + sidebar drawer, theme toggle, portrait field, visual hierarchy fixes. FighterScreen.test.jsx and App.test.jsx added (21 new tests). useTheme.test.js added (9 tests). vi.hoisted() pattern documented: fixtures accessed in vi.mock factories must be declared via vi.hoisted() to avoid TDZ errors from automatic hoisting. |
| 2026-03-16 | Phase 11 alerts: localStorage key ownership formalized | `alerts.js` owns three storage keys: `alerts_enabled` (bool, localStorage), `alert_rules` (object, localStorage), `alerts_prev_lines` (transient prev-ML snapshot, sessionStorage). No other module may read or write these keys. Same isolation pattern as `clv.js` owning `clv_log` and `opening_lines`. |
| 2026-03-16 | Phase 11 alert defaults: opt-in design | Global alerts default to false (not true). Per-fight alert must be explicitly enabled via bell icon. `requestPermission` only fires on explicit user gesture (settings panel REQUEST button). Rationale: no unsolicited permission prompts, no accidental alert spam on first load. |
| 2026-03-16 | Phase 11 notification content: string concatenation only | Notification body is assembled with JS string concatenation using pre-validated values from the API response. No template-literal HTML tags. No `innerHTML`. The Notification constructor receives a plain text body string — browsers do not parse HTML in notification bodies. This is documented here to prevent future regression. |
| 2026-03-16 | Phase 11 CSP: worker-src 'self' added explicitly | `worker-src 'self'` added to `netlify.toml` and `vercel.json` CSP for the `/sw.js` Service Worker. MDN: if `worker-src` is absent, browsers fall back to `child-src` then `default-src`. Adding it explicitly is best practice — makes the intent unambiguous and future-proofs against browser divergence. No new external domains introduced. |
| 2026-03-16 | Phase 11 complete: 239 tests, 0 lint, 0 CVEs | `public/sw.js`, `src/utils/alerts.js` (31 tests), `src/hooks/useAlerts.js` (21 tests), MarketsScreen bell icon + threshold input, MenuScreen settings panel. `navigator` + `Notification` added to ESLint browser globals. `worker-src 'self'` in both deployment config files. |
| 2026-03-16 | Phase 12 news sources: MMA Fighting + MMA Junkie RSS | Selected `https://www.mmafighting.com/rss/current` and `https://mmajunkie.usatoday.com/feed` as Phase 12 RSS sources. Both added to `connect-src` in `netlify.toml` + `vercel.json`. Both are CORS-restricted in pure browser context (no `Access-Control-Allow-Origin` header on their RSS responses), so `useNews` will degrade silently to the static mock in production. The hook architecture is complete and ready for CORS-enabled sources; a CORS proxy path is deferred to backlog. |
| 2026-03-16 | Phase 12 RSS parsing: DOMParser for both HTML stripping and XML parsing | `stripHtml()` uses `DOMParser('text/html')` + `.textContent` — tags are never rendered, only text extracted. `parseRssFeed()` uses `DOMParser('application/xml')` — safe for structured XML. Feed content (title, description) is never passed to `innerHTML` or `dangerouslySetInnerHTML`. Headline capped at 160 chars, body at 600 chars. XSS coverage verified in `newsParser.test.js` (script tag, img onerror, javascript: href). |
| 2026-03-16 | Phase 12 fighter name matching: last-name lookup, ≥3 chars | `matchFighterName()` iterates FIGHTERS and checks if the fighter's last name (≥ 3 chars) appears in the combined headline + body text. Returns first match in roster order. Short last names (< 3 chars) skipped to avoid false positives. No fuzzy matching library added — simple `includes()` is sufficient given the roster size. |
| 2026-03-16 | Phase 12 complete | `src/utils/newsParser.js` + tests, `src/hooks/useNews.js` + tests, NewsScreen LIVE/MOCK badges, TabOverview RECENT NEWS section, FighterScreen passes top-2 matched news items to TabOverview. connect-src updated in both deploy configs. |
| 2026-03-17 | Phase 13: React Router v7 — BrowserRouter in App.jsx | `react-router-dom` v7 added as a runtime dependency. `BrowserRouter` wraps the app in `App.jsx` (not `main.jsx`) so the component tree is self-contained and renders correctly in tests without extra wrappers. Route wrappers `FighterScreenRoute` and `CompareScreenRoute` defined at module scope (CLAUDE.md: no component definitions inside render functions). All existing screen props (`onBack`, `onGoFighter`, `initialFighter`) preserved — no screen refactoring required. |
| 2026-03-17 | Phase 13: URL param validation — positive integer only | `parseId(str)` in `App.jsx` validates params with `/^\d+$/` + `parseInt`. Non-numeric, negative, or float strings return `NaN`. Screens receive `null` for unresolved IDs and show the empty/default state. This prevents route injection attempts from reaching the FIGHTERS array lookup. |
| 2026-03-17 | Phase 13: SPA fallback — three configs updated | `vite.config.js`: `server.historyApiFallback: true` (dev server). `netlify.toml`: `[[redirects]]` 200 rewrite (`/* → /index.html`). `vercel.json`: `"rewrites"` rule with negative lookahead excluding `/assets`, `sw.js`, `favicon.ico`. Without these, direct URL loads and browser refreshes on deep paths return 404 from the host. |
| 2026-03-17 | Phase 13: export.js — no third-party library; Blob + revoke pattern | Markdown and CSV generation implemented with plain string concatenation. No `jspdf`, `html2canvas`, or papaparse added. `downloadBlob()` creates `URL.createObjectURL(blob)`, appends an anchor, calls `.click()`, then immediately revokes the URL — avoids a memory leak from unreleased object URLs. `sanitizeCsvCell()` prefixes `=`, `+`, `-`, `@` with `'` to block spreadsheet formula injection in any CSV consumer. |
| 2026-03-17 | Phase 13 complete | `src/utils/export.js` + 25 tests, CompareScreen ↓ MD export + COPY LINK buttons, MarketsScreen CLV panel ↓ CSV button. SPA fallback in vite.config.js + netlify.toml + vercel.json. `Blob` + `URL` added to ESLint browser globals. 333 tests, 0 lint errors, 0 CVEs. |
| 2026-03-17 | Inline ternary styles → CSS modifier classes | Remaining dynamic `style={{ color: mv.dir === 'up' ? ... }}` blocks in TabMarket, TabPhysical, TabStriking were data-driven booleans (not data-keyed lookup maps) and therefore expressible as BEM modifier classes. Extracted to `.line-movement-bar--up/down`, `.mc-public-warning/ok`, `.val--loss`, `.val--dec-loss`, `.val--clean` in `app.css`. Pattern: if the CSS value is one of two fixed design-system colors toggled by a boolean → modifier class. If the CSS value comes from a runtime lookup map (ARCH_COLORS, CHIN_COLOR, etc.) → inline style remains correct. |
| 2026-03-17 | ChecklistPanel accessibility — role + aria attributes | Each `.cl-item` div acts as a checkbox but was not declared as one. Added `role="checkbox"`, `aria-checked`, and `aria-label` attributes. No structural change to the component — semantic HTML for screen reader / keyboard navigation compliance. |
| 2026-03-17 | StatBar max=0 guard made explicit | `val / max` when `max === 0` produces `Infinity`, then `Math.round(Infinity)` → `Infinity`, then `Math.min(100, Infinity)` → `100`. JavaScript silently returns `100%` fill. Replaced with an explicit `max > 0 ? ... : 0` branch so behavior is intentional and readable. |
| 2026-03-17 | TabMarket useEffect deps — eslint-disable removed | The `eslint-disable-line react-hooks/exhaustive-deps` suppression on the lazy-history fetch effect was hiding a real issue: the effect used `polyMatch`, `kalshiMatch`, `polyFetchHistory`, `kalshiFetchHistory` but only listed `hasLive`. The existing `if (!hasLive || chartLoaded) return` guard is the correct tool for once-only execution — adding all true deps to the array means ESLint can enforce completeness without suppression. |
| 2026-03-17 | Phase 14: FighterSearch — onMouseDown + setTimeout blur guard | Dropdown options use `onMouseDown` instead of `onClick` so selection fires before the input's `onBlur` closes the dropdown. `onBlur` delays close with `setTimeout(150ms)` to let the mousedown register first. This is the standard pattern for custom comboboxes — no third-party select library needed. |
| 2026-03-17 | Phase 14: statKey field added to compareRows.js row descriptors | 10 of 15 stat rows now carry an optional `statKey` string matching a key in `STAT_TIERS`. CompareScreen imports `getStatTier()` and renders a `.stat-tier-label` span per cell when `statKey` is present. Rows without a meaningful tier threshold (Knockdowns, Ctrl Time, Reach, Age) carry no `statKey` and show no label. |
| 2026-03-17 | Phase 14: categoryEdges useMemo for compare edge stripe | Per-category majority-winner pre-computed in a `useMemo` before render rather than computed inline per cell. Categories with tied counts get no stripe. CSS modifier classes `.cat-row--f1-edge` / `.cat-row--f2-edge` carry the 3px colored border. Colors: F1 edge = `--accent` (amber), F2 edge = `--blue`. |
| 2026-03-17 | Phase 14: percentile ranking — lower-percentile = better rank | `rankPercentile()` counts fighters strictly *above* the target value (for higherIsBetter stats) and returns `ceil((above / total) * 100)`. A result of 5 means only 5% of the roster is above this fighter — which is elite. This inverted convention (lower number = better rank) matches the "TOP X%" badge framing. |
| 2026-03-17 | Phase 14: useNavigate used in FighterScreen and CalendarScreen | Direct `useNavigate()` from react-router-dom replaces the `onGoCompare`/`onGoFighter` callback prop chain. VS./COMPARE button navigates to `/compare/:id`. CalendarScreen's `useCompareNav()` module-scope hook resolves both fighter names via `findFighterByName()` then navigates to `/compare/:f1id/:f2id`. Tests for these screens must wrap renders in `MemoryRouter`. |
| 2026-03-17 | Phase 14: findFighterByName — last-name fallback, ≥3 chars minimum | Exact full-name match first. If no match, falls back to last-name suffix match (checks if `f.name.toLowerCase().endsWith(' ' + lastName)`). Minimum 3 chars on the last-name fragment prevents false positives on short names. Null-guards on `f?.name` prevent TypeError on any null/undefined entries in the FIGHTERS array. |
| 2026-03-17 | Phase 14: pickLog.js — 200-entry cap, plain text only, exclusive key ownership | `pick_log` localStorage key owned exclusively by `src/utils/pickLog.js` — same isolation pattern as `clv.js` owning `clv_log`. 200-entry cap evicts from the front (oldest first), same as CLV log's 500-entry pattern. All values stored as `String(value ?? '')` — never HTML, never eval, never template-literal markup. `try/catch` on every read with typed default `[]`. XSS strings stored as-is (text) — they never reach innerHTML anywhere. |
| 2026-03-17 | Phase 14 continuation: CompareScreen hero header uses FighterCard components | The `.compare-fighter-header` previously rendered manual name/record/badge JSX inline. Replaced with two `FighterCard` instances (non-interactive: no `onClick`). CSS override `.compare-fighter-col .fighter-card { cursor: default; border: none; background: transparent; padding: 0; }` neutralizes the card box styling so FighterCard reuses its portrait/name/badges markup without the interactive box appearance. `ARCH_COLORS` and `MOD_COLORS` no longer imported directly in CompareScreen — FighterCard owns that rendering. |
| 2026-03-17 | Phase 14 continuation: implied probability gap in compare VS column | `impliedProb` useMemo in CompareScreen computes normalized implied percentages from `f1.market?.ml_current` and `f2.market?.ml_current` using `mlToImplied()`. Divided by their sum to normalize (removes vig). Displayed in the VS column as `F1 X% · Y% F2`. Shown only when both fighters have `ml_current` set; otherwise the VS column shows the label only. Colors: F1 probability uses `--accent`, F2 uses `--blue` — matching the compare table's win/lose color convention. |
| 2026-03-17 | Phase 14 continuation: TabOverview flags → inline pills | The FLAGS `stat-grid--narrow` section (3 cells: CHIN / CARDIO / WEIGHT CUT) was replaced with a `.flags-pill-row` flex row of `.flag-pill` badges. Each pill uses `color: currentColor; border: 1px solid currentColor` so the same color variable drives both text and border without duplication. A dim `.flag-pill-key` span provides the label prefix. This matches the visual density of arch/mod badges and is consistent with the Phase 14 pill badge system. `borderColor` added to the inline style alongside `color` to complete the pill appearance (border without `currentColor` would default to the inherited text color, which is the same, but explicit is better). |
| 2026-03-17 | Phase 14 continuation: MarketsScreen pick log security boundary | Pick log notes textarea uses `maxLength={200}` at the DOM level and `.trim()` at save time. Stored via `String()` coercion in `pickLog.js`. Rendered in the PICKS panel via JSX text nodes only — never via `innerHTML` or `dangerouslySetInnerHTML`. `updatePickOutcome` matches on `fightKey` (updates the most-recent entry with that key) — known limitation when multiple picks exist for the same fight, but acceptable for the personal-use context. |
| 2026-03-17 | Phase 14 complete: v0.14.0 | All planned Phase 14 deliverables shipped. 392 tests, 0 lint errors, 0 CVEs. Recently viewed fighter strip deferred (optional stretch; `recent_fighters` sessionStorage key reserved in storage table). No new external domains; no CSP changes from Phase 14 continuation work. |
| 2026-03-17 | Phase 15: matchupWarnings.js — pure function, static rule tables | `computeMatchupWarnings(f1, f2)` lives in `src/constants/` (not `utils/`) because it is a static lookup table, not a transformation utility. Three rule sets: ARCHETYPE_RULES (14 directional), STYLE_CLASHES (8 symmetric), MOD_RULES (10 modifier-triggered). All strings static — no fighter names interpolated in the function; CompareScreen substitutes last names at render. `vsArchetype` field in MOD_RULES enables context-specific amplification (e.g., DURABILITY RISK fires a generic warning for any opponent, plus a second more-specific one when facing a BRAWLER). No new external domains; no CSP changes; no new runtime dependencies. |
| 2026-03-17 | Phase 15: MATCHUP NOTES section placement in CompareScreen | Placed between the FighterCard hero header and the stat table. This ensures matchup context is read before the stat comparison rather than after (where it would compete with EDGE SIGNALS). EDGE SIGNALS (research prompts, single-line) remain below the stat table. The two sections are complementary: MATCHUP NOTES = structural context, EDGE SIGNALS = quantitative signals. |
| 2026-03-18 | Phase 16: statFilters.js — stat filter presets in constants, not utils | Filter definitions (id, label, category, predicate) are static — the predicates are pure closures over numeric literals with no I/O. Co-location with other rule tables in `src/constants/` follows the existing pattern (matchupWarnings.js, statTiers.js). Active filter set is React state only (`Set<string>`) — no localStorage persistence, no URL params; filters reset on navigation. Thresholds calibrated to current 69-fighter roster; will need review if roster doubles. |
| 2026-03-18 | Phase 16: MUAY THAI → --teal, CLINCH FIGHTER → --gold | All suggested colors (--orange / --purple) were already taken by KICKBOXER and COUNTER STRIKER. Two new CSS variables added to `:root`: `--teal: #3aafa9` (Thai flag teal) and `--gold: #c9a84c` (clinch/grit associations). Light theme blocks not updated — color primitives (non-surface, non-text vars) are intentionally dark-theme-only per existing pattern. |
| 2026-03-18 | Post-Phase-16: `--bg-elevated` and `--bg-card` must be in all three theme blocks | These aliases were added to `:root` but must also be present in `[data-theme="light"]` and the `@media (prefers-color-scheme: light)` block. Without this, the light theme does not resolve the variables and the alert panel renders with fallback/invisible backgrounds. Rule: any new token that has a theme-specific value must be declared in all three theme blocks. |
| 2026-03-18 | Post-Phase-16: `prefers-reduced-motion` block placed last in CSS | The `@media (prefers-reduced-motion: reduce)` rule uses `!important` to override all animation and transition declarations. Placing it at the end of `app.css` is the canonical pattern — highest source-order specificity ensures it wins against any component-level animation declarations added in future phases. |
| 2026-03-18 | Post-Phase-16: `vs-btn` default state changed from muted to accent | The VS./COMPARE button in FighterScreen hero is the primary navigation CTA — the single action that transitions users from the fighter profile to the compare workflow. Using `--border2`/`--text-dim` as the default state made it visually indistinct from informational pills. Upgraded to `--accent-dim`/`--accent` by default, solid accent fill on hover. This is consistent with the topbar buttons and checklist CTAs which already use the accent pattern. |
| 2026-03-18 | Post-Phase-16: input focus colors → `--accent` across all inputs | Five inputs (sidebar search, fighter search, notes area, pick notes, news filter select) used `--border2` on focus — the same color as their default hover border. This provided no meaningful visual distinction for keyboard navigation. Changed to `--accent` to match the button focus ring and the existing `.mc-input:focus` pattern (which already used `--accent` correctly). |
| 2026-03-18 | Post-Phase-16: mobile begins — touch target baseline established | Filter chips and sidebar fighter rows brought to 36px minimum tap height. Portrait size reduced (160px → 88px) to recover vertical space on small viewports without sacrificing the identity section. These changes are preparatory for the upcoming mobile-first development phase. No layout architecture changes yet — that is Phase 17 scope. |
| 2026-03-18 | CORS proxy for live RSS: same-origin serverless function, strict allowlist | Direct browser fetches to MMA Fighting and MMA Junkie RSS feeds fail in production because neither site sends `Access-Control-Allow-Origin` headers. Added `netlify/functions/rss-proxy.js` (Netlify Functions v2, served at `/api/rss-proxy` via `config.path`) and `api/rss-proxy.js` (Vercel, auto-routed from `api/` directory). Both validate the `url` query param against a two-entry Set allowlist — any unlisted URL returns 403, preventing SSRF abuse. Response size is capped at 512 KB. `useNews` hook updated to route all RSS fetches through `/api/rss-proxy?url=...` (same-origin, no browser CORS restriction). MMA Fighting and MMA Junkie removed from CSP `connect-src` in both `netlify.toml` and `vercel.json` — the browser no longer connects to these origins directly. Vercel SPA rewrite exclusion updated to also exclude `api/`. |
| 2026-03-18 | Codebase reassessment — 0 critical/high issues found | Full audit against CLAUDE.md standards: security (all 15 checks pass), React practices, modular structure, test coverage, accessibility, performance, documentation. One medium gap confirmed: `aria-pressed` on stat filter chips — already present (audit false positive). Three low-priority fixes applied: (1) `fmtDate` function duplicated verbatim in `NewsScreen`, `TabOverview`, and `CalendarScreen` → consolidated into `date.js` as `formatDate` + `formatEventDate`; (2) `countdown` function duplicated in `CalendarScreen` and `MarketsScreen` (differing only in past label) → consolidated into `date.js` as `countdown(dateStr, today, pastLabel='PAST')`; (3) MenuScreen version badge stale at v0.11.0 → updated to v0.17.0. 9 new tests added; 465 total. |
| 2026-03-18 | Phase 17: touch target tokens as CSS variables, not magic numbers | Hard-coded `36px` and `44px` were scattered in the mobile block. Extracted to `--touch-target: 44px` and `--touch-target-sm: 36px` declared in all three theme blocks. `min-height: var(--touch-target, 44px)` pattern adopted everywhere. Rationale: a single source of truth for touch target sizing; easier global adjustment; design token is self-documenting. WCAG 2.5.8 (AA, WCAG 2.2) recommends 24px with spacing — 44px exceeds this and matches Apple HIG / Material Design guidance. |
| 2026-03-18 | Phase 17: `@media (max-width: 480px)` small-phone breakpoint added | A second breakpoint below 767px was needed for layout changes that are appropriate at 375px but would be wrong at 600px (e.g. stacking FighterCard columns, headline line-clamping). 480px was chosen as the boundary: covers iPhone SE / 5c (320–375px), standard Android phones (360–412px), while leaving standard tablet-portrait (768px) and small laptop (1024px) untouched. The existing 767px block handles general mobile; the 480px block handles small-phone-specific overrides. |
| 2026-03-18 | Phase 17: swipe-to-close sidebar — `useRef` + touch events, no library | Swipe gesture implemented with `onTouchStart`/`onTouchEnd` React props on the `.sidebar--open` div. State tracked in refs (`useRef`) to avoid stale closure and unnecessary re-renders. `onTouchMove` intentionally omitted — attaching it blocks the browser's native scroll on the sidebar list. Trigger threshold: `dx > 112px` (40% of 280px sidebar width) OR `velocity > 80 px/s`. Matches the task requirements. No swipe library added: the implementation is 8 lines and covers 100% of the use case. `useCallback` wraps both handlers to prevent recreation on every render. |
| 2026-03-18 | Phase 17: `font-size ≥ 16px` on mobile inputs prevents iOS auto-zoom | iOS Safari zooms the viewport when a focused `<input>` has `font-size < 16px`. This breaks the fixed bottom-nav layout and disrupts the sidebar overlay. Fixed on `.mkt-alert-threshold` (was 10px; upgraded to 16px in the `@media (max-width: 767px)` block). This is now a documented constraint in CLAUDE.md — every new `<input>` on mobile must meet this rule. No layout changes required; width widened from 38px to 56px to accommodate the larger font size. |
| 2026-03-18 | Phase 17: emoji icons in bottom nav — no icon library | Bottom nav items now render an emoji icon (`🥊⚖️🗓📊📰`) above the text label. Decision rationale: (1) No new npm dependency; (2) emoji render consistently on all modern mobile OS platforms (iOS/Android/Chrome); (3) they match the dense-data, functional aesthetic better than SVG icon libraries would given there are only 5 icons total; (4) fast to iterate. The icon is in a `<span className="bottom-nav-icon" aria-hidden="true">` so it is invisible to screen readers. The `<button>` carries `aria-label` with the full screen name. If the icon set needs to change in the future, the NAV_ITEMS array is the single source of truth. |
| 2026-03-18 | Phase 17: news headline expand/collapse — React state only, no localStorage | The `expandedIds` Set in NewsScreen is React state only — it resets when the user navigates away. Rationale: expanded headlines are ephemeral reading state, not a persistent preference. Persisting this would add a storage key with zero research value. CSS uses `-webkit-line-clamp: 3` (well-supported on all modern browsers; no polyfill needed) inside `@media (max-width: 480px)`. The `.news-headline--expanded` modifier class switches `display: block; overflow: visible` to remove the clamp. `role="button"` + `aria-expanded` + `onKeyDown` (Enter/Space) makes the headline keyboard-accessible per WCAG 2.1.1 (Level A). |
| 2026-03-18 | Phase 17: hero portrait reduced 88px→64px at ≤480px | The `@media (max-width: 767px)` block already reduces the hero portrait from 160px to 88px. At the 480px small-phone breakpoint, 88px still occupies a disproportionate share of the screen height relative to the information it provides (initials or a small image). Reduced to 64×64px with corresponding `portrait-initials` font-size adjustment (40px→28px) and tighter `card-identity` padding. Portrait images are self-hosted (`public/assets/portraits/`) — no CDN, no CSP change. |
| 2026-03-18 | Phase 17: stat table horizontal scroll on ≤480px | The `.ctable` (3-column compare table: F1 value / stat label / F2 value) becomes illegible when squished onto a 375px viewport — the F1/F2 value columns truncate or wrap. Rather than hide columns (which loses information), the table now scrolls horizontally at ≤480px: `.compare-table-wrap { overflow-x: auto }` + `.ctable { min-width: 400px }`. 400px ensures each column has enough width for a value + tier label without wrapping. The wrapper already has `overflow-y: auto` — adding `overflow-x` does not affect vertical scroll. |
| 2026-03-18 | Phase 17: CalendarScreen + NewsScreen — screen-level tests added | FighterScreen already had sidebar-toggle tests. CalendarScreen and NewsScreen both have JS-conditional render paths (sidebar open/close; headline expand/collapse) that differ from the default state and are not CSS-only. TASKS.md Phase 17 item: "Add responsive smoke tests if any screen has a conditional render path that differs on mobile." `CalendarScreen.test.jsx` (7 tests: sidebar EVENTS button, backdrop, sidebar--open class, aria-expanded both states). `NewsScreen.test.jsx` (9 tests: headline click/double-click/Enter/Space, aria-expanded, role=button). vi.hoisted() pattern required for CalendarScreen because vi.mock factories are hoisted before const declarations — matches the existing FighterScreen.test.jsx pattern. 481 tests total; 0 lint errors. |
| 2026-03-18 | v0.18.0 — Phase 17 complete; merged to master | All Phase 17 tasks checked off: touch tokens, 480px breakpoint, swipe-to-close sidebars, headline expand/collapse, iOS auto-zoom fix, bottom nav icon+label, date.js consolidation, CalendarScreen.test.jsx + NewsScreen.test.jsx (481 tests, 0 lint errors, 0 CVEs). Documentation updated: CLAUDE.md phase reference cleaned up; PLANNING.md file structure phase annotations stripped, CSP example updated to match actual deployed policy (added worker-src, actual connect-src domains, HSTS header); TASKS.md Phase 17 sprint moved to Completed. North Star feature set: all 11 items delivered. No new external domains; no new runtime npm dependencies; no CSP changes. |
| 2026-03-18 | v0.18.1 — MONOLITH + ARENA theme system; button overlay fix | Replaced old generic light/dark palette with two named, intentional themes: MONOLITH (cold electric dark — near-void blue-black, cyan accent `#00c8ff`) and ARENA (warm ember dark — charcoal-amber, ember orange `#e06828`). Neither theme is white. The old light theme (pure white `#ffffff` surfaces) was replaced after user feedback that it was too bright. Both themes are dark-base with distinct personality. `--accent-bg` + `--accent-bg-mid` CSS tokens replace 10 hardcoded `rgba(212,168,67,...)` values throughout `app.css` — theme-adaptive accent tints now resolve correctly in both themes. `.topbar` desktop padding `0 20px → 0 80px 0 20px` fixes the fixed-position theme toggle button overlapping topbar-right action buttons (↓ MD, COPY LINK). Mobile override `0 14px` restores symmetric padding when toggle is hidden. `useTheme.js` labels changed from `'LIGHT'/'DARK'` to `'ARENA'/'MONOLITH'`. 481 tests, 0 lint errors, 0 CVEs. No new external domains; no new npm dependencies; no CSP changes. |
| 2026-03-18 | Las Vegas Sphere immersive background — v0.18.2 visual overhaul | Multi-layer radial CSS gradient on body simulating arena LED interior: vignette edge-darkening + horizon glow band + base depth void. `body::before` LED panel grid (44×44px, 1.6% opacity, masked to centre). `body::after` ambient sphere pulse (9s ease breathing, `prefers-reduced-motion` killed). Frosted glass on topbar, mobile bottom-nav, and mobile sidebar overlay via `backdrop-filter: blur(14px)` + `--surface-glass` token. Menu items lifted to frosted glass panels. Wordmark accent text-shadow glow. `--text-dim` contrast fix to WCAG AA. New CSS tokens: `--sphere-base`, `--sphere-mid`, `--sphere-glow`, `--sphere-pulse-color`, `--surface-glass` in all three theme blocks. |
| 2026-03-24 | DisclaimerGate added — age 18+ verification + risk acknowledgement | Two-step acceptance gate wrapping the entire app. Step 1: age verification (18+ — lowest global legal age for prediction markets). Step 2: risk acknowledgement (informational use only, not financial advice, substantial risk). Persisted as `disclaimer_accepted = '1'` in localStorage with try/catch reads. UI-only gate — no server-side verification (appropriate for an informational tool with no financial transactions). No PII collected. Storage key owned exclusively by `DisclaimerGate.jsx`. |
| 2026-03-24 | Arena atmosphere UI — parallax backdrop + TabOverview stat bars | 4-layer parallax arena backdrop in App.jsx: deep atmosphere, LED grid, ambient pulse, edge vignette. Mouse-driven smooth lerp via `requestAnimationFrame`. TabOverview KEY STATS section replaced percentile badges with 6 coloured horizontal stat bars (green = ELITE, cyan = AVG/ABOVE AVG, red = BELOW AVG) with tier labels — more visually informative and consistent with arena aesthetic. FighterScreen hero: compact 88px avatar box with cyan accent. `arena-test.html` added to `public/` as standalone visual prototype (reference only). |
| 2026-03-24 | Phase 17 scoped: deployment (audvihr.space) + free odds pipeline | Domain `audvihr.space` purchased via Namecheap. Deployment target: Vercel (already configured via `vercel.json`). DNS: A record `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com.`. User already has another webapp deployed on Vercel via Namecheap — same workflow. |
| 2026-03-24 | Build-time BestFightOdds scraper chosen over paid APIs | The Odds API free tier (500 req/mo) is tight for polling; Kalshi requires US identity verification. BestFightOdds.com is the canonical MMA odds aggregator — opening lines, current lines, multi-book comparison, all in HTML tables. Build-time cheerio scrape (same pattern as UFCStats + Tapology) gives comprehensive sportsbook data for free. No API key, no rate limit, no `connect-src` CSP change (build-time only). Tradeoff: snapshot per deploy vs live polling. Acceptable for a tool where user redeploys before fight week. |
| 2026-03-24 | Hybrid odds architecture: BestFightOdds (build-time) + Polymarket (runtime) | Sportsbook moneylines (multi-book, opening + current) come from BestFightOdds at build time → `src/data/odds.js`. Prediction market prices come from Polymarket at runtime (free, unauthenticated, already integrated). `useOdds.js` (The Odds API) becomes fully optional — no paid dependency required for core functionality. `useKalshi.js` stays optional. All three live hooks degrade silently when keys absent. |
| 2026-03-24 | `src/data/odds.js` — new generated data file | Keyed by `fightKey` (reusing `normalizeOdds.js` key format). Shape: `{ [fightKey]: { fighter1, fighter2, fightKey, event, books: [{ source, f1_ml, f2_ml }], best: { source, f1_ml, f2_ml } | null, ts } }`. Generated by `scripts/fetch-odds.js`. Same serialization pattern as `fighters.js` and `events.js`. |
| 2026-03-24 | `scripts/fetch-odds.js` — new build-time scraper | Follows established patterns: Node ESM + cheerio, browser UA header, `--dry-run`/`--ci`/`--fresh` CLI flags, 500ms inter-request delay, local `.raw.json` file cache, silent degradation on failure. Integrated into `prebuild` script chain after `fetch-data.js`. No new runtime dependencies. |
