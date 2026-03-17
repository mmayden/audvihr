# PLANNING.md — Audwihr Architecture & Design

This document is the primary reference for Claude and the developer during long-term development. It captures decisions, data models, constraints, and context that should not need to be re-explained between sessions.

---

## Architecture Philosophy

**Vite + React (current).** The app was migrated from a single-file HTML prototype to a full Vite + React project at Phase 3a. The prototype used `babel-standalone` for runtime JSX compilation (~860KB, 1–3s blank-screen penalty) and was unsuitable for web deployment. The Vite build compiles at build time, outputs a static `dist/` folder, and is deployable to Netlify, Vercel, or GitHub Pages.

**Current stack:**
- Vite 6 + `@vitejs/plugin-react` — fast HMR in dev, optimised production bundle
- React 18 + StrictMode — all components are function components with hooks
- No state management library — `useState` / `useMemo` / custom hooks only
- No CSS framework — global `app.css` with CSS variables as the design system
- Vitest + Testing Library — co-located unit tests, 80% coverage target on utils/hooks

**Deployment target: web.** Build output is static (`dist/`). Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) are configured via `netlify.toml` / `vercel.json`.

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
6. ✅ **Live news integration** — `useNews` hook; DOMParser text-only sanitization; LIVE/MOCK badges. Delivered in v0.12.0. (CORS proxy is backlog.)
7. ✅ **Shareable research** — React Router URL routing; `/compare/:f1id/:f2id` links; MD + CSV export. Delivered in v0.13.0.
8. ✅ **QoL + visual overhaul** — type-to-search, percentile badges, pill badges, fighter cards, pick log, flags pills, compare hero header. Delivered in v0.14.0.

### What This Is Not

- **Not a pick service.** Every analysis output is explicitly labeled "RESEARCH PROMPT — NOT A PICK."
- **Not a sportsbook or betting interface.** No bet placement, no real-money transactions.
- **Not an AI picks tool.** No black-box models. All edge signals are auditable rules — archetype lookup tables, threshold comparisons, market spread calculations.
- **Not multi-user (yet).** Kalshi API key in browser bundle is an accepted constraint for personal/self-hosted use. Any path to multi-user requires server-side API proxying first.

---

## Current File Structure (Vite + React — v0.14.0)

The single-file prototype (`mma-trader.html`) was retired at Phase 3a. The project is now a Vite + React app with the following modular layout:

