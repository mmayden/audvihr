import { FIGHTERS } from '../data/fighters';

/**
 * FighterName — renders a fighter's name as a clickable profile link if they exist
 * in the roster, otherwise as plain text. Used in CalendarScreen and NewsScreen.
 * @param {string} name - the fighter's display name
 * @param {function} onGoFighter - callback invoked with the fighter object when clicked
 */
export const FighterName = ({name, onGoFighter}) => {
  const f = FIGHTERS.find(f => f.name === name);
  if (f) return <span className="fighter-link" onClick={() => onGoFighter(f)}>{name}</span>;
  return <span>{name}</span>;
};
