import { useState, useMemo } from 'react';
import { FIGHTERS } from '../data/fighters';
import { ARCH_COLORS, MOD_COLORS } from '../constants/archetypes';
import { TABS } from '../constants/checklist';
import { TabOverview } from '../tabs/TabOverview';
import { TabStriking } from '../tabs/TabStriking';
import { TabGrappling } from '../tabs/TabGrappling';
import { TabPhysical } from '../tabs/TabPhysical';
import { TabHistory } from '../tabs/TabHistory';
import { TabMarket } from '../tabs/TabMarket';
import { useNews } from '../hooks/useNews';

/** Weight class filter options derived from the static FIGHTERS roster. */
const WEIGHT_FILTERS = ['ALL', ...new Set(FIGHTERS.map(f => f.weight))];

/**
 * FighterScreen — full fighter profile screen with sidebar roster list,
 * hero card, and tabbed detail view (Overview, Striking, Grappling,
 * Physical, History, Market).
 * On mobile (< 768 px) the sidebar is hidden by default and can be revealed
 * via the ROSTER button in the topbar; selecting a fighter closes it.
 * @param {function} onBack - callback invoked when the back button is clicked
 * @param {object|null} initialFighter - fighter object to pre-select on mount
 */
export const FighterScreen = ({onBack, initialFighter}) => {
  const [search, setSearch] = useState('');
  const [weightFilter, setWeightFilter] = useState('ALL');
  const [sel, setSel] = useState(initialFighter || FIGHTERS[0]);
  const [tab, setTab] = useState('OVERVIEW');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { items: allNews } = useNews();
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return FIGHTERS.filter(f =>
      (f.name.toLowerCase().includes(q) || f.nickname.toLowerCase().includes(q)) &&
      (weightFilter === 'ALL' || f.weight === weightFilter)
    );
  }, [search, weightFilter]);
  const pick = (f) => { setSel(f); setTab('OVERVIEW'); setSidebarOpen(false); };
  const ac = sel ? ARCH_COLORS[sel.archetype] : null;
  const fighterNews = useMemo(
    () => sel ? allNews.filter(n => n.fighter_id === sel.id).slice(0, 2) : [],
    [allNews, sel]
  );
  /** Derive two-letter initials from a fighter name for the portrait fallback. */
  const initials = sel ? sel.name.split(' ').map(w => w[0]).slice(0, 2).join('') : '';
  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span><span className="topbar-sep">/</span>
        <span className="topbar-section">FIGHTERS</span>
        <div className="topbar-right">
          <button className="topbar-roster-btn" onClick={() => setSidebarOpen(o => !o)}>ROSTER</button>
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>
      <div className="main-layout">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
          <div className="sidebar-header">ROSTER — {filtered.length}</div>
          <div className="sidebar-search"><input className="sidebar-input" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="sidebar-filters">{WEIGHT_FILTERS.map(w=><button key={w} className={`filter-chip ${weightFilter===w?'on':''}`} onClick={()=>setWeightFilter(w)}>{w==='ALL'?'ALL':w.split(' ')[0].toUpperCase()}</button>)}</div>
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
              <div className="card-portrait">
                {sel.portrait
                  ? <img src={`/assets/portraits/${sel.portrait}`} alt={sel.name} className="portrait-img" />
                  : <span className="portrait-initials">{initials}</span>
                }
              </div>
              <div className="card-identity">
                <div className="fighter-name-big">{sel.name}</div>
                <div className="fighter-nickname">&ldquo;{sel.nickname}&rdquo;</div>
                <div className="identity-row">
                  <span className={`id-pill ${sel.rank==='CHAMPION'?'champ':'rank'}`}>{sel.rank}</span>
                  <span className="id-pill">{sel.weight}</span>
                  <span className="id-pill">{sel.org}</span>
                  <span className="id-pill">{sel.stance}</span>
                  <span className="id-pill">{sel.country}</span>
                </div>
                <div className="archetype-row">
                  {ac && <span className="arch-tag" style={{borderColor:ac,color:ac}}>{sel.archetype}</span>}
                  {sel.mods.map(m=><span key={m} className="arch-tag" style={{borderColor:MOD_COLORS[m]||'var(--border2)',color:MOD_COLORS[m]||'var(--text-dim)',opacity:.8}}>{m}</span>)}
                </div>
              </div>
              <div className="card-record">
                <div className="record-big">{sel.record}</div>
                <div className="record-breakdown">
                  <div className="rb"><div className="rb-n rb-n--win">{sel.wins}</div><div className="rb-l">W</div></div>
                  <div className="rb"><div className="rb-n rb-n--loss">{sel.losses}</div><div className="rb-l">L</div></div>
                  <div className="rb"><div className="rb-n">{sel.streak}</div><div className="rb-l">STRK</div></div>
                </div>
                <div className="finish-row">
                  <div className="fin-chip"><div className="fin-n fin-n--ko">{sel.finishes.ko}</div><div className="fin-l">KO</div></div>
                  <div className="fin-chip"><div className="fin-n fin-n--sub">{sel.finishes.sub}</div><div className="fin-l">SUB</div></div>
                  <div className="fin-chip"><div className="fin-n fin-n--dec">{sel.finishes.dec}</div><div className="fin-l">DEC</div></div>
                </div>
              </div>
            </div>
            <div className="tabs-bar">{TABS.map(t=><button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t}</button>)}</div>
            <div className="tab-content">
              {tab==='OVERVIEW'  && <TabOverview  fighter={sel} newsItems={fighterNews}/>}
              {tab==='STRIKING'  && <TabStriking  fighter={sel}/>}
              {tab==='GRAPPLING' && <TabGrappling fighter={sel}/>}
              {tab==='PHYSICAL'  && <TabPhysical  fighter={sel}/>}
              {tab==='HISTORY'   && <TabHistory   fighter={sel}/>}
              {tab==='MARKET'    && <TabMarket    fighter={sel}/>}
            </div>
          </div>
        ) : <div className="empty-state"><div className="empty-state-icon">👊</div><span>SELECT A FIGHTER</span></div>}
      </div>
    </div>
  );
}
