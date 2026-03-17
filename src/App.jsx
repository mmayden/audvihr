/**
 * App — root screen router.
 * Uses React Router v7 BrowserRouter + Routes for URL-based navigation.
 * Route wrappers (FighterScreenRoute, CompareScreenRoute) defined at module
 * scope to avoid component re-creation on render.
 *
 * Routes:
 *   /              → MenuScreen
 *   /fighters      → FighterScreen (first in roster)
 *   /fighters/:id  → FighterScreen (fighter by numeric ID)
 *   /compare       → CompareScreen (empty)
 *   /compare/:f1id/:f2id → CompareScreen (pre-loaded fighters)
 *   /calendar      → CalendarScreen
 *   /markets       → MarketsScreen
 *   /news          → NewsScreen
 *
 * Security: URL params are validated as positive integers before FIGHTERS
 * lookup. Non-numeric slugs fall through to null (screen handles gracefully).
 */
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { FIGHTERS } from './data/fighters';
import { MenuScreen } from './screens/MenuScreen';
import { FighterScreen } from './screens/FighterScreen';
import { CompareScreen } from './screens/CompareScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { MarketsScreen } from './screens/MarketsScreen';
import { NewsScreen } from './screens/NewsScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './hooks/useTheme';

/** Bottom-nav items. */
const NAV_ITEMS = [
  { id: 'fighters', label: 'FIGHTERS', path: '/fighters' },
  { id: 'compare',  label: 'COMPARE',  path: '/compare'  },
  { id: 'calendar', label: 'CALENDAR', path: '/calendar' },
  { id: 'markets',  label: 'MARKETS',  path: '/markets'  },
  { id: 'news',     label: 'NEWS',     path: '/news'     },
];

/** Map MenuScreen screen-ID strings to paths. */
const SCREEN_PATH = {
  fighters: '/fighters',
  compare:  '/compare',
  calendar: '/calendar',
  markets:  '/markets',
  news:     '/news',
};

/**
 * Safely parse a URL param string as a positive integer.
 * Returns NaN for non-numeric or negative values.
 */
function parseId(str) {
  if (!str || !/^\d+$/.test(str)) return NaN;
  return parseInt(str, 10);
}

/** Route wrapper: reads /fighters/:id, validates, finds fighter, renders FighterScreen. */
const FighterScreenRoute = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const idNum     = parseId(id);
  const fighter   = !isNaN(idNum) ? FIGHTERS.find(f => f.id === idNum) ?? null : null;
  return <FighterScreen onBack={() => navigate('/')} initialFighter={fighter} />;
};

/** Route wrapper: reads /compare/:f1id/:f2id, validates, renders CompareScreen. */
const CompareScreenRoute = () => {
  const navigate        = useNavigate();
  const { f1id, f2id } = useParams();
  return (
    <CompareScreen
      onBack={() => navigate('/')}
      initialF1Id={/^\d+$/.test(f1id ?? '') ? f1id : ''}
      initialF2Id={/^\d+$/.test(f2id ?? '') ? f2id : ''}
    />
  );
};

/** Inner app — needs router context for useNavigate / useLocation. */
const AppInner = () => {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const { toggle: toggleTheme, label: themeLabel } = useTheme();

  const activeId = NAV_ITEMS.find(n => pathname.startsWith(n.path))?.id ?? '';

  return (
    <>
      <ErrorBoundary key={pathname}>
        <Routes>
          <Route path="/"                     element={<MenuScreen onSelect={(id) => navigate(SCREEN_PATH[id] ?? '/')} />} />
          <Route path="/fighters"             element={<FighterScreen onBack={() => navigate('/')} initialFighter={null} />} />
          <Route path="/fighters/:id"         element={<FighterScreenRoute />} />
          <Route path="/compare"              element={<CompareScreen onBack={() => navigate('/')} />} />
          <Route path="/compare/:f1id/:f2id"  element={<CompareScreenRoute />} />
          <Route path="/calendar"             element={<CalendarScreen onBack={() => navigate('/')} onGoFighter={(f) => navigate('/fighters/' + f.id)} />} />
          <Route path="/markets"              element={<MarketsScreen onBack={() => navigate('/')} />} />
          <Route path="/news"                 element={<NewsScreen onBack={() => navigate('/')} onGoFighter={(f) => navigate('/fighters/' + f.id)} />} />
        </Routes>
      </ErrorBoundary>

      {/* Floating theme toggle — visible on desktop, hidden on mobile */}
      <button className="theme-toggle-floating" onClick={toggleTheme} aria-label="Toggle colour theme">{themeLabel}</button>

      {/* Bottom nav — hidden on desktop, shown on mobile */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item${activeId === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
        <button className="bottom-nav-theme" onClick={toggleTheme} aria-label="Toggle colour theme">{themeLabel}</button>
      </nav>
    </>
  );
};

export const App = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
);
