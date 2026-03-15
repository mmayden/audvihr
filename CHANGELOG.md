# CHANGELOG.md — Audwihr

All notable changes to this project. Format: [version] — date — description.

---

## [Unreleased]

---

## [0.6.0] — 2026-03-15

### Added
- `scripts/fetch-data.js` — UFCStats build-time scraper (Node 18+ ESM, cheerio, native fetch)
  - Fetches fighter stats directly from `ufcstats_url` stored per fighter in seed file
  - Parses: record, age (from DOB), height, reach, stance, all career stat averages
  - Parses full fight history: result, opponent, method, round, event, year
  - Derives: win streak, finish counts (ko/sub/dec), losses_by, finish_rate
  - Normalizes method strings ("TKO - Punches" → "TKO", "U-DEC" → "DEC", etc.)
  - Merges live stats with `scripts/fighter-seed.json` editorial fields (archetype, mods, trader_notes, etc.)
  - Validates all required fields before write; exits non-zero on any error in CI mode
  - 500ms request delay (100ms in CI) to be polite to UFCStats
  - Cache layer: `*.raw.json` per fighter (gitignored) for incremental rebuilds
  - CLI flags: `--dry-run`, `--fresh`, `--ci`
- `scripts/fighter-seed.json` — editorial seed data for 14 fighters
  - `ufcstats_url`, `ufcstats_name`, archetype, mods, camp, country, chin, cardio, weight_cut, trader_notes
  - Extended striking/grappling fields not available from UFCStats (zone distribution, ctrl time, etc.)
- `npm run fetch-data` / `fetch-data:dry` / `fetch-data:fresh` scripts
- `prebuild` hook — scraper runs automatically before `npm run build`
- `cheerio ^1.2.0` added as devDependency
- `.env.example` — documents `VITE_ODDS_API_KEY` placeholder for future Phase 7+ live odds
- `*.raw.json` added to `.gitignore` (scraper cache, not committed)

### Changed
- `src/data/fighters.js` — now a generated file (overwritten by scraper); all 14 fighters use live UFCStats stats
- `src/data/events.js` — now a generated file; upcoming events scraped from UFCStats (0 listed when no scheduled cards)
- Menu version badge: `v0.5.0 — MOCK DATA` → `v0.6.0 — LIVE DATA`

### Code Quality (standards cleanup from Phase 5 branch)
- `CompareScreen`: wrap `rows` derived array in `useMemo` (was rebuilt on every render)
- `FighterScreen`: `function pick` → `const pick` arrow (CLAUDE.md component-scope rule)
- `FighterScreen`: replace hardcoded `'#555'` fallback with `var(--border2)` / `var(--text-dim)` CSS variables
- `PLANNING.md`: rewrite Architecture Philosophy to reflect post-Vite state; remove `ComingSoon.jsx` from file structure

---

## [0.5.0] — 2026-03-15

### Added
- `NewsScreen` — fighter news feed with category and fighter filters
- `src/data/news.js` — 12 mock news items across injury, camp, fight booking, weigh-in, and result categories
- Category filter chips (ALL / FIGHT / INJURY / CAMP / WEIGH-IN / RESULT) with color-coded badges
- Fighter filter dropdown (populated from news roster)
- Relevance signal per item: HIGH (amber) / MEDIUM (blue) / LOW (dim) — trading signal strength
- `FighterName` links from news items navigate directly to fighter profile
- All 5 menu items now ACTIVE — `ComingSoon` screen no longer used
- News CSS added to `app.css`
- Menu version bumped to v0.5.0

### Code Quality
- Tab components (`TabOverview`, `TabStriking`, `TabGrappling`, `TabPhysical`, `TabHistory`, `TabMarket`) — renamed single-letter prop `f` → `fighter` at API level (CLAUDE.md compliance)
- Static constants extracted from component bodies to module scope: `WEIGHT_FILTERS` (FighterScreen), `SORT_LABELS` + `PLATFORMS` (MarketsScreen), `MENU_ITEMS` (MenuScreen)
- Pure helper functions extracted to module scope with `today` parameter: `fmtDate`, `isPast`, `daysUntil`, `countdown` (CalendarScreen); `fmtVolume`, `computeArb`, `totalVolume`, `daysUntil`, `countdown`, `countdownColor` (MarketsScreen)
- `ARCH_COLORS` and `MOD_COLORS` now reference CSS variables (`var(--blue)`, `var(--green)`, etc.) — eliminates hardcoded hex from constants; `--dark-red` added to design system for BRAWLER / FRONT-RUNNER
- Fixed: line movement arrow in `TabMarket` now correctly shows `▼` for downward moves (was always `▲`)
- Fixed: division-by-zero guard added to sub win rate in `TabGrappling`
- Fixed: `isNaN` guard added to public bet % check in `TabMarket` (CLAUDE.md input validation pattern)
- Fixed: `let lastCat` render mutation in `CompareScreen` replaced with pure index comparison (`i === 0 || rows[i-1].cat !== r.cat`) — Strict Mode safe

---

## [0.4.0] — 2026-03-15

