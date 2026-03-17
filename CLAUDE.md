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
- **localStorage / sessionStorage input validation.** All reads from localStorage or sessionStorage must be wrapped in `try/catch` and validated against an expected shape. If validation fails, fall back to the typed default — never use raw parsed data unsanitized.
- **User input sanitization at the boundary.** Validate and sanitize all form inputs (odds fields, notes) before using them in calculations. `parseInt()` with `isNaN` guard is the current pattern — maintain it.
- **CSP required for web deployment.** Configured in `netlify.toml` and `vercel.json`. Current policy includes: `default-src 'self'`; `script-src 'self'`; `worker-src 'self'` (for Service Worker); `style-src 'self' fonts.googleapis.com`; `font-src fonts.gstatic.com`; `connect-src 'self'` + 5 API/feed domains (The Odds API, Polymarket, Kalshi, MMA Fighting, MMA Junkie); `img-src 'self' data:`; `frame-ancestors 'none'`. Do not weaken any directive. Every new external domain must be added to both files and documented in PLANNING.md decisions log.
- **External feed content is untrusted — text extraction only.** `src/utils/newsParser.js` owns all RSS sanitization. `stripHtml()` uses `DOMParser('text/html').body.textContent` — tags are never rendered, only text extracted. `parseRssFeed()` uses `DOMParser('application/xml')`. Feed content (title, description) must never be passed to `innerHTML`, `dangerouslySetInnerHTML`, or any DOM-insertion API. Headline capped at 160 chars, body at 600 chars. XSS test coverage is mandatory.
- **Alert notifications use plain text only.** The Notification API body must be constructed with string concatenation of validated values only. No HTML template literals, no `innerHTML`, no `dangerouslySetInnerHTML`. Browsers do not render HTML in notification bodies — never attempt to inject markup.
- **CSV export must guard against formula injection.** Any value exported as CSV that begins with `=`, `+`, `-`, or `@` must be prefixed with a single quote `'` to prevent spreadsheet formula execution.
- **`noindex, nofollow` robots meta tag.** This is a personal trading tool — it must not be indexed by search engines. The tag is already present in `index.html`; do not remove it.
- **URL params carry fighter IDs only.** React Router (Phase 13) is live. URL parameters must contain only numeric fighter IDs and screen slugs. Validated with `/^\d+$/` + `parseInt` in `FighterScreenRoute` / `CompareScreenRoute` in `App.jsx` before any FIGHTERS lookup. No API keys, no localStorage state, no session tokens in URLs.
- **Dependency hygiene.** Run `npm audit` before every merge to `master`. Fix all critical/high severity issues before merging. Document any accepted moderate issues in PLANNING.md.

### Storage Key Ownership

Each storage key is owned by exactly one module. No other module reads or writes it.

| Key | Storage | Owner | Type |
|-----|---------|-------|------|
| `cl_{f1id}_{f2id}` | localStorage | ChecklistPanel / CompareScreen | per-matchup checklist state |
| `mkt_{fighter.id}` | localStorage | TabMarket | per-fighter market tab data |
| `watchlist_markets` | localStorage | useWatchlist | array of market IDs |
| `clv_log` | localStorage | `src/utils/clv.js` | CLV snapshot log (500-entry cap) |
| `opening_lines` | localStorage | `src/utils/clv.js` | opening line archive (never evicted) |
| `theme` | localStorage | `src/hooks/useTheme.js` | `'light'\|'dark'\|'system'` |
| `alerts_enabled` | localStorage | `src/utils/alerts.js` | boolean global toggle |
| `alert_rules` | localStorage | `src/utils/alerts.js` | `{ [fightKey]: { enabled, threshold } }` |
| `alerts_prev_lines` | sessionStorage | `src/utils/alerts.js` | transient prev-ML snapshot |
| `recent_fighters` | sessionStorage | `FighterScreen` | last 3 viewed fighter IDs (reserved — not yet implemented) |
| `pick_log` | localStorage | `src/utils/pickLog.js` | pre-fight picks + outcomes (200-entry cap) |
| `cache_odds_v1` | sessionStorage | `src/hooks/useOdds.js` via `cache.js` | 15-min Odds API response cache |
| `cache_news_v1` | sessionStorage | `src/hooks/useNews.js` via `cache.js` | 30-min RSS feed response cache |
| Polymarket/Kalshi cache | sessionStorage | respective hooks via `cache.js` | 10-min market price cache |

