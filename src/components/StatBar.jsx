/**
 * StatBar — renders a horizontal proportional fill bar used in stat row lists.
 * @param {number} val - the current value
 * @param {number} max - the maximum value (100% width)
 * @param {string} [color] - CSS color string for the fill; defaults to var(--accent)
 */
export const StatBar = ({val, max, color}) => {
  const pct = Math.min(100, Math.round((val / max) * 100));
  return <div className="srl-bar"><div className="srl-fill" style={{width: pct + '%', background: color || 'var(--accent)'}}/></div>;
};