### Added
- `MarketsScreen` — full prediction market dashboard with filter bar and sorted market list
- `src/data/markets.js` — 8 mock markets across UFC 315, Fight Night, UFC 316, UFC 317
- `src/hooks/useWatchlist.js` — localStorage-persisted watchlist by market ID
- Moneyline + implied probability display per platform per fighter
- Cross-platform arbitrage detection: best-of implied sum < 100% triggers ⚡ ARB ALERT
- Method props per fight (KO/TKO, Submission, Decision odds)
- Filter by platform (Polymarket / Kalshi / Novig), title fights only, watchlist only
- Sort by closing date, total volume, or event date (cycling toggle)
- Platform color badges: Polymarket (blue), Kalshi (green), Novig (purple)
- Markets menu item activated (badge: ACTIVE), version bumped to v0.4.0 in menu

### Testing & Tooling
- Vitest 4.1.0 test suite: 32 tests across 5 files, all passing
- ESLint 9 flat config (`eslint.config.js`) — 0 errors on `npm run lint`
- `src/test/setup.js` — in-memory localStorage mock fixes jsdom environment issue
- Test coverage: odds utils (7), StatBar (5), FighterName (4), useLocalStorage (6), useWatchlist (5)
- Testing standards documented in CLAUDE.md

---

## [Unreleased] — Phase 3 + Phase 3a

### Added — Phase 3 (Fight Calendar)
- Fight Calendar screen with full card breakdowns (main event, co-main, prelims, early prelims)
- Static EVENTS data model: 5 events across UFC 314–317 + Fight Night
- Countdown display per event (days until / PAST / TODAY)
- Promotion filter (UFC / Bellator / PFL)
- Fighter name links from calendar → fighter profile (deep navigation)
- Past event styling (dimmed, labeled PAST)

### Added — Phase 3a (Vite Migration)
- Full Vite + React project structure (`package.json`, `vite.config.js`, `index.html`)
- `src/` split into `constants/`, `data/`, `hooks/`, `utils/`, `components/`, `tabs/`, `screens/`
- All 14 components extracted as named exports with JSDoc headers
- Data files with schema comments (`fighters.js`, `events.js`)
- `useLS` renamed to `useLocalStorage` throughout
- `SBar` renamed to `StatBar` throughout
- Security meta tags in `index.html` (`noindex`, `theme-color`, `description`)
- App runs in React StrictMode
- Build output (`dist/`) deployable to GitHub Pages, Netlify, or Vercel
- `netlify.toml` and `vercel.json` with full security header suite (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Upgraded to Vite 6.4.1 + @vitejs/plugin-react 4.7.0 — resolves esbuild CVE GHSA-67mh-4wv8-2f99 (0 vulnerabilities)

### Fixed — Phase 3
- `FighterName` extracted from inside `CalendarScreen` (nested component = remounts on every render)
- Duplicate qualifier color maps removed from `TabOverview` and `TabPhysical` — now shared constants in `src/constants/qualifiers.js`

### Project Standards Established
- Security model documented in PLANNING.md (SRI, CSP plan, supply chain risks)
- CLAUDE.md rewritten with enforced standards for all future sessions: security, code quality, documentation, modular design

---

## [0.3.0] — 2026-03-10

### Added
- 8 new fighters: Charles Oliveira, Justin Gaethje, Arman Tsarukyan (LW); Belal Muhammad, Leon Edwards, Jack Della Maddalena (WW); Jon Jones, Tom Aspinall (HW)
- Roster now spans 5 weight classes: Lightweight, Welterweight, Middleweight, Bantamweight, Heavyweight
- Full data model for each new fighter (60+ data points, 6-fight history, trader notes, archetype/modifier tags)

---

## [0.2.0] — 2026-03-10

### Added
- Full data model: 60+ data points per fighter
- Sidebar roster navigation with search and weight class filter
- 6-tab fighter profiles: Overview, Striking, Grappling, Physical, History, Market
- Archetype system: 8 primary archetypes, 10 modifier tags with color coding
- 17-item trade checklist with 5 category groupings
- localStorage persistence for checklist state, odds, and notes per matchup
- Manual odds entry with auto implied probability calculation
- Line movement detection (open vs current, implied % delta)
- Public bet % inflation warning flag
- Compare screen: full stat table with F1/F2 winner highlighting
- All 5 menu items present (Fighters, Compare, Calendar, Markets, News)
- Coming soon screens for Phase 3–5 features

### Changed
- Complete rebuild from v0.1.0 — new layout, new data model, new component structure
- Menu redesigned: simpler, cleaner, no locked/greyed items

### Fighters (mock data)
- Islam Makhachev (LW Champion)
- Dustin Poirier (LW #3)
- Dricus du Plessis (MW Champion)
- Sean O'Malley (BW #2)
- Merab Dvalishvili (BW Champion)
- Paddy Pimblett (LW #9)

---

## [0.1.0] — 2026-03-09

### Added
- Initial build: single HTML file, React via CDN
- Dark tactical theme (amber-on-black)
- Menu screen with numbered navigation
- Fighter roster: grid of player cards
- Fighter detail view: record breakdown, stats, finish rates
- Fighter comparison: side-by-side stat table
- Trade checklist: 12 items across 5 categories with progress bar
- 6 mock fighters