### Code Quality

- **No component definitions inside render functions.** Defining a component inside another component's body causes it to be re-created on every render, forcing React to unmount/remount it. All components must be defined at module scope.
- **Shared constants at module level, never duplicated inline.** Color maps, lookup tables, and configuration objects belong in `src/constants/`. Do not copy them into component files.
- **Props are explicitly named and destructured.** Never use single-letter prop names at component API level (`f`, `e`, `s`). Internal variables may be abbreviated; props may not.
- **`useMemo` for derived data, not for static values.** Sorting/filtering arrays that depend on state → `useMemo`. Static constants defined at module level → no hook needed.
- **Hooks follow the Rules of Hooks.** No conditional hook calls. No hooks inside loops. Custom hooks must start with `use`.
- **Side effects only in `useEffect`.** Never mutate state directly or trigger side effects in render bodies.
- **Prefer `const` arrow functions for components.** `const MyComponent = ({ prop }) => { ... }`. Not `function MyComponent`. Exception: top-level utility functions may use `function` declarations.
- **Never suppress `react-hooks/exhaustive-deps` with `eslint-disable`.** If a `useEffect` needs to run only once after a condition becomes true, use an early-return guard (`if (!ready || alreadyDone) return`) inside the effect and list all true dependencies in the array. Suppression hides real dependency bugs; a guard makes the once-only intent explicit and keeps ESLint enforceable.
- **CSS modifier classes for boolean-toggled colors; inline style for data-keyed lookups.** If a CSS value is one of two (or a few) fixed design-system colors toggled by a boolean expression, use a BEM modifier class (e.g. `.line-movement-bar--up`). If the CSS value comes from a runtime lookup map keyed by data (`ARCH_COLORS[fighter.archetype]`, `CHIN_COLOR[fighter.chin]`), inline style is correct — the value cannot be encoded in a finite class list. Never hardcode hex values in either form; always reference CSS variables.
- **Interactive non-semantic elements need ARIA attributes.** `<div>` and `<span>` elements that behave like controls (checkbox, button, tab, combobox) must have `role`, `aria-checked`/`aria-selected`/`aria-expanded` as appropriate, and `aria-label` when the visible text is insufficient. This applies to any clickable div added in the future.
- **Search/filter inputs: sanitize before filtering, never reflect to DOM via innerHTML.** `FighterSearch` and any future filter input: trim + toLowerCase before comparing against roster. The filtered output is rendered via JSX (safe by default). Never pass raw input to `innerHTML`, `dangerouslySetInnerHTML`, or `insertAdjacentHTML`.
- **Pill badges use `.arch-badge` / `.mod-badge` CSS classes for shape; inline style for color.** Archetype and modifier colors come from `ARCH_COLORS` / `MOD_COLORS` runtime lookup maps — inline style is correct (data-keyed, cannot be encoded as a finite class list). The badge shape (border-radius, padding, font) belongs in CSS classes. Never hardcode hex in the style prop.
- **`pick_log` localStorage key is owned exclusively by `src/utils/pickLog.js`.** No other module reads or writes it. Reads must be `try/catch` with typed default `[]`. All stored values are plain text strings — no HTML, no eval, no template-literal markup in stored data. The MarketsScreen notes textarea uses `maxLength={200}` at the DOM level and `.trim()` at save time; stored via `String()` coercion. Pick log entries are rendered in the PICKS panel via JSX text nodes only — never via `innerHTML` or `dangerouslySetInnerHTML`.
- **Flag pill inline style carries both `color` and `borderColor`.** `.flag-pill` uses `border: 1px solid currentColor` in CSS and receives `style={{ color: ..., borderColor: ... }}` inline. The `borderColor` must be set explicitly alongside `color` because `currentColor` in the border rule references the element's own `color` CSS property — both are data-keyed lookups from qualifier maps (CHIN_COLOR, CARDIO_COLOR, CUT_COLOR) so inline style is correct per CLAUDE.md. Never set only `color` and expect `currentColor` to follow in a React inline style context.

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
- **CHANGELOG.md updated before every merge to `master`.** Add an entry under `[Unreleased]` as you work; promote it to a version number at merge time.
- **TASKS.md sprint board kept current.** Check off tasks as they're completed. Do not leave stale unchecked items from prior sessions.
- **PLANNING.md decisions log updated for architecture changes.** Any change to deployment target, build approach, or data model gets a row in the decisions table with date and reason.

