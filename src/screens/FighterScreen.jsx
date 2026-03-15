import { useState, useMemo } from 'react';
import { FIGHTERS } from '../data/fighters';
import { ARCH_COLORS, MOD_COLORS } from '../constants/archetypes';
import { TABS } from '../constants/checklist';
import { StatBar } from '../components/StatBar';
import { TabOverview } from '../tabs/TabOverview';
import { TabStriking } from '../tabs/TabStriking';
import { TabGrappling } from '../tabs/TabGrappling';
import { TabPhysical } from '../tabs/TabPhysical';
import { TabHistory } from '../tabs/TabHistory';
import { TabMarket } from '../tabs/TabMarket';

/**
 * FighterScreen — full fighter profile screen with sidebar roster list,
 * hero card, and tabbed detail view (Overview, Striking, Grappling,
 * Physical, History, Market).
 * @param {function} onBack - callback invoked when the back button is clicked
 * @param {object|null} initialFighter - fighter object to pre-select on mount
 */
export function FighterScreen({onBack, initialFighter}) {
  const [search,setSearch]=useState('');
  const [wf,setWf]=useState('ALL');
  const [sel,setSel]=useState(initialFighter||FIGHTERS[0]);
  const [tab,setTab]=useState('OVERVIEW');
  const weights=['ALL',...new Set(FIGHTERS.map(f=>f.weight))];
  const filtered=useMemo(()=>FIGHTERS.filter(f=>{
    const s=search.toLowerCase();
    return (f.name.toLowerCase().includes(s)||f.nickname.toLowerCase().includes(s))&&(wf==='ALL'||f.weight===wf);
  }),[search,wf]);
  function pick(f){setSel(f);setTab('OVERVIEW');}
  const ac = sel ? ARCH_COLORS[sel.archetype] : null;
  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span><span className="topbar-sep">/</span>
        <span className="topbar-section">FIGHTERS</span>
        <div className="topbar-right"><button className="topbar-back" onClick={onBack}>← MENU</button></div>
      </div>
      <div className="main-layout">
        <div className="sidebar">
          <div className="sidebar-header">ROSTER — {filtered.length}</div>
          <div className="sidebar-search"><input className="sidebar-input" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="sidebar-filters">{weights.map(w=><button key={w} className={`filter-chip ${wf===w?'on':''}`} onClick={()=>setWf(w)}>{w==='ALL'?'ALL':w.split(' ')[0].toUpperCase()}</button>)}</div>
          <div className="sidebar-list">{filtered.map(f=>(
            <div key={f.id} className={`sidebar-fighter ${sel?.id===f.id?'active':''}`} onClick={()=>pick(f)}>
              <div className="sf-name">{f.name}</div>
              <div className="sf-meta"><span className="sf-record">{f.record}</span> · {f.weight} · {f.rank}</div>
            </div>
          ))}</div>
        </div>
        {sel ? (
          <div className="fighter-area">
            <div className="card-hero">
              <div className="card-portrait"><span className="portrait-placeholder">🥊</span></div>
              <div className="card-identity">
                <div className="fighter-name-big">{sel.name}</div>
                <div className="fighter-nickname">"{sel.nickname}"</div>
                <div className="identity-row">
                  <span className={`id-pill ${sel.rank==='CHAMPION'?'champ':'rank'}`}>{sel.rank}</span>
                  <span className="id-pill">{sel.weight}</span>
                  <span className="id-pill">{sel.org}</span>
                  <span className="id-pill">{sel.stance}</span>
                  <span className="id-pill">{sel.country}</span>
                </div>
                <div className="archetype-row">
                  {ac && <span className="arch-tag" style={{borderColor:ac,color:ac}}>{sel.archetype}</span>}
                  {sel.mods.map(m=><span key={m} className="arch-tag" style={{borderColor:MOD_COLORS[m]||'#555',color:MOD_COLORS[m]||'#555',opacity:.8}}>{m}</span>)}
                </div>
              </div>
              <div className="card-record">
                <div className="record-big">{sel.record}</div>
                <div className="record-breakdown">
                  <div className="rb"><div className="rb-n" style={{color:'var(--green)'}}>{sel.wins}</div><div className="rb-l">W</div></div>
                  <div className="rb"><div className="rb-n" style={{color:'var(--red)'}}>{sel.losses}</div><div className="rb-l">L</div></div>
                  <div className="rb"><div className="rb-n">{sel.streak}</div><div className="rb-l">STRK</div></div>
                </div>
                <div className="finish-row">
                  <div className="fin-chip"><div className="fin-n" style={{color:'var(--red)'}}>{sel.finishes.ko}</div><div className="fin-l">KO</div></div>
                  <div className="fin-chip"><div className="fin-n" style={{color:'var(--green)'}}>{sel.finishes.sub}</div><div className="fin-l">SUB</div></div>
                  <div className="fin-chip"><div className="fin-n" style={{color:'var(--text-dim)'}}>{sel.finishes.dec}</div><div className="fin-l">DEC</div></div>
                </div>
              </div>
            </div>
            <div className="tabs-bar">{TABS.map(t=><button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t}</button>)}</div>
            <div className="tab-content">
              {tab==='OVERVIEW'  && <TabOverview  f={sel}/>}
              {tab==='STRIKING'  && <TabStriking  f={sel}/>}
              {tab==='GRAPPLING' && <TabGrappling f={sel}/>}
              {tab==='PHYSICAL'  && <TabPhysical  f={sel}/>}
              {tab==='HISTORY'   && <TabHistory   f={sel}/>}
              {tab==='MARKET'    && <TabMarket    f={sel}/>}
            </div>
          </div>
        ) : <div className="empty-state"><div style={{fontSize:32,opacity:.2}}>👊</div><span>SELECT A FIGHTER</span></div>}
      </div>
    </div>
  );
}
