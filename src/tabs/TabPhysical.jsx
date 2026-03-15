import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR } from '../constants/qualifiers';

/**
 * TabPhysical — renders the Physical tab for a fighter profile.
 * Shows physical attributes, training camp, durability flags,
 * and loss method breakdown.
 * @param {object} fighter - fighter object from FIGHTERS
 */
export const TabPhysical = ({ fighter }) => {
  return <div className="anim-fade">
    <div className="sec-label">PHYSICAL ATTRIBUTES</div>
    <div className="stat-grid">
      {[{l:'AGE',v:fighter.age+' yrs'},{l:'HEIGHT',v:fighter.height},{l:'REACH',v:fighter.reach},{l:'STANCE',v:fighter.stance},{l:'WEIGHT CLASS',v:fighter.weight},{l:'COUNTRY',v:fighter.country}]
        .map(s=><div className="stat-cell" key={s.l}><div className="stat-cell-label">{s.l}</div><div className="stat-cell-attr-val">{s.v}</div></div>)}
    </div>
    <div className="sec-label">TRAINING CAMP</div>
    <div className="stat-cell stat-cell--standalone"><div className="stat-cell-label">CAMP / GYM</div><div className="stat-cell-text-val">{fighter.camp}</div></div>
    <div className="sec-label">DURABILITY FLAGS</div>
    <div className="stat-grid stat-grid--narrow">
      <div className="stat-cell"><div className="stat-cell-label">CHIN RATING</div><div className="flag-value" style={{color:CHIN_COLOR[fighter.chin]||'var(--text)'}}>{fighter.chin}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">CARDIO RATING</div><div className="flag-value" style={{color:CARDIO_COLOR[fighter.cardio]||'var(--text)'}}>{fighter.cardio}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">WEIGHT CUT</div><div className="flag-value" style={{color:CUT_COLOR[fighter.weight_cut]||'var(--text)'}}>{fighter.weight_cut}</div></div>
    </div>
    <div className="sec-label">LOSS METHOD BREAKDOWN</div>
    <div className="stat-grid stat-grid--three-col">
      <div className="stat-cell"><div className="stat-cell-label">LOSSES BY KO</div><div className="stat-cell-val" style={{color:fighter.losses_by.ko>0?'var(--red)':'var(--green)'}}>{fighter.losses_by.ko}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">LOSSES BY SUB</div><div className="stat-cell-val" style={{color:fighter.losses_by.sub>0?'var(--red)':'var(--green)'}}>{fighter.losses_by.sub}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">LOSSES BY DEC</div><div className="stat-cell-val" style={{color:fighter.losses_by.dec>0?'var(--orange)':'var(--green)'}}>{fighter.losses_by.dec}</div></div>
    </div>
  </div>;
};
