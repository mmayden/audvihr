/**
 * App — root screen router.
 * Manages which screen is active and handles cross-screen deep navigation
 * (e.g. Calendar → Fighter profile, News → Fighter profile).
 * All screens are wrapped in an ErrorBoundary so a single screen crash
 * does not take down the entire app.
 * On viewports < 768 px the bottom nav replaces the MenuScreen for navigation.
 */
import { useState } from 'react';
import { MenuScreen } from './screens/MenuScreen';
import { FighterScreen } from './screens/FighterScreen';
import { CompareScreen } from './screens/CompareScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { MarketsScreen } from './screens/MarketsScreen';
import { NewsScreen } from './screens/NewsScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './hooks/useTheme';

/** Bottom-nav items shown on mobile (< 768 px). */
const NAV_ITEMS = [
  { id: 'fighters', label: 'FIGHTERS' },
  { id: 'compare',  label: 'COMPARE'  },
  { id: 'calendar', label: 'CALENDAR' },
  { id: 'markets',  label: 'MARKETS'  },
  { id: 'news',     label: 'NEWS'     },
];

export const App = () => {
  const [screen, setScreen] = useState('menu');
  const [deepFighter, setDeepFighter] = useState(null);
  const { toggle: toggleTheme, label: themeLabel } = useTheme();

  const goFighter = (fighter) => { setDeepFighter(fighter); setScreen('fighters'); };
  const backToMenu = () => { setDeepFighter(null); setScreen('menu'); };
  const navTo = (id) => { setDeepFighter(null); setScreen(id); };

  let content;
  if (screen === 'fighters') content = <FighterScreen onBack={backToMenu} initialFighter={deepFighter} />;
  else if (screen === 'compare')  content = <CompareScreen onBack={backToMenu} />;
  else if (screen === 'calendar') content = <CalendarScreen onBack={backToMenu} onGoFighter={goFighter} />;
  else if (screen === 'markets')  content = <MarketsScreen onBack={backToMenu} />;
  else if (screen === 'news')     content = <NewsScreen onBack={backToMenu} onGoFighter={goFighter} />;
  else content = <MenuScreen onSelect={setScreen} />;

  return (
    <>
      <ErrorBoundary key={screen}>{content}</ErrorBoundary>
      {/* Floating theme toggle — visible on desktop, hidden on mobile */}
      <button className="theme-toggle-floating" onClick={toggleTheme} aria-label="Toggle colour theme">{themeLabel}</button>
      {/* Bottom nav — hidden on desktop, shown on mobile */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item${screen === item.id ? ' active' : ''}`}
            onClick={() => navTo(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button className="bottom-nav-theme" onClick={toggleTheme} aria-label="Toggle colour theme">{themeLabel}</button>
      </nav>
    </>
  );
};
