/**
 * App — root screen router.
 * Manages which screen is active and handles cross-screen deep navigation.
 */
import { useState } from 'react';
import { MenuScreen } from './screens/MenuScreen';
import { FighterScreen } from './screens/FighterScreen';
import { CompareScreen } from './screens/CompareScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ComingSoon } from './screens/ComingSoon';

export const App = () => {
  const [screen, setScreen] = useState('menu');
  const [deepFighter, setDeepFighter] = useState(null);

  const goFighter = (fighter) => { setDeepFighter(fighter); setScreen('fighters'); };
  const backToMenu = () => { setDeepFighter(null); setScreen('menu'); };

  if (screen === 'fighters') return <FighterScreen onBack={backToMenu} initialFighter={deepFighter} />;
  if (screen === 'compare')  return <CompareScreen onBack={backToMenu} />;
  if (screen === 'calendar') return <CalendarScreen onBack={backToMenu} onGoFighter={goFighter} />;
  if (screen === 'markets')  return <ComingSoon label="MARKETS" onBack={backToMenu} />;
  if (screen === 'news')     return <ComingSoon label="FIGHTER NEWS" onBack={backToMenu} />;
  return <MenuScreen onSelect={setScreen} />;
};