### Testing

- **Test runner: Vitest.** Run `npm run test:run` for a single pass, `npm test` for watch mode, `npm run test:coverage` for coverage report.
- **Test setup: `src/test/setup.js`** extends `@testing-library/jest-dom` and provides a deterministic in-memory `localStorage` mock. Never call `localStorage.clear()` without this setup in place.
- **What to test:**
  - Every util function in `src/utils/` — test all branches (happy path, edge cases, null/invalid input).
  - Every custom hook in `src/hooks/` — use `renderHook` + `act` from `@testing-library/react`. Reset localStorage in `beforeEach`.
  - Every component in `src/components/` that has conditional render paths — use `@testing-library/react`. Test DOM output, not implementation details.
  - Security-critical functions must have explicit XSS and injection attack tests (see `newsParser.test.js` for the pattern).
  - Screens and tabs are integration-heavy — smoke tests plus targeted feature tests for new additions. Full integration rendering tests are deferred.
- **Coverage target: 80%** on utils and hooks. Run `npm run test:coverage` and check the `text` output before merging.
- **Test files co-located with source.** `src/utils/odds.test.js` lives next to `src/utils/odds.js`. Pattern: `<name>.test.{js,jsx}`.
- **All tests must pass before merging to `master`.** A failing test is a merge blocker.
- **ESLint must exit 0 before merging.** Run `npm run lint`. Zero errors is required; warnings are acceptable only if they cannot be resolved without disproportionate effort (document in PR description).

### Modular Design (post-Vite)

File and folder structure must match the following layout. Do not put components in the wrong location:

