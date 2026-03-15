import { useState, useMemo, Fragment } from 'react';
import { FIGHTERS } from '../data/fighters';
import { ARCH_COLORS } from '../constants/archetypes';
import { COMPARE_ROW_DEFS } from '../constants/compareRows';
import { ChecklistPanel } from '../components/ChecklistPanel';

/**
 * CompareScreen — side-by-side fighter comparison screen.
 * Allows selecting two fighters from dropdowns, renders a stat comparison
 * table with win/lose highlights, and includes the trade checklist panel.
 * @param {function} onBack - callback invoked when the back button is clicked
 */
export function CompareScreen({onBack}) {
  const [fighter1Id, setFighter1Id] = useState('');
  const [fighter2Id, setFighter2Id] = useState('');
  const f1 = FIGHTERS.find(f => f.id === parseInt(fighter1Id));
  const f2 = FIGHTERS.find(f => f.id === parseInt(fighter2Id));
  const clKey=f1&&f2?`${Math.min(f1.id,f2.id)}_${Math.max(f1.id,f2.id)}`:'default';
  const rows=useMemo(()=>f1&&f2?COMPARE_ROW_DEFS.map(def=>def(f1,f2)):[], [f1, f2]);
  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span><span className="topbar-sep">/</span>
        <span className="topbar-section">COMPARE</span>
        <div className="topbar-right"><button className="topbar-back" onClick={onBack}>← MENU</button></div>
      </div>
      <div className="compare-layout">
        <div className="compare-selector">
          <select className="compare-select" value={fighter1Id} onChange={e=>setFighter1Id(e.target.value)}>
            <option value="">— Fighter 1 —</option>
            {FIGHTERS.map(f=><option key={f.id} value={f.id}>{f.name} ({f.record})</option>)}
          </select>
          <span className="vs-text">VS</span>
          <select className="compare-select" value={fighter2Id} onChange={e=>setFighter2Id(e.target.value)}>
            <option value="">— Fighter 2 —</option>
            {FIGHTERS.map(f=><option key={f.id} value={f.id}>{f.name} ({f.record})</option>)}
          </select>
        </div>
        <div className="compare-body">
          <div className="compare-table-wrap">
            {f1&&f2 ? (
              <div className="anim-fade">
                <div style={{display:'grid',gridTemplateColumns:'1fr 80px 1fr',marginBottom:1,gap:1,background:'var(--border)'}}>
                  <div style={{background:'var(--surface)',padding:'12px 16px',borderBottom:'2px solid var(--accent)'}}>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--text-bright)'}}>{f1.name}</div>
                    <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--accent)',marginTop:2}}>{f1.record} · {f1.rank}</div>
                    <div style={{marginTop:6}}><span className="arch-tag" style={{borderColor:ARCH_COLORS[f1.archetype],color:ARCH_COLORS[f1.archetype],fontSize:9}}>{f1.archetype}</span></div>
                  </div>
                  <div style={{background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color:'var(--red)'}}>VS</div>
                  <div style={{background:'var(--surface)',padding:'12px 16px',borderBottom:'2px solid var(--blue)',textAlign:'right'}}>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--text-bright)'}}>{f2.name}</div>
                    <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--blue)',marginTop:2}}>{f2.record} · {f2.rank}</div>
                    <div style={{marginTop:6,display:'flex',justifyContent:'flex-end'}}><span className="arch-tag" style={{borderColor:ARCH_COLORS[f2.archetype],color:ARCH_COLORS[f2.archetype],fontSize:9}}>{f2.archetype}</span></div>
                  </div>
                </div>
                <table className="ctable">
                  <thead><tr><th style={{textAlign:'left',width:'38%'}}>F1</th><th className="center" style={{width:'24%'}}>STAT</th><th style={{textAlign:'right',width:'38%'}}>F2</th></tr></thead>
                  <tbody>{rows.map((r,i)=>{
                    const sc=i===0||rows[i-1].cat!==r.cat;
                    const tie=r.n1===r.n2, f1w=r.higherIsBetter?r.n1>r.n2:r.n1<r.n2;
                    return <Fragment key={i}>
                      {sc&&<tr className="cat-row"><td colSpan={3}>{r.cat}</td></tr>}
                      <tr>
                        <td className={tie?'':f1w?'win':'lose'}>{r.v1}</td>
                        <td className="center">{r.l}</td>
                        <td className={`r ${tie?'':!f1w?'win':'lose'}`}>{r.v2}</td>
                      </tr>
                    </Fragment>;
                  })}</tbody>
                </table>
              </div>
            ) : <div className="empty-state" style={{height:'100%'}}><div style={{fontSize:32,opacity:.2}}>⚔️</div><span>SELECT TWO FIGHTERS TO COMPARE</span></div>}
          </div>
          <div className="checklist-wrap"><ChecklistPanel storageKey={clKey}/></div>
        </div>
      </div>
    </div>
  );
}
