# Audwihr — MMA Prediction Market Trader

A personal research and decision-support tool for MMA prediction market trading on platforms like Polymarket, Kalshi, and Novig. Collapses the multi-tab research workflow (stats sites, odds trackers, fight calendars) into one purpose-built interface.

## What It Is

Not a sportsbook. Not a fantasy app. A war room for finding and sizing edges in MMA prediction markets by:

- Profiling fighters with structured statistical and qualitative data
- Running side-by-side matchup comparisons
- Working through a research checklist before each trade
- Tracking manually entered odds with auto implied probability calculation

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | Single HTML file | Zero install, runs in any browser, fully portable |
| UI | React 18 via CDN | Component model without a build step |
| Styling | Vanilla CSS (CSS variables) | No framework dependency, easy to reskin |
| Fonts | Inter + JetBrains Mono via Google Fonts | Clean, readable, data-display friendly |
| Persistence | localStorage | Per-session odds, notes, checklist state |
| Data | Static JS objects in file | Mock data now; API layer planned in Phase 6 |

## How to Run

1. Download `mma-trader.html`
2. Open it in any modern browser
3. No server, no install, no dependencies

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

**v0.2.0** — Phase 2 complete. See `TASKS.md` for what's next.

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
