import { StatBar } from '../components/StatBar';

/**
 * TabGrappling — renders the Grappling tab for a fighter profile.
 * Shows takedown stats, submission attempts, ground control time,
 * and transition rates, all with StatBar visualisations.
 * @param {object} fighter - fighter object from FIGHTERS
 */
export function TabGrappling({ fighter }) {
  const g = fighter.grappling;
  return <div className="anim-fade">
    <div className="sec-label">TAKEDOWNS</div>
    <div className="stat-row-list">
      {[{l:'TD Attempts / 15 Min',v:g.td_per15,m:10,c:'var(--blue)'},{l:'TD Accuracy %',v:g.td_acc,m:100,c:'var(--blue)',u:'%'},{l:'TD Defense %',v:g.td_def,m:100,c:'var(--green)',u:'%'}]
        .map(r=><div className="stat-row-item" key={r.l}><span className="srl-label">{r.l}</span><StatBar val={r.v} max={r.m} color={r.c}/><span className="srl-val">{r.v}{r.u||''}</span></div>)}
    </div>
    <div className="sec-label">SUBMISSIONS</div>
    <div className="stat-row-list">
      <div className="stat-row-item"><span className="srl-label">Sub Attempts / 15 Min</span><StatBar val={g.sub_per15} max={3} color="var(--green)"/><span className="srl-val">{g.sub_per15}</span></div>
    </div>
    <div className="sec-label">GROUND CONTROL</div>
    <div className="stat-row-list">
      {[{l:'Top Position Time %',v:g.top_time_pct,m:100,c:'var(--accent)',u:'%'},{l:'Bottom Position Time %',v:g.bottom_time_pct,m:100,c:'var(--purple)',u:'%'},{l:'Control Time / 15 Min',v:g.ctrl_time_per15,m:8,c:'var(--blue)'}]
        .map(r=><div className="stat-row-item" key={r.l}><span className="srl-label">{r.l}</span><StatBar val={r.v} max={r.m} color={r.c}/><span className="srl-val">{r.v}{r.u||''}</span></div>)}
    </div>
    <div className="sec-label">TRANSITIONS</div>
    <div className="stat-row-list">
      {[{l:'Guard Pass Rate %',v:g.pass_rate,c:'var(--green)',u:'%'},{l:'Reversal Rate %',v:g.reversal_rate,c:'var(--orange)',u:'%'}]
        .map(r=><div className="stat-row-item" key={r.l}><span className="srl-label">{r.l}</span><StatBar val={r.v} max={100} color={r.c}/><span className="srl-val">{r.v}{r.u}</span></div>)}
    </div>
    <div className="sec-label">SUBMISSION WIN BREAKDOWN</div>
    <div className="stat-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
      <div className="stat-cell"><div className="stat-cell-label">SUB WINS</div><div className="stat-cell-val" style={{color:'var(--green)'}}>{fighter.finishes.sub}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">TOTAL WINS</div><div className="stat-cell-val">{fighter.wins}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">SUB WIN RATE</div><div className="stat-cell-val">{fighter.wins > 0 ? Math.round(fighter.finishes.sub / fighter.wins * 100) : 0}%</div></div>
    </div>
  </div>;
}
