import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIGHTERS } from '../data/fighters';
import { ARCH_COLORS, MOD_COLORS } from '../constants/archetypes';
import { TABS } from '../constants/checklist';
import { STAT_FILTERS, FILTER_CATEGORIES } from '../constants/statFilters';
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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [weightFilter, setWeightFilter] = useState('ALL');
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [statFiltersOpen, setStatFiltersOpen] = useState(false);
  const [sel, setSel] = useState(initialFighter || FIGHTERS[0]);
  const [tab, setTab] = useState('OVERVIEW');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { items: allNews } = useNews();
  const swipeStartX = useRef(null);
  const swipeStartTime = useRef(null);

  /** Track finger position when swipe begins on the open sidebar. */
  const handleSidebarTouchStart = useCallback((e) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartTime.current = Date.now();
  }, []);

  /**
   * Close sidebar if user swipes left with velocity ≥ 80 px/s
   * OR drag distance ≥ 40% of sidebar width (112 px).
   */
  const handleSidebarTouchEnd = useCallback((e) => {
    if (swipeStartX.current === null) return;
    const dx = swipeStartX.current - e.changedTouches[0].clientX;
    const velocity = (dx / (Date.now() - swipeStartTime.current)) * 1000;
    swipeStartX.current = null;
    swipeStartTime.current = null;
    if (dx > 112 || velocity > 80) setSidebarOpen(false);
  }, []);

  const toggleStatFilter = (id) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const activePredicates = STAT_FILTERS.filter(sf => activeFilters.has(sf.id)).map(sf => sf.predicate);
    return FIGHTERS.filter(f =>
      (f.name.toLowerCase().includes(q) || f.nickname.toLowerCase().includes(q)) &&
      (weightFilter === 'ALL' || f.weight === weightFilter) &&
      activePredicates.every(pred => pred(f))
    );
  }, [search, weightFilter, activeFilters]);
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
          <button
            className="topbar-roster-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close roster' : 'Open roster'}
          >ROSTER</button>
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>
      <div className="main-layout">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} role="button" aria-label="Close roster" tabIndex={-1} />}
        <div
          className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}
          onTouchStart={handleSidebarTouchStart}
          onTouchEnd={handleSidebarTouchEnd}
        >
          <div className="sidebar-header">ROSTER — {filtered.length}</div>
          <div className="sidebar-search"><input className="sidebar-input" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="sidebar-filters">{WEIGHT_FILTERS.map(w=><button key={w} className={`filter-chip ${weightFilter===w?'on':''}`} onClick={()=>setWeightFilter(w)}>{w==='ALL'?'ALL':w.split(' ')[0].toUpperCase()}</button>)}</div>
          <div className="stat-filters-panel">
            <button
              className={`stat-filters-toggle${activeFilters.size > 0 ? ' stat-filters-toggle--active' : ''}`}
              onClick={() => setStatFiltersOpen(o => !o)}
              aria-expanded={statFiltersOpen}
              aria-label="Toggle stat filters"
            >
              <span>STAT FILTERS</span>
              {activeFilters.size > 0 && <span className="stat-filters-count">{activeFilters.size}</span>}
              <span className="stat-filters-caret">{statFiltersOpen ? '▴' : '▾'}</span>
            </button>
            {statFiltersOpen && (
              <div className="stat-filters-body">
                {FILTER_CATEGORIES.map(cat => (
                  <div key={cat} className="stat-filters-group">
                    <div className="stat-filters-cat">{cat}</div>
                    <div className="stat-filters-chips">
                      {STAT_FILTERS.filter(sf => sf.category === cat).map(sf => (
                        <button
                          key={sf.id}
                          className={`stat-filter-chip${activeFilters.has(sf.id) ? ' on' : ''}`}
                          onClick={() => toggleStatFilter(sf.id)}
                          aria-pressed={activeFilters.has(sf.id)}
                        >
                          {sf.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {activeFilters.size > 0 && (
                  <button className="stat-filters-clear" onClick={() => setActiveFilters(new Set())}>
                    CLEAR ALL
                  </button>
                )}
              </div>
            )}
          </div>
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
                  {ac && <span className="arch-badge" style={{borderColor:ac,color:ac}}>{sel.archetype}</span>}
                  {sel.mods.map(m=><span key={m} className="mod-badge" style={{borderColor:MOD_COLORS[m]||'var(--border2)',color:MOD_COLORS[m]||'var(--text-dim)'}}>{m}</span>)}
                </div>
                <button
                  className="vs-btn"
                  onClick={() => navigate('/compare/' + sel.id)}
                  aria-label={`Compare ${sel.name}`}
                >
                  VS. / COMPARE
                </button>
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