```
public/
│   ├── sw.js                 Service Worker — install/activate only; scope /; no fetch handler
│   └── assets/portraits/     Self-hosted fighter portrait images (*.jpg); no CDN, no CSP change
src/
├── main.jsx                  Entry point — ReactDOM.createRoot + StrictMode; SW registration
├── App.jsx                   URL router — BrowserRouter + Routes; FighterScreenRoute + CompareScreenRoute at module scope; bottom nav; theme toggle
├── styles/
│   └── app.css               All global styles, CSS variables, component classes
├── constants/
│   ├── archetypes.js         ARCH_COLORS (8 archetypes), MOD_COLORS (10 modifiers) — CSS var refs
│   ├── checklist.js          CHECKLIST array (17 items), TABS array (6 tab names)
│   ├── compareRows.js        15 stat-row definitions — (f1, f2) → row functions for CompareScreen
│   ├── qualifiers.js         CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, ORG_COLOR, RELEVANCE_COLOR, CATEGORY_COLOR
│   └── statTiers.js          STAT_TIERS — per-stat thresholds for ELITE/ABOVE AVG/AVG/BELOW AVG labels
├── data/
│   ├── fighters.js           FIGHTERS array — generated by fetch-data.js (live UFCStats)
│   ├── events.js             EVENTS array — generated by fetch-data.js (upcoming UFC cards + Tapology %)
│   ├── markets.js            MARKETS array — 8 mock prediction markets (static)
│   └── news.js               NEWS array — 12 mock news items; static fallback for useNews when RSS unavailable
├── scripts/                  Build-time tools only — not bundled into the app
│   ├── fetch-data.js         UFCStats + Tapology scraper (Node ESM, cheerio, browser UA for Tapology)
│   └── fighter-seed.json     Editorial data per fighter (archetype, mods, notes, ufcstats_url)
├── hooks/
│   ├── useLocalStorage.js    useLocalStorage — JSON-serialised state with try/catch
│   ├── useWatchlist.js       useWatchlist — watchlist set over useLocalStorage
│   ├── useOdds.js            useOdds — The Odds API moneylines; 15-min sessionStorage cache; silent degradation
│   ├── usePolymarket.js      usePolymarket — Polymarket CLOB prices + lazy history; CLV snapshot
│   ├── useKalshi.js          useKalshi — Kalshi REST API prices + lazy history; CLV snapshot; silent degradation
│   ├── useTheme.js           useTheme — colour-scheme toggle; persists 'light'|'dark'|'system'; data-theme on <html>
│   ├── useAlerts.js          useAlerts — alert rules, permission state, Notification API dispatch; owns alerts_enabled + alert_rules keys
│   └── useNews.js            useNews — fetches MMA Fighting + MMA Junkie RSS; 30-min cache; fallback to news.js mock; returns { items, loading, isLive }
├── utils/
│   ├── odds.js               mlToImplied(), lineMovement()
│   ├── date.js               daysUntil(), isPast() — shared date helpers
│   ├── normalizeOdds.js      fightKey(), probToML(), normalize*() — API response transforms
│   ├── cache.js              readCache(), writeCache(), evictCache() — sessionStorage helpers
│   ├── clv.js                appendCLVEntries(), readCLVLog(), appendOpeningLine(), readOpeningLines() — CLV + opening line localStorage helpers; owns clv_log + opening_lines keys
│   ├── alerts.js             readAlertsEnabled/writeAlertsEnabled, readAlertRules/writeAlertRules, readPrevLines/writePrevLines, detectMovements() — alert pure functions; owns alerts_prev_lines key
│   ├── newsParser.js         stripHtml(), parseRssFeed(), classifyCategory(), classifyRelevance(), matchFighterName(), rssItemToNewsItem() — RSS sanitization + normalization; text-only, no DOM injection
│   ├── export.js             sanitizeCsvCell(), checklistToMarkdown(), clvLogToCsv(), downloadBlob() — client-side Blob export; CSV formula injection guard
│   ├── fighters.js           findFighterByName(name, fighters) — pure name → ID lookup with last-name fallback
│   ├── percentiles.js        computePercentiles(fighter, allFighters) — per-stat percentile rank vs full roster
│   └── pickLog.js            readPickLog(), appendPick(), updatePickOutcome() — owns pick_log key exclusively
├── components/
│   ├── StatBar.jsx           Horizontal proportional fill bar
│   ├── FighterName.jsx       Name → profile link resolver
│   ├── FighterCard.jsx       Compact card: portrait/initials + name + record + archetype + mod badges; interactive and static (non-interactive via CSS override in compare header)
│   ├── FighterSearch.jsx     Type-to-search combobox; ARIA-compliant; XSS-safe; blur race guard
│   ├── ChecklistPanel.jsx    17-item trade checklist with progress bar
│   ├── ErrorBoundary.jsx     Class component error boundary wrapping all screens
│   └── PriceChart.jsx        SVG sparkline for prediction-market probability-over-time
├── tabs/
│   ├── TabOverview.jsx       Key numbers + TOP X% percentile badges; FLAGS as inline pill row (chin/cardio/cut); trader notes; RECENT NEWS (top 2 items via newsItems prop)
│   ├── TabStriking.jsx       Striking volume, accuracy, knockdowns, position
│   ├── TabGrappling.jsx      Takedowns, submissions, ground control, transitions
│   ├── TabPhysical.jsx       Physical attributes, camp, durability, loss methods
│   ├── TabHistory.jsx        Fight log table
│   └── TabMarket.jsx         Manual odds entry + live Polymarket/Kalshi prices when matched
├── screens/
│   ├── MenuScreen.jsx        Main navigation (5 ACTIVE items) + ⚙ ALERTS settings panel
│   ├── FighterScreen.jsx     Sidebar + hero card (arch/mod pill badges + VS./COMPARE button) + 6-tab profile; calls useNews(); passes fighterNews to TabOverview
│   ├── CompareScreen.jsx     FighterCard hero header + implied probability gap; FighterSearch selectors; stat table with tier labels + category edge stripe; edge signal panel; checklist; COPY LINK + ↓ MD export
│   ├── CalendarScreen.jsx    Event sidebar + card detail + fighter deep-links + COMPARE button per in-roster bout
│   ├── MarketsScreen.jsx     Unified live market dashboard (sportsbook + Polymarket + Kalshi + opening line + Tapology %) + alert bell + + PICK form per fight + PICKS log panel + CLV ↓ CSV export
│   └── NewsScreen.jsx        Fighter news feed with filters; LIVE/MOCK source badge; per-item LIVE/MOCK badge
└── test/
    └── setup.js              Vitest setup — jest-dom + in-memory localStorage mock
```

