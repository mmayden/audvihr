import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR } from '../constants/qualifiers';

/**
 * TabOverview — renders the Overview tab for a fighter profile.
 * Shows key numbers (streak, finish rate, method breakdown, striking/grappling
 * highlights), qualitative flags (chin, cardio, weight cut), and trader notes.
 * @param {object} f - fighter object from FIGHTERS
 */
export function TabOverview({f}) {
  return <div className="anim-fade">
    <div className="sec-label">KEY NUMBERS</div>
    <div className="stat-grid">
      {[
        {l:'WIN STREAK',   v:f.streak,         s:`${f.streakType} streak`},
        {l:'FINISH RATE',  v:f.finish_rate+'%', s:'non-decision wins'},
        {l:'KO WINS',      v:f.finishes.ko,     s:'by KO/TKO'},
        {l:'SUB WINS',     v:f.finishes.sub,    s:'by submission'},
        {l:'DEC WINS',     v:f.finishes.dec,    s:'by decision'},
        {l:'STR / MIN',    v:f.striking.slpm,   s:'sig strikes landed'},
        {l:'STR ABS / MIN',v:f.striking.sapm,   s:'sig strikes absorbed'},
        {l:'TD DEFENSE %', v:f.grappling.td_def+'%', s:'takedown defense'},
      ].map(s=><div className="stat-cell" key={s.l}><div className="stat-cell-label">{s.l}</div><div className="stat-cell-val">{s.v}</div><div className="stat-cell-sub">{s.s}</div></div>)}
    </div>
    <div className="sec-label">FLAGS</div>
    <div className="stat-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))'}}>
      <div className="stat-cell"><div className="stat-cell-label">CHIN</div><div style={{fontSize:13,fontWeight:600,color:CHIN_COLOR[f.chin]||'var(--text)',marginTop:4}}>{f.chin}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">CARDIO</div><div style={{fontSize:13,fontWeight:600,color:CARDIO_COLOR[f.cardio]||'var(--text)',marginTop:4}}>{f.cardio}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">WEIGHT CUT</div><div style={{fontSize:13,fontWeight:600,color:CUT_COLOR[f.weight_cut]||'var(--text)',marginTop:4}}>{f.weight_cut}</div></div>
    </div>
    <div className="sec-label">TRADER NOTES</div>
    <div style={{background:'var(--surface)',padding:'14px',fontSize:'13px',lineHeight:1.7,color:'var(--text)',borderLeft:'2px solid var(--accent-dim)'}}>{f.trader_notes}</div>
  </div>;
}
