import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR } from '../constants/qualifiers';

/**
 * TabOverview — renders the Overview tab for a fighter profile.
 * Shows key numbers (streak, finish rate, method breakdown, striking/grappling
 * highlights), qualitative flags (chin, cardio, weight cut), and trader notes.
 * @param {object} fighter - fighter object from FIGHTERS
 */
export const TabOverview = ({ fighter }) => {
  return <div className="anim-fade">
    <div className="sec-label">KEY NUMBERS</div>
    <div className="stat-grid">
      {[
        {l:'WIN STREAK',   v:fighter.streak,              s:`${fighter.streakType} streak`},
        {l:'FINISH RATE',  v:fighter.finish_rate+'%',     s:'non-decision wins'},
        {l:'KO WINS',      v:fighter.finishes.ko,         s:'by KO/TKO'},
        {l:'SUB WINS',     v:fighter.finishes.sub,        s:'by submission'},
        {l:'DEC WINS',     v:fighter.finishes.dec,        s:'by decision'},
        {l:'STR / MIN',    v:fighter.striking.slpm,       s:'sig strikes landed'},
        {l:'STR ABS / MIN',v:fighter.striking.sapm,       s:'sig strikes absorbed'},
        {l:'TD DEFENSE %', v:fighter.grappling.td_def+'%',s:'takedown defense'},
      ].map(s=><div className="stat-cell" key={s.l}><div className="stat-cell-label">{s.l}</div><div className="stat-cell-val">{s.v}</div><div className="stat-cell-sub">{s.s}</div></div>)}
    </div>
    <div className="sec-label">FLAGS</div>
    <div className="stat-grid stat-grid--narrow">
      <div className="stat-cell"><div className="stat-cell-label">CHIN</div><div className="flag-value" style={{color:CHIN_COLOR[fighter.chin]||'var(--text)'}}>{fighter.chin}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">CARDIO</div><div className="flag-value" style={{color:CARDIO_COLOR[fighter.cardio]||'var(--text)'}}>{fighter.cardio}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">WEIGHT CUT</div><div className="flag-value" style={{color:CUT_COLOR[fighter.weight_cut]||'var(--text)'}}>{fighter.weight_cut}</div></div>
    </div>
    <div className="sec-label">TRADER NOTES</div>
    <div className="trader-notes-block">{fighter.trader_notes}</div>
  </div>;
};