- **One component per file.** File name = component name = export name.
- **Named exports only.** No default exports. Import what you use explicitly.
- **No barrel index files** until the project warrants it (Phase 5+).

---

## Key Constraints

- **Vite + React + React Router, web-deployed.** The single-file prototype (`mma-trader.html`) is retired. All work goes into the Vite project. `babel-standalone` is gone permanently. React Router v7 (`BrowserRouter`) is live in `App.jsx`; SPA fallback configured in `netlify.toml` + `vercel.json` + `vite.config.js`.
- **Fighter and event data is live (build-time scraped).** `fighters.js` and `events.js` are generated by `scripts/fetch-data.js` at `npm run build`. Do not hand-edit them. `markets.js` is static mock. `news.js` is the static fallback seed for `useNews` — do not hand-edit it either (it's loaded when RSS sources are unavailable).
- **Three live market hooks (Phase 7+).** `useOdds`, `usePolymarket`, and `useKalshi` make runtime API calls. All three degrade silently when their key is absent or the API is unreachable. `VITE_ODDS_API_KEY` (The Odds API) and `VITE_KALSHI_API_KEY` (Kalshi) go in `.env`. Polymarket is unauthenticated. Do not move API calls into `useEffect`-free code paths.
- **Live news hook (Phase 12+).** `useNews` fetches MMA Fighting + MMA Junkie RSS, parses via `newsParser.js`, caches 30 min in sessionStorage. Degrades silently to `news.js` mock when CORS blocks. All feed content is text-only — no HTML reaches the DOM.
- **sessionStorage for API response caching.** Cache TTL: 15 min for The Odds API (quota budget), 10 min for Polymarket + Kalshi, 30 min for RSS news. Use `src/utils/cache.js` helpers — do not re-implement cache logic inline.
- **CLV log in localStorage.** `src/utils/clv.js` owns the CLV log key (`clv_log`, 500-entry cap) and the opening line key (`opening_lines`, never evicted). Do not write to either key from any other path.
- **All numbers and labels use JetBrains Mono.** All colors come from CSS variables — never hardcode hex values in JSX inline styles.
- **CSS variables are the design system.** Do not use Tailwind, CSS Modules, or styled-components until a deliberate design system decision is made and logged in PLANNING.md.
- **Theme toggle via `data-theme` on `<html>`.** Light theme is defined under `[data-theme="light"]` and `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) }` in `app.css`. The `useTheme` hook owns the `theme` localStorage key. Do not write to it from any other path.
- **Portrait images are self-hosted.** Drop fighter portrait files into `public/assets/portraits/` (e.g. `makhachev.jpg`). Add the filename to `fighter-seed.json` as the `portrait` field. No CDN, no CSP change, no build step required.
- **Alert storage keys owned exclusively by `alerts.js`.** `alerts_enabled` and `alert_rules` (localStorage) and `alerts_prev_lines` (sessionStorage) may only be read/written by `src/utils/alerts.js` and `src/hooks/useAlerts.js`. No other module touches these keys.
- **Service Worker is minimal and static.** `public/sw.js` contains only install/activate handlers. It makes no fetch calls. Do not add caching logic or background sync to it without a deliberate architecture decision. SW registration lives in `main.jsx` only.
- **`worker-src 'self'` in CSP.** The SW is registered from the same origin. Both `netlify.toml` and `vercel.json` include `worker-src 'self'` in the Content-Security-Policy header. Do not remove it.
- **Pick log in localStorage.** `src/utils/pickLog.js` owns the `pick_log` key (200-entry cap, same eviction pattern as `clv_log`). All stored values are plain text strings. No other module reads or writes this key.
- **`FighterSearch` input sanitization.** The search input is filtered against the in-memory `FIGHTERS` array using `.trim()` + `.toLowerCase()`. Results rendered via JSX only — no innerHTML, no dangerouslySetInnerHTML. Input is never reflected into the DOM as markup.
- **Current test count: 392 passing.** Do not merge changes that reduce this number without a documented reason.

---

## Git Workflow

- `master` — tagged releases only, always deployable, always passing smoke test
- `feature/*` — one branch per phase or feature
- Commit per logical unit of work, not per file save
- Update `CHANGELOG.md` and `TASKS.md` before merging to `master`
- Run `npm audit` before merging to `master`
- Never force-push `master`
