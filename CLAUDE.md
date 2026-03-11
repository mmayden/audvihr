# CLAUDE.md — Audwihr

This file is loaded automatically by Claude Code at session start. Read these files before doing any work:

- **PLANNING.md** — architecture, data models, design system, constraints, decisions log. Primary reference.
- **TASKS.md** — roadmap and current sprint. Check this first to understand what's active.
- **CHANGELOG.md** — version history.

## Key Constraints

- Single HTML file until migration trigger is hit (~2000 lines or multi-file imports needed). Do not migrate early.
- No build tooling in Phase 1–2. React via CDN, inline CSS only.
- No new features during a Vite migration phase — migration only.
- Mock data only until Phase 6. Do not connect live APIs before then.
- All numbers and labels use JetBrains Mono. All colors come from CSS variables — never hardcode hex values inline.

## Git Workflow

- `main` — tagged releases only, always deployable
- `feature/*` — one branch per phase or feature
- Commit per logical unit of work, not per file save
- Update CHANGELOG.md and TASKS.md before merging to main
