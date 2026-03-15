# PLANNING.md — Audwihr Architecture & Design

This document is the primary reference for Claude and the developer during long-term development. It captures decisions, data models, constraints, and context that should not need to be re-explained between sessions.

---

## Architecture Philosophy

**Single-file first.** The app is one HTML file with React via CDN and inline CSS. This was intentional for Phase 1–3 (local dev). It means:
- Zero build tooling during rapid prototyping
- Fully portable, shareable by just sending a file
- Trade-off: gets unwieldy past ~2000 lines; also not suitable for web deployment as-is

**Deployment target: web.** The app will be hosted publicly. This changes one constraint:

> **`babel-standalone` is a hard blocker for production.** It is an ~860KB runtime JSX compiler that fires on every page load, causing 1–3s of blank screen before React renders. Acceptable locally; not acceptable on the web.

**Migration trigger (updated):** Phase 3a Vite migration is now a **required pre-launch step**, not an optional trigger. It must happen before Phase 3 is deployed live. Triggers:
- Deploying to the web (active) ← **this is the active trigger**
- File exceeds ~2000 lines
- Need for multi-file imports

After migration to Vite + React:
- Build output is a static site (`dist/`) — deployable to GitHub Pages, Netlify, or Vercel
- No runtime JSX compilation
- Proper React production build
- Same component structure, just split across files

---

## Current File Structure (Vite + React — v0.5.0)

The single-file prototype (`mma-trader.html`) was retired at Phase 3a. The project is now a Vite + React app with the following modular layout:

```
src/
├── main.jsx                  Entry point — ReactDOM.createRoot + StrictMode
├── App.jsx                   Screen router — useState only, no business logic
├── styles/
│   └── app.css               All global styles and CSS variables (design system)
├── constants/
│   ├── archetypes.js         ARCH_COLORS (8), MOD_COLORS (10) — CSS var references
│   ├── checklist.js          CHECKLIST (17 items), TABS (6 tab names)
│   └── qualifiers.js         CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, ORG_COLOR
├── data/
│   ├── fighters.js           FIGHTERS array — 14 mock fighters, full schema comment
│   ├── events.js             EVENTS array — 5 mock UFC events, full schema comment
│   ├── markets.js            MARKETS array — 8 mock prediction markets (Phase 4)
│   └── news.js               NEWS array — 12 mock news items (Phase 5)
├── hooks/
│   ├── useLocalStorage.js    useLocalStorage — JSON-serialised state with try/catch
│   └── useWatchlist.js       useWatchlist — watchlist set over useLocalStorage (Phase 4)
├── utils/
│   └── odds.js               mlToImplied(), lineMovement()
├── components/
│   ├── StatBar.jsx           Horizontal proportional fill bar
│   ├── FighterName.jsx       Name → profile link resolver (calendar + news)
│   └── ChecklistPanel.jsx    17-item trade checklist with progress bar
├── tabs/
│   ├── TabOverview.jsx       Key numbers, flags, trader notes
│   ├── TabStriking.jsx       Striking volume, accuracy, knockdowns, position
│   ├── TabGrappling.jsx      Takedowns, submissions, ground control, transitions
│   ├── TabPhysical.jsx       Physical attributes, camp, durability, loss methods
│   ├── TabHistory.jsx        Fight log table
│   └── TabMarket.jsx         Moneyline entry, implied %, line movement, notes
├── screens/
│   ├── MenuScreen.jsx        Main navigation (5 ACTIVE items)
│   ├── FighterScreen.jsx     Sidebar + hero card + 6-tab profile
│   ├── CompareScreen.jsx     Two-fighter selector + stat table + checklist
│   ├── CalendarScreen.jsx    Event sidebar + card detail + fighter deep-links
│   ├── MarketsScreen.jsx     Prediction market dashboard (Phase 4)
│   ├── NewsScreen.jsx        Fighter news feed with filters (Phase 5)
│   └── ComingSoon.jsx        Placeholder for unimplemented screens
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
Clean, functional, dark. Soft on the eyes. No animations beyond fade-in on tab switch. No particle effects, no animated backgrounds. The aesthetic is dense-data readability first — think military readout, not gaming UI. Reskin-ready: all colors are CSS variables, can theme in one pass later.

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

### localStorage Key Schema
```
cl_{storageKey}            checklist state (object: {id: boolean})
mkt_{fighter.id}           per-fighter market tab data (ml, odds, notes)
watchlist_markets          array of market IDs added to watchlist
```
Where `storageKey` for compare screen = `${Math.min(f1.id, f2.id)}_${Math.max(f1.id, f2.id)}`

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

### Current State (Vite + React — v0.5.0)

| Surface | Risk | Status |
|---------|------|--------|
| `babel-standalone` CDN | Runtime code execution (~860KB compiler, supply chain risk) | **Eliminated** — Vite compiles at build time, no runtime JSX compiler |
| CDN scripts (React, ReactDOM) | No SRI — CDN compromise could inject arbitrary JS | **Eliminated** — Vite bundles React into `dist/`, no CDN scripts at runtime |
| Google Fonts CDN | No SRI — low risk (CSS/fonts only, no JS) | Acceptable; add SRI if CSP tightened |
| `localStorage` reads | Malformed JSON parsed directly into state | **Mitigated** — `try/catch` with typed default fallback in `useLocalStorage` |
| User inputs (odds fields, notes) | Reflected into UI | **Mitigated** — React JSX escapes by default; `parseInt`/`isNaN` guard on all numeric fields |
| `dangerouslySetInnerHTML` | XSS if used with user input | **Not used** — do not introduce |
| Secrets / credentials | Hardcoded in source | **N/A currently** — no API keys yet; Phase 6 requires `.env` with `VITE_` prefix |
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

**Phase 6 API surface (future):** When live data is introduced, all external API calls must use server-side proxying or be made to APIs that support CORS explicitly. Do not expose API keys in client-side code.

---

## Research Findings That Drive Design Decisions

- **Most predictive stat:** significant strikes absorbed/min (defense > offense)
- **Volume beats power** as outcome predictor
- **Takedowns only matter when paired with offense** — cosmetic TDs score near zero
- **Wingspan is statistically significant**; stance is NOT
- **Underdogs +200+ won 39% of UFC bouts in 2024** vs 28% historical (systematic underpricing in high-attention fights)
- **Favorites still win 72%** — not a blanket fade-favorites market
- **RLM (Reverse Line Movement)** = key sharp signal
- **Weight regain after weigh-in** correlates with winner status
- **Judging hierarchy:** Effective striking → Effective aggressiveness → Octagon control

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
