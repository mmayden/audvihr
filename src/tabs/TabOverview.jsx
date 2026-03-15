import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR } from '../constants/qualifiers';

/**
 * TabOverview — renders the Overview tab for a fighter profile.
 * Shows key numbers (streak, finish rate, method breakdown, striking/grappling
 * highlights), qualitative flags (chin, cardio, weight cut), and trader notes.
 * @param {object} fighter - fighter object from FIGHTERS
 */
export function TabOverview({ fighter }) {
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
    <div className="stat-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))'}}>
      <div className="stat-cell"><div className="stat-cell-label">CHIN</div><div style={{fontSize:13,fontWeight:600,color:CHIN_COLOR[fighter.chin]||'var(--text)',marginTop:4}}>{fighter.chin}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">CARDIO</div><div style={{fontSize:13,fontWeight:600,color:CARDIO_COLOR[fighter.cardio]||'var(--text)',marginTop:4}}>{fighter.cardio}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">WEIGHT CUT</div><div style={{fontSize:13,fontWeight:600,color:CUT_COLOR[fighter.weight_cut]||'var(--text)',marginTop:4}}>{fighter.weight_cut}</div></div>
    </div>
    <div className="sec-label">TRADER NOTES</div>
    <div style={{background:'var(--surface)',padding:'14px',fontSize:'13px',lineHeight:1.7,color:'var(--text)',borderLeft:'2px solid var(--accent-dim)'}}>{fighter.trader_notes}</div>
  </div>;
}