```
public/
│   └── sw.js                 Service Worker — install/activate only; scope /; no fetch handler (Phase 11)
src/
├── main.jsx                  Entry point — ReactDOM.createRoot + StrictMode; SW registration
├── App.jsx                   URL router — BrowserRouter + Routes; FighterScreenRoute + CompareScreenRoute wrappers at module scope; bottom nav; theme toggle (Phase 13)
├── styles/
│   └── app.css               All global styles and CSS variables (design system)
├── constants/
│   ├── archetypes.js         ARCH_COLORS (8 archetypes), MOD_COLORS (10 modifiers) — CSS var refs
│   ├── checklist.js          CHECKLIST (17 items), TABS (6 tab names)
│   ├── compareRows.js        15 stat-row definitions — (f1, f2) → row objects; includes optional statKey field for tier labels
│   ├── qualifiers.js         CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, ORG_COLOR, RELEVANCE_COLOR, CATEGORY_COLOR — CSS var refs
│   └── statTiers.js          STAT_TIERS thresholds + getStatTier() — ELITE/ABOVE AVG/AVG/BELOW AVG for 8 stats (Phase 14)
├── data/
│   ├── fighters.js           FIGHTERS array — generated by fetch-data.js (live UFCStats)
│   ├── events.js             EVENTS array — generated by fetch-data.js (upcoming UFC cards)
│   ├── markets.js            MARKETS array — 8 mock prediction markets (Phase 4)
│   └── news.js               NEWS array — 12 mock news items; static fallback for useNews when RSS unavailable (Phase 5 + 12)
├── scripts/                  Build-time data tools (not bundled)
│   ├── fetch-data.js         UFCStats + Tapology scraper (Node ESM, cheerio; browser UA for Tapology)
│   └── fighter-seed.json     Editorial data per fighter (archetype, mods, notes, ufcstats_url)
├── hooks/
│   ├── useLocalStorage.js    useLocalStorage — JSON-serialised state with try/catch
│   ├── useWatchlist.js       useWatchlist — watchlist set over useLocalStorage (Phase 4)
│   ├── useOdds.js            useOdds — The Odds API moneylines; sessionStorage cache; silent degradation (Phase 7)
│   ├── usePolymarket.js      usePolymarket — Polymarket CLOB prices + lazy history; CLV snapshot (Phase 7)
│   ├── useKalshi.js          useKalshi — Kalshi REST API prices + lazy history; CLV snapshot (Phase 7)
│   ├── useTheme.js           useTheme — colour-scheme toggle; persists 'light'|'dark'|'system' to localStorage; sets data-theme on <html> (Phase 10)
│   ├── useAlerts.js          useAlerts — line-movement alert rules, permission state, notification dispatch; owns alerts_enabled + alert_rules localStorage keys (Phase 11)
│   └── useNews.js            useNews — fetches MMA Fighting + MMA Junkie RSS; 30-min sessionStorage cache; silent degradation; fallback to news.js mock; returns { items, loading, isLive } (Phase 12)
├── utils/
│   ├── odds.js               mlToImplied(), lineMovement()
│   ├── date.js               daysUntil(), isPast() — shared date helpers
│   ├── normalizeOdds.js      fightKey(), probToML(), normalizeOddsApiResponse/PolymarketMarket/KalshiMarket/PriceHistory (Phase 7)
│   ├── cache.js              readCache(), writeCache(), evictCache() — sessionStorage helpers (Phase 7)
│   ├── clv.js                appendCLVEntries(), readCLVLog(), appendOpeningLine(), readOpeningLines(), CLV_LOG_KEY, CLV_OPENING_KEY, CLV_MAX_ENTRIES — CLV log + opening line localStorage helpers (Phase 7–9)
│   ├── alerts.js             readAlertsEnabled(), writeAlertsEnabled(), readAlertRules(), writeAlertRules(), readPrevLines(), writePrevLines(), detectMovements() — alert rule pure functions; owns alerts_prev_lines sessionStorage key (Phase 11)
│   ├── newsParser.js         stripHtml(), parseRssFeed(), classifyCategory(), classifyRelevance(), matchFighterName(), rssItemToNewsItem() — RSS sanitization + normalization; DOMParser textContent only, no DOM injection (Phase 12)
│   ├── export.js             sanitizeCsvCell(), checklistToMarkdown(), clvLogToCsv(), downloadBlob() — client-side Blob export; CSV formula injection guard (Phase 13)
│   ├── fighters.js           findFighterByName(name, fighters) — pure name → ID lookup for calendar → compare navigation (Phase 14)
│   ├── percentiles.js        computePercentiles(fighter, allFighters) — per-stat percentile rank vs full roster (Phase 14)
│   └── pickLog.js            readPickLog(), appendPick(), updatePickOutcome() — owns pick_log localStorage key (Phase 14)
├── components/
│   ├── StatBar.jsx           Horizontal proportional fill bar
│   ├── FighterName.jsx       Name → profile link resolver (calendar + news)
│   ├── FighterCard.jsx       Compact card: portrait/initials + name + record + archetype + mod badges (Phase 14)
│   ├── FighterSearch.jsx     Type-to-search input with filtered dropdown; replaces scroll selectors (Phase 14)
│   ├── ChecklistPanel.jsx    17-item trade checklist with progress bar
│   ├── ErrorBoundary.jsx     Class component error boundary wrapping all screens
│   └── PriceChart.jsx        SVG sparkline for prediction-market probability-over-time (Phase 7)
├── tabs/
│   ├── TabOverview.jsx       Key numbers + TOP X% percentile badges, flags pills (chin/cardio/cut), trader notes, RECENT NEWS (top 2 items)
│   ├── TabStriking.jsx       Striking volume, accuracy, knockdowns, position
│   ├── TabGrappling.jsx      Takedowns, submissions, ground control, transitions
│   ├── TabPhysical.jsx       Physical attributes, camp, durability, loss methods
│   ├── TabHistory.jsx        Fight log table
│   └── TabMarket.jsx         Moneyline entry, implied %, line movement, notes
├── screens/
│   ├── MenuScreen.jsx        Main navigation (5 ACTIVE items) + ⚙ ALERTS settings panel
│   ├── FighterScreen.jsx     Sidebar + hero card + 6-tab profile
│   ├── CompareScreen.jsx     FighterCard hero header + implied probability gap; type-to-search selectors; stat table with tier labels + edge stripe; edge signal panel; checklist; COPY LINK + ↓ MD export
│   ├── CalendarScreen.jsx    Event sidebar + card detail + fighter deep-links + COMPARE button per in-roster bout
│   ├── MarketsScreen.jsx     Unified live market dashboard (sportsbook + Polymarket + Kalshi + opening line + Tapology %) + alert bell per fight + + PICK per fight + CLV ↓ CSV export + PICKS log panel
│   └── NewsScreen.jsx        Fighter news feed with filters; LIVE/MOCK source badge; per-item badge (Phase 5 + 12)
└── test/
    └── setup.js              Vitest setup — jest-dom + in-memory localStorage mock
```

