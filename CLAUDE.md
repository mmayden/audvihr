# CLAUDE.md — Audwihr

This file is loaded automatically by Claude Code at session start.

**Read these files before doing any work in a session:**
- **PLANNING.md** — architecture, data models, design system, security, constraints, decisions log
- **TASKS.md** — roadmap and active sprint. Always check first.
- **CHANGELOG.md** — version history

---

## Standards (enforced in every session, every change)

These are non-negotiable. Do not skip them to save time or complexity.

### Security

- **SRI on all CDN resources.** Any `<script src>` or `<link rel="stylesheet">` loading from an external CDN must have `integrity="sha384-..."` and `crossorigin="anonymous"`. No exceptions. Compute hashes with `openssl dgst -sha384 -binary <file> | openssl base64 -A` or fetch from the provider's SRI registry.
- **No `eval()`, `new Function()`, or `innerHTML` with user data.** React JSX escapes by default — do not bypass this with `dangerouslySetInnerHTML` unless absolutely necessary, and never with untrusted input.
- **No hardcoded secrets.** API keys, tokens, credentials go in `.env` (Vite: `VITE_` prefix). `.env` files are gitignored. Never commit secrets.
- **localStorage input validation.** All reads from localStorage must be wrapped in `try/catch` and validated against an expected shape. If validation fails, fall back to the typed default — never use raw parsed data unsanitized.
- **User input sanitization at the boundary.** Validate and sanitize all form inputs (odds fields, notes) before using them in calculations. `parseInt()` with `isNaN` guard is the current pattern — maintain it.
- **CSP required for web deployment.** Post-Vite: configure Content Security Policy via the hosting platform's headers file (`netlify.toml` or `_headers` for Netlify, `vercel.json` for Vercel). Minimum policy: `default-src 'self'; script-src 'self'; style-src 'self' fonts.googleapis.com; font-src fonts.gstatic.com`.
- **`noindex, nofollow` robots meta tag.** This is a personal trading tool — it must not be indexed by search engines. The tag is already present in `index.html`; do not remove it.
- **Dependency hygiene.** After Vite migration: run `npm audit` before every merge to `main`. Fix all critical/high severity issues before merging. Document any accepted moderate issues in PLANNING.md.
- **No `babel-standalone` in production.** It is a runtime code compiler (~860KB). It is acceptable only in the pre-Vite single-file prototype. Phase 3a removes it permanently.

### Code Quality

- **No component definitions inside render functions.** Defining a component inside another component's body causes it to be re-created on every render, forcing React to unmount/remount it. All components must be defined at module scope.
- **Shared constants at module level, never duplicated inline.** Color maps, lookup tables, and configuration objects belong in `src/constants/`. Do not copy them into component files.
- **Props are explicitly named and destructured.** Never use single-letter prop names at component API level (`f`, `e`, `s`). Internal variables may be abbreviated; props may not.
- **`useMemo` for derived data, not for static values.** Sorting/filtering arrays that depend on state → `useMemo`. Static constants defined at module level → no hook needed.
- **Hooks follow the Rules of Hooks.** No conditional hook calls. No hooks inside loops. Custom hooks must start with `use`.
- **Side effects only in `useEffect`.** Never mutate state directly or trigger side effects in render bodies.
- **Prefer `const` arrow functions for components.** `const MyComponent = ({ prop }) => { ... }`. Not `function MyComponent`. Exception: top-level utility functions may use `function` declarations.

### Documentation

- **Every component file has a JSDoc header.** Describe what it renders and list its props with types. This applies to new files and any file substantially modified.
  ```js
  /**
   * StatBar — horizontal fill bar for numeric stat display.
   * @param {number} val - current value
   * @param {number} max - scale maximum
   * @param {string} color - CSS color string for the fill
   */
  ```
- **Every data file has a schema comment.** The `FIGHTERS` and `EVENTS` arrays must have a comment above them documenting the shape of one entry. Update the schema comment if the data shape changes.
- **CHANGELOG.md updated before every merge to `main`.** Add an entry under `[Unreleased]` as you work; promote it to a version number at merge time.
- **TASKS.md sprint board kept current.** Check off tasks as they're completed. Do not leave stale unchecked items from prior sessions.
- **PLANNING.md decisions log updated for architecture changes.** Any change to deployment target, build approach, or data model gets a row in the decisions table with date and reason.

### Modular Design (post-Vite)

File and folder structure must match the following layout. Do not put components in the wrong location:

```
src/
├── main.jsx                  Entry point — ReactDOM.createRoot only
├── App.jsx                   Screen router — useState only, no business logic
├── styles/
│   └── app.css               All global styles, CSS variables, component classes
├── constants/
│   ├── archetypes.js         ARCH_COLORS, MOD_COLORS
│   ├── checklist.js          CHECKLIST array
│   └── qualifiers.js         CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, ORG_COLOR
├── data/
│   ├── fighters.js           FIGHTERS array with full schema comment
│   └── events.js             EVENTS array with full schema comment
├── hooks/
│   └── useLocalStorage.js    useLocalStorage hook (replaces useLS)
├── utils/
│   └── odds.js               mlToImplied(), lineMovement()
├── components/
│   ├── StatBar.jsx            SBar renamed to StatBar
│   ├── FighterName.jsx        Name → profile link resolver
│   └── ChecklistPanel.jsx
├── tabs/
│   ├── TabOverview.jsx
│   ├── TabStriking.jsx
│   ├── TabGrappling.jsx
│   ├── TabPhysical.jsx
│   ├── TabHistory.jsx
│   └── TabMarket.jsx
└── screens/
    ├── MenuScreen.jsx
    ├── FighterScreen.jsx
    ├── CompareScreen.jsx
    ├── CalendarScreen.jsx
    └── ComingSoon.jsx
```

- **One component per file.** File name = component name = export name.
- **Named exports only.** No default exports. Import what you use explicitly.
- **No barrel index files** until the project warrants it (Phase 5+).

---

## Key Constraints

- **Migration trigger has been hit.** The app will be hosted on the web. Vite migration (Phase 3a) is the active sprint. Do not add features to `mma-trader.html` — all new work goes into the Vite project.
- **No new features during Phase 3a.** Migration only — pure structural extraction, no logic changes.
- **Mock data only until Phase 6.** Do not connect live APIs before then.
- **All numbers and labels use JetBrains Mono.** All colors come from CSS variables — never hardcode hex values in JSX inline styles.
- **CSS variables are the design system.** Do not use Tailwind, CSS Modules, or styled-components until a deliberate design system decision is made and logged in PLANNING.md.

---

## Git Workflow

- `main` — tagged releases only, always deployable, always passing smoke test
- `feature/*` — one branch per phase or feature
- Commit per logical unit of work, not per file save
- Update `CHANGELOG.md` and `TASKS.md` before merging to `main`
- Run `npm audit` before merging to `main` (post-Vite)
- Never force-push `main`
