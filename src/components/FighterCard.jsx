import { ARCH_COLORS, MOD_COLORS } from '../constants/archetypes';

/**
 * FighterCard — compact fighter summary card.
 * Displays portrait (or 2-letter initials fallback), name, record,
 * archetype pill badge, and up to 2 modifier pill badges.
 *
 * @param {object}   fighter      - fighter object from FIGHTERS
 * @param {function} [onClick]    - optional click handler
 * @param {boolean}  [isSelected] - when true, applies selected highlight style
 */
export const FighterCard = ({ fighter, onClick, isSelected = false }) => {
  const initials = fighter.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const archColor = ARCH_COLORS[fighter.archetype] ?? 'var(--text-dim)';
  const visibleMods = (fighter.mods ?? []).slice(0, 2);

  return (
    <div
      className={`fighter-card${isSelected ? ' selected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick ? isSelected : undefined}
      aria-label={onClick ? fighter.name : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
    >
      <div className="fighter-card-portrait">
        {fighter.portrait
          ? <img src={`/assets/portraits/${fighter.portrait}`} alt={fighter.name} />
          : <span className="fighter-card-initials">{initials}</span>
        }
      </div>
      <div className="fighter-card-body">
        <div className="fighter-card-name">{fighter.name}</div>
        <div className="fighter-card-record">{fighter.record} · {fighter.rank}</div>
        <div className="fighter-card-badges">
          <span className="arch-badge" style={{ color: archColor, borderColor: archColor }}>
            {fighter.archetype}
          </span>
          {visibleMods.map(mod => {
            const c = MOD_COLORS[mod] ?? 'var(--text-dim)';
            return (
              <span key={mod} className="mod-badge" style={{ color: c, borderColor: c }}>
                {mod}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
