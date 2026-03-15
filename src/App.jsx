/**
 * App — root screen router.
 * Manages which screen is active and handles cross-screen deep navigation
 * (e.g. Calendar → Fighter profile, News → Fighter profile).
 * All screens are wrapped in an ErrorBoundary so a single screen crash
 * does not take down the entire app.
 */
import { useState } from 'react';
import { MenuScreen } from './screens/MenuScreen';
import { FighterScreen } from './screens/FighterScreen';
import { CompareScreen } from './screens/CompareScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { MarketsScreen } from './screens/MarketsScreen';
import { NewsScreen } from './screens/NewsScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App = () => {
  const [screen, setScreen] = useState('menu');
  const [deepFighter, setDeepFighter] = useState(null);

  const goFighter = (fighter) => { setDeepFighter(fighter); setScreen('fighters'); };
  const backToMenu = () => { setDeepFighter(null); setScreen('menu'); };

  let content;
  if (screen === 'fighters') content = <FighterScreen onBack={backToMenu} initialFighter={deepFighter} />;
  else if (screen === 'compare')  content = <CompareScreen onBack={backToMenu} />;
  else if (screen === 'calendar') content = <CalendarScreen onBack={backToMenu} onGoFighter={goFighter} />;
  else if (screen === 'markets')  content = <MarketsScreen onBack={backToMenu} />;
  else if (screen === 'news')     content = <NewsScreen onBack={backToMenu} onGoFighter={goFighter} />;
  else content = <MenuScreen onSelect={setScreen} />;

  return <ErrorBoundary key={screen}>{content}</ErrorBoundary>;
};
