# Audwihr — MMA Prediction Market Trader

A personal research and decision-support tool for MMA prediction market trading. Consolidates deep fighter analytics, live multi-source market intelligence (sportsbook + Polymarket + Kalshi), a structured pre-fight discipline framework, and long-term CLV tracking into one fast, shareable interface.

## What It Is

Not a sportsbook. Not a fantasy app. Not an AI picks tool. A war room for finding and sizing edges in MMA prediction markets by:

- Profiling fighters with structured statistical + qualitative data (archetype system, editorial flags)
- Running side-by-side matchup comparisons with 14 archetype rules, 8 style clashes, 10 modifier warnings
- Working through a 17-item research checklist before each trade
- Tracking live sportsbook odds (8 books via BestFightOdds), Polymarket, and Kalshi in one unified view
- Monitoring CLV (closing line value) with automated prediction-market snapshots
- Exporting research as shareable URLs, Markdown, or CSV

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 6 + `@vitejs/plugin-react` |
| UI | React 18 + React Router v7 + StrictMode |
| Styling | Vanilla CSS with CSS variables (WAR ROOM design system) |
| Fonts | Inter + JetBrains Mono (self-hosted via `@fontsource-variable`) |
| State | `useState` / `useMemo` / custom hooks (no state management library) |
| Testing | Vitest + Testing Library (527 tests, 80% coverage target) |
| Data | Build-time scrapers (UFCStats + Tapology + BestFightOdds via cheerio) |
| Runtime APIs | Polymarket CLOB (free), The Odds API + Kalshi (optional, paid) |
| Serverless | `/api/rss-proxy` — RSS CORS proxy (Netlify Functions v2 / Vercel) |
| Deployment | Vercel (primary) / Netlify (fallback) — static `dist/` output |
| Domain | `audvihr.space` (Namecheap DNS) |

## How to Run

```bash
# Install dependencies
npm install

# Development server (HMR)
npm run dev

# Production build (runs scrapers + Vite build)
npm run build

# Single pre-merge quality gate (lint + test + audit)
npm run validate

# Individual commands
npm run lint          # ESLint
npm run test:run      # Vitest single pass
npm run test:coverage # Coverage report
npm test              # Vitest watch mode
```

## Project Structure

```
audvihr/
├── CLAUDE.md           # Claude Code instructions (standards, security, modular design)
├── PLANNING.md         # Architecture, data models, design system, decisions log
├── TASKS.md            # Roadmap, current sprint, completed phases
├── CHANGELOG.md        # Version history
├── netlify.toml        # Netlify deploy config (security headers, CSP, SPA fallback)
├── vercel.json         # Vercel deploy config (mirrors netlify.toml headers)
├── netlify/functions/  # Netlify serverless functions (rss-proxy)
├── api/                # Vercel serverless functions (rss-proxy)
├── public/             # Static assets (SW, portraits, arena-test prototype)
├── scripts/            # Build-time scrapers (fetch-data.js, fetch-odds.js)
└── src/
    ├── main.jsx        # Entry point
    ├── App.jsx         # Router + layout shell
    ├── styles/app.css  # Global styles + CSS variables (design system)
    ├── constants/      # Pure lookup tables (archetypes, tiers, matchup rules, filters)
    ├── data/           # Generated + static data files
    ├── hooks/          # Custom React hooks (odds, markets, alerts, news, localStorage)
    ├── utils/          # Pure utility functions (odds math, cache, export, parsing)
    ├── components/     # Reusable UI components
    ├── tabs/           # Fighter profile tab panels (6 tabs)
    ├── screens/        # Top-level screen components (6 screens)
    └── test/           # Test setup + security header tests
```

## Current Status

**v0.18.4-dev** — 527 tests passing, 0 lint errors, 0 CVEs. WAR ROOM design system active. See [TASKS.md](TASKS.md) for sprint status and [CHANGELOG.md](CHANGELOG.md) for version history.

## Git Workflow

- `master` — tagged releases only, always deployable
- `feature/*` — one branch per phase or feature
- Pre-commit hooks enforce ESLint on staged files
- `npm run validate` before every merge

## Data Disclaimer

Fighter statistics are scraped from UFCStats.com at build time. Editorial data (archetypes, modifiers, qualitative flags) is manually curated in `scripts/fighter-seed.json`. Sportsbook odds are scraped from BestFightOdds.com at build time. All analysis outputs are labeled "RESEARCH PROMPT — NOT A PICK." This is a personal research tool, not financial advice.
