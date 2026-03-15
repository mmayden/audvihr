import { StatBar } from '../components/StatBar';

/**
 * TabStriking — renders the Striking tab for a fighter profile.
 * Shows volume & accuracy stats, knockdowns, strike target breakdown,
 * and striking-by-position breakdown, all with StatBar visualisations.
 * @param {object} fighter - fighter object from FIGHTERS
 */
export const TabStriking = ({ fighter }) => {
  const s = fighter.striking;
  return <div className="anim-fade">
    <div className="sec-label">VOLUME & ACCURACY</div>
    <div className="stat-row-list">
      {[
        {l:'Sig Strikes / Min',      v:s.slpm,    m:12,  c:'var(--accent)'},
        {l:'Striking Accuracy %',    v:s.str_acc, m:100, c:'var(--accent)',u:'%'},
        {l:'Sig Strikes Absorbed / Min', v:s.sapm, m:10, c:'var(--red)'},
        {l:'Striking Defense %',     v:s.str_def, m:100, c:'var(--green)',u:'%'},
      ].map(r=><div className="stat-row-item" key={r.l}><span className="srl-label">{r.l}</span><StatBar val={r.v} max={r.m} color={r.c}/><span className="srl-val">{r.v}{r.u||''}</span></div>)}
    </div>
    <div className="sec-label">KNOCKDOWNS</div>
    <div className="stat-grid stat-grid--two-col">
      <div className="stat-cell"><div className="stat-cell-label">KD LANDED</div><div className="stat-cell-val stat-cell-val--win">{s.kd_landed}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">KD SUFFERED</div><div className="stat-cell-val" style={{color:s.kd_suffered>0?'var(--red)':'var(--green)'}}>{s.kd_suffered}</div></div>
    </div>
    <div className="sec-label">STRIKE TARGET BREAKDOWN</div>
    <div className="stat-row-list">
      {[{l:'Head %',v:s.head_pct,c:'var(--red)'},{l:'Body %',v:s.body_pct,c:'var(--orange)'},{l:'Leg %',v:s.leg_pct,c:'var(--blue)'}]
        .map(r=><div className="stat-row-item" key={r.l}><span className="srl-label">{r.l}</span><StatBar val={r.v} max={100} color={r.c}/><span className="srl-val">{r.v}%</span></div>)}
    </div>
    <div className="sec-label">STRIKING BY POSITION</div>
    <div className="stat-row-list">
      {[{l:'Distance %',v:s.distance_str_pct,c:'var(--accent)'},{l:'Clinch %',v:s.clinch_str_pct,c:'var(--purple)'},{l:'Ground %',v:s.ground_str_pct,c:'var(--blue)'}]
        .map(r=><div className="stat-row-item" key={r.l}><span className="srl-label">{r.l}</span><StatBar val={r.v} max={100} color={r.c}/><span className="srl-val">{r.v}%</span></div>)}
    </div>
  </div>;
};
