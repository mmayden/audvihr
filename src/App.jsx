/**
 * App — root screen router.
 * Manages which screen is active and handles cross-screen deep navigation.
 */
import { useState } from 'react';
import { MenuScreen } from './screens/MenuScreen';
import { FighterScreen } from './screens/FighterScreen';
import { CompareScreen } from './screens/CompareScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { MarketsScreen } from './screens/MarketsScreen';
import { NewsScreen } from './screens/NewsScreen';

export const App = () => {
  const [screen, setScreen] = useState('menu');
  const [deepFighter, setDeepFighter] = useState(null);

  const goFighter = (fighter) => { setDeepFighter(fighter); setScreen('fighters'); };
  const backToMenu = () => { setDeepFighter(null); setScreen('menu'); };

  if (screen === 'fighters') return <FighterScreen onBack={backToMenu} initialFighter={deepFighter} />;
  if (screen === 'compare')  return <CompareScreen onBack={backToMenu} />;
  if (screen === 'calendar') return <CalendarScreen onBack={backToMenu} onGoFighter={goFighter} />;
  if (screen === 'markets')  return <MarketsScreen onBack={backToMenu} />;
  if (screen === 'news')     return <NewsScreen onBack={backToMenu} onGoFighter={goFighter} />;
  return <MenuScreen onSelect={setScreen} />;
};
