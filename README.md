# Audwihr — MMA Prediction Market Trader

A personal research and decision-support tool for MMA prediction market trading on platforms like Polymarket, Kalshi, and Novig. Collapses the multi-tab research workflow (stats sites, odds trackers, fight calendars) into one purpose-built interface.

## What It Is

Not a sportsbook. Not a fantasy app. A war room for finding and sizing edges in MMA prediction markets by:

- Profiling fighters with structured statistical and qualitative data
- Running side-by-side matchup comparisons
- Working through a research checklist before each trade
- Tracking manually entered odds with auto implied probability calculation

## Tech Stack

| Layer | Current (Phase 1–3) | Post-Migration (Phase 3a+) |
|-------|---------------------|---------------------------|
| Runtime | Single HTML file | Vite + React (static build) |
| UI | React 18 via CDN + Babel standalone | React 18 (compiled) |
| Styling | Vanilla CSS (CSS variables) | Same — no framework dependency |
| Fonts | Inter + JetBrains Mono via Google Fonts | Same |
| Persistence | localStorage | Same |
| Data | Static JS objects | Mock data now; API layer planned in Phase 6 |
| Deployment | Local file only | GitHub Pages / Netlify / Vercel |

> **Note:** The current single-file build uses `babel-standalone` to compile JSX at runtime (~860KB, fires on every load). This is fine locally but is a production blocker. Phase 3a migrates to a proper Vite build before web deployment.

## How to Run

**Local (current):**
1. Download `mma-trader.html`
2. Open it in any modern browser
3. No server, no install, no dependencies

**Web (after Phase 3a Vite migration):**
1. `npm install && npm run build`
2. Deploy `dist/` to GitHub Pages, Netlify, or Vercel
3. All three platforms support static SPA deployment with zero config

## Project Structure

```
Audwihr/
├── mma-trader.html     # The entire application
├── README.md           # This file
├── PLANNING.md         # Architecture, data models, design decisions
├── TASKS.md            # Phased roadmap and current sprint
└── CHANGELOG.md        # Version history
```

## Current Status

**v0.3.0 / Phase 3 in progress** — Fight Calendar built and active. See `TASKS.md` for sprint status and `CHANGELOG.md` for version history.

## Git Workflow

```
main                  # always deployable, tagged releases only
feature/*             # one branch per phase or feature
```

Branch naming:
- `feature/expand-roster`
- `feature/phase-3-calendar`
- `feature/phase-4-markets`

## Data Disclaimer

All fighter data is manually curated mock data for development. Stats are representative but not guaranteed accurate. Do not use for actual trading decisions until live data layer (Phase 6) is implemented.
