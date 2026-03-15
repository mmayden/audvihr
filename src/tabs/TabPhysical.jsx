import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR } from '../constants/qualifiers';

/**
 * TabPhysical — renders the Physical tab for a fighter profile.
 * Shows physical attributes, training camp, durability flags,
 * and loss method breakdown.
 * @param {object} f - fighter object from FIGHTERS
 */
export function TabPhysical({f}) {
  return <div className="anim-fade">
    <div className="sec-label">PHYSICAL ATTRIBUTES</div>
    <div className="stat-grid">
      {[{l:'AGE',v:f.age+' yrs'},{l:'HEIGHT',v:f.height},{l:'REACH',v:f.reach},{l:'STANCE',v:f.stance},{l:'WEIGHT CLASS',v:f.weight},{l:'COUNTRY',v:f.country}]
        .map(s=><div className="stat-cell" key={s.l}><div className="stat-cell-label">{s.l}</div><div style={{fontSize:14,fontWeight:600,color:'var(--text-bright)',marginTop:4}}>{s.v}</div></div>)}
    </div>
    <div className="sec-label">TRAINING CAMP</div>
    <div className="stat-cell" style={{marginBottom:20}}><div className="stat-cell-label">CAMP / GYM</div><div style={{fontSize:13,color:'var(--text)',marginTop:4}}>{f.camp}</div></div>
    <div className="sec-label">DURABILITY FLAGS</div>
    <div className="stat-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))'}}>
      <div className="stat-cell"><div className="stat-cell-label">CHIN RATING</div><div style={{fontSize:13,fontWeight:600,color:CHIN_COLOR[f.chin]||'var(--text)',marginTop:4}}>{f.chin}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">CARDIO RATING</div><div style={{fontSize:13,fontWeight:600,color:CARDIO_COLOR[f.cardio]||'var(--text)',marginTop:4}}>{f.cardio}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">WEIGHT CUT</div><div style={{fontSize:13,fontWeight:600,color:CUT_COLOR[f.weight_cut]||'var(--text)',marginTop:4}}>{f.weight_cut}</div></div>
    </div>
    <div className="sec-label">LOSS METHOD BREAKDOWN</div>
    <div className="stat-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
      <div className="stat-cell"><div className="stat-cell-label">LOSSES BY KO</div><div className="stat-cell-val" style={{color:f.losses_by.ko>0?'var(--red)':'var(--green)'}}>{f.losses_by.ko}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">LOSSES BY SUB</div><div className="stat-cell-val" style={{color:f.losses_by.sub>0?'var(--red)':'var(--green)'}}>{f.losses_by.sub}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">LOSSES BY DEC</div><div className="stat-cell-val" style={{color:f.losses_by.dec>0?'var(--orange)':'var(--green)'}}>{f.losses_by.dec}</div></div>
    </div>
  </div>;
}