Test files are co-located with source: `*.test.{js,jsx}` next to the file under test.

---

## Design System

### Color Palette (CSS Variables)
```css
--bg:           #12141a   /* page background */
--surface:      #1a1d26   /* card/panel background */
--surface2:     #21252f   /* elevated surface */
--surface3:     #272c38   /* active/selected state */
--border:       #2e3340   /* default border */
--border2:      #3a4055   /* hover/active border */
--text:         #c8cdd8   /* body text */
--text-dim:     #6b7285   /* labels, metadata */
--text-bright:  #eef0f5   /* headings, primary values */
--accent:       #d4a843   /* primary accent: amber */
--accent-dim:   #8a6e2a   /* muted accent */
--green:        #4caf82   /* positive, wins */
--red:          #d95f5f   /* negative, losses, danger */
--blue:         #5b8dd9   /* grappling, F2 in compare */
--purple:       #8b6fd4   /* counter striker arch, clinch */
--orange:       #d4804a   /* warnings, body strikes */
```

### Typography
- Body: `Inter` (weights 300–700)
- Data/Labels/Code: `JetBrains Mono` (weights 400–500)
- Rule: mono for all numbers, stat labels, badges, tags

### Visual Direction

**Guiding principle:** dense-data readability first. Think scouting report, not gaming UI. Clean, functional, dark. Soft on the eyes. No particle effects, no animated backgrounds. Animations only where they reduce cognitive load (fade-in on tab switch).

**Phase 14 visual targets — all delivered in v0.14.0:**

- ✅ **Pill badges for archetype + modifiers.** `WRESTLER`, `SOUTHPAW`, `CARDIO CONCERN` displayed as pill-shaped badges (rounded, monospace, uppercase). Color from `ARCH_COLORS` / `MOD_COLORS` lookup via inline style (runtime data-keyed lookup — correct per CLAUDE.md). CSS classes `.arch-badge` and `.mod-badge` own shape and spacing.
- ✅ **Fighter cards.** CompareScreen uses `FighterCard` components in the hero header. `FighterCard` shows portrait/initials + name + record + archetype + mod badges. Non-interactive use (compare header) strips card box styling via `.compare-fighter-col .fighter-card` override.
- ✅ **Percentile context on stats.** Key stats in TabOverview show `TOP X%` badges computed against the 69-fighter roster. Tier thresholds in `src/constants/statTiers.js`. Tier labels in CompareScreen cells.
- ✅ **Compare screen hero header.** Two `FighterCard` components side by side + VS center column + normalized implied probability gap when market data is available.
- ✅ **Matchup edge stripe.** 3px left-border stripe on compare row category groups (`.cat-row--f1-edge` / `.cat-row--f2-edge`); pre-computed in `categoryEdges` useMemo.
- ✅ **Flags as inline pills.** TabOverview FLAGS section shows CHIN / CARDIO / CUT as colored rounded pills (`.flags-pill-row`, `.flag-pill`) replacing the stat-grid layout.
- ✅ **Pick log.** `pickLog.js` utility + MarketsScreen inline form + PICKS panel. Research discipline: log your pick before the fight, record outcome after.

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
| Archetype | CSS Variable | Color |
|-----------|-------------|-------|
| WRESTLER | `--blue` | #5b8dd9 |
| BJJ / SUB HUNTER | `--green` | #4caf82 |
| PRESSURE FIGHTER | `--accent` | #d4a843 |
| COUNTER STRIKER | `--purple` | #8b6fd4 |
| KICKBOXER | `--orange` | #d4804a |
| BOXER-PUNCHER | `--red` | #d95f5f |
| BRAWLER | `--dark-red` | #c0392b |
| COMPLETE FIGHTER | `--text` | #c8cdd8 |

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

### Current State (Vite + React — v0.13.0)

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

### Deployment Security (Phase 3a+)

**Content Security Policy** — configure at the hosting layer, not in HTML:

```
# netlify.toml or _headers
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  connect-src 'self';
  img-src 'self' data:;
  frame-ancestors 'none'
```

> Vite's build output is fully compiled static JS — no inline scripts, no `unsafe-inline` needed.

**Additional headers (recommended at launch):**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

**`npm audit` policy:** Run before every merge to `main`. Block on critical/high severity. Document accepted moderate findings in the decisions log below.

**Phase 7 API surfaces (three hooks — current):**
- **The Odds API** (`https://api.the-odds-api.com`) via `useOdds` — sportsbook moneylines. Key in `VITE_ODDS_API_KEY`. Cache in `sessionStorage`. 500 req/month free tier. Degrade silently.
- **Polymarket CLOB API** (`https://clob.polymarket.com`) via `usePolymarket` — no auth for reads. Fetch current prices + `/prices-history` for probability movement charts. Cache current prices in `sessionStorage`; persist snapshots for CLV to `localStorage`.
- **Kalshi REST API** (`https://trading-api.kalshi.com`) via `useKalshi` — key in `VITE_KALSHI_API_KEY`. Fetch current + historical market prices. Degrade silently if key absent.

**Completed phase surfaces (resolved):**
- **Tapology scrape (Phase 9)** ✅ — build-time HTML scrape (no API key). No runtime `connect-src` entry needed.
- **Fighter portrait images (Phase 10)** ✅ — self-hosted `public/assets/portraits/`. No CSP change required.
- **Service Worker + Notification API (Phase 11)** ✅ — SW scope `/`, no fetch handler. Alert body: string concatenation only (`textContent` semantics). `worker-src 'self'` added to CSP.
- **External news feeds (Phase 12)** ✅ — `https://www.mmafighting.com` + `https://mmajunkie.usatoday.com` added to `connect-src`. All feed content text-extracted via DOMParser — no HTML reaches the DOM. XSS coverage in `newsParser.test.js`.

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

## Phase 9–14 Roadmap Outline (all complete)

Ordered by value vs. effort. Full sprint tasks in TASKS.md.

| Phase | Theme | Core Deliverables | Security Notes |
|---|---|---|---|
| **Phase 9** ✅ | Roster expansion + public signal | 69 fighters (top 8–10 per division, all weight classes). Tapology public % column with FADE badge in MarketsScreen. Opening line preservation (`opening_lines` localStorage key). `NOT IN ROSTER` stub rows for live-only fights. | Tapology build-time scrape, browser Chrome UA (CORS prevents runtime). All new fighter seed data validated at scraper boundary. |
| **Phase 10** ✅ | Mobile + UX polish | Responsive bottom nav (< 768 px). Sidebar drawer overlay (FighterScreen + CalendarScreen). Dark/light theme toggle (`useTheme`, localStorage, `data-theme` on `<html>`, system preference via `prefers-color-scheme`). Fighter portrait field (nullable, self-hosted `/public/assets/`, initials fallback). Visual hierarchy audit (`fighter-link` → `--blue`; mono font for `.flag-value` + `.stat-cell-attr-val`). | Portrait images: self-hosted `public/assets/portraits/` — no CSP change required. Cloudinary deferred. Theme toggle: CSS variable swap only, no new external resources. |
| **Phase 11** ✅ | Alerts + notifications | `public/sw.js` minimal SW (install/activate, no fetch handler). `useAlerts(oddsData?)` hook: alertsEnabled + alertRules (localStorage), prevLines (sessionStorage), `detectMovements()` pure fn, browser `Notification` API dispatch. Bell icon + threshold input per fight in MarketsScreen. ⚙ ALERTS settings panel in MenuScreen (global toggle + permission request). Silent degradation when Notification unavailable, denied, or alertsEnabled=false. 239 tests. | SW scope `/`, no fetch handler, `worker-src 'self'` added to CSP. Alert body constructed with string concatenation (`textContent` semantics) — no HTML interpolation, no `innerHTML`, no template-literal HTML tags. `detectMovements()` is pure — no DOM access. All localStorage reads in `alerts.js` are try/catch-wrapped with typed defaults. |
| **Phase 12** ✅ | Live news layer | `useNews` hook: fetches MMA Fighting + MMA Junkie RSS, parses XML via DOMParser, strips HTML to textContent, classifies category/relevance, matches fighters by last name. 30-min sessionStorage cache. Falls back to static mock when CORS blocks (expected in production). LIVE/MOCK badges in NewsScreen + per item. TabOverview RECENT NEWS section (top 2 matched items). | **Critical met:** `stripHtml()` uses DOMParser textContent only — no innerHTML, no dangerouslySetInnerHTML with feed content. XSS test coverage in `newsParser.test.js`. |
| **Phase 13** ✅ | Sharing + export | `react-router-dom` v7: `BrowserRouter` + `Routes` in `App.jsx`; all 6 screens URL-addressable; `FighterScreenRoute` + `CompareScreenRoute` validate numeric URL params. Shareable `/compare/:f1id/:f2id` URL; COPY LINK button (user-initiated clipboard write). `src/utils/export.js`: `checklistToMarkdown()` + `clvLogToCsv()` + `downloadBlob()` (Blob revoke pattern). ↓ MD button in CompareScreen; ↓ CSV button in MarketsScreen CLV panel. SPA fallback in netlify.toml + vercel.json. 333 tests. | URL params: positive integers only — `parseId()` validates with `/^\d+$/` + `parseInt`. Clipboard write user-initiated only. CSV formula injection guard in `sanitizeCsvCell()`. Object URL revoked synchronously after click. No data to third-party services. |
| **Phase 14** ✅ | QoL + visual overhaul | `FighterSearch` combobox (ARIA-compliant; XSS-safe). `FighterCard` component (portrait/initials + arch/mod badges; interactive + static contexts). CompareScreen hero header with `FighterCard` × 2 + normalized implied probability gap. Category edge stripe (`categoryEdges` useMemo; `.cat-row--f1-edge/f2-edge`). `computePercentiles` + `TOP X%` badges in TabOverview. `statTiers.js` + tier labels in compare cells. TabOverview FLAGS → inline `.flags-pill-row` pills. Arch/mod pill badges everywhere. `pickLog.js` utility (200-entry cap, plain text). MarketsScreen `+ PICK` per card + inline form + PICKS log panel. VS./COMPARE in FighterScreen. COMPARE buttons in CalendarScreen. 392 tests; 0 lint errors. | `FighterSearch` input: `.trim()` + `.toLowerCase()` — results via JSX only, no innerHTML. `pick_log` key owned exclusively by `pickLog.js`; stored values coerced to `String()`, never HTML; `try/catch` on every read. Implied probability gap computed from pre-validated numeric values only. `useNavigate` (react-router-dom) — tests use MemoryRouter. No new external domains; no CSP changes; no new runtime npm dependencies. |

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
