import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVENTS } from '../data/events';
import { FIGHTERS } from '../data/fighters';
import { ORG_COLOR } from '../constants/qualifiers';
import { FighterName } from '../components/FighterName';
import { daysUntil, isPast, formatEventDate, countdown } from '../utils/date';
import { findFighterByName } from '../utils/fighters';


/**
 * CalendarScreen — fight calendar screen with sidebar event list and detail view.
 * Automatically selects the first upcoming event on mount. Supports org filtering.
 * Fighter names that exist in the roster are rendered as clickable profile links.
 * On mobile (< 768 px) the sidebar is hidden by default and revealed via the
 * EVENTS button in the topbar; selecting an event closes it.
 * @param {function} onBack - callback invoked when the back button is clicked
 * @param {function} onGoFighter - callback invoked with a fighter object to deep-navigate to their profile
 */
/**
 * Navigate to /compare/:f1id/:f2id if both fighters are in the roster.
 * Returns null when either fighter cannot be matched.
 */
function useCompareNav() {
  const navigate = useNavigate();
  return (f1Name, f2Name) => {
    const f1 = findFighterByName(f1Name, FIGHTERS);
    const f2 = findFighterByName(f2Name, FIGHTERS);
    if (f1 && f2) navigate(`/compare/${f1.id}/${f2.id}`);
  };
}

export const CalendarScreen = ({onBack, onGoFighter}) => {
  const goCompare = useCompareNav();
  const today = useMemo(()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; },[]);
  const sorted = useMemo(()=>[...EVENTS].sort((a,b)=>new Date(a.date)-new Date(b.date)),[]);
  const firstUpcoming = sorted.find(e=>new Date(e.date)>=today);
  const [selId,setSelId] = useState((firstUpcoming||sorted[0]).id);
  const [orgFilter,setOrgFilter] = useState('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sel = EVENTS.find(e=>e.id===selId);
  const orgs = ['ALL',...new Set(EVENTS.map(e=>e.org))];
  const filtered = sorted.filter(e=>orgFilter==='ALL'||e.org===orgFilter);
  const pickEvent = (id) => { setSelId(id); setSidebarOpen(false); };

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span><span className="topbar-sep">/</span>
        <span className="topbar-section">CALENDAR</span>
        <div className="topbar-right">
          <button
            className="topbar-roster-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close events list' : 'Open events list'}
          >EVENTS</button>
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>
      <div className="main-layout">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} role="button" aria-label="Close events list" tabIndex={-1} />}
        <div className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
          <div className="sidebar-header">EVENTS — {filtered.length}</div>
          <div className="sidebar-filters">
            {orgs.map(o=><button key={o} className={`filter-chip ${orgFilter===o?'on':''}`} onClick={()=>setOrgFilter(o)}>{o}</button>)}
          </div>
          <div className="sidebar-list">
            {filtered.map(e=>{
              const past=isPast(e.date, today);
              const d=daysUntil(e.date, today);
              const cdColor=past?'var(--text-dim)':d<=7?'var(--accent)':'var(--green)';
              return (
                <div key={e.id} className={`sidebar-fighter${sel?.id===e.id?' active':''}${past?' past-event':''}`} onClick={()=>pickEvent(e.id)}>
                  <div className="cal-sidebar-event-row">
                    <span className="sf-name">{e.name}</span>
                    <span className="cal-countdown" style={{color:cdColor}}>{countdown(e.date, today)}</span>
                  </div>
                  <div className="sf-meta">
                    <span className="org-badge" style={{background:ORG_COLOR[e.org]||'var(--border2)'}}>{e.org}</span>
                    {' '}{formatEventDate(e.date)}
                  </div>
                  <div className="cal-event-main-preview">{e.card.main.f1} vs {e.card.main.f2}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="fighter-area">
          {sel && (
            <div className="anim-fade cal-event-detail">
              <div className="cal-event-header">
                <div>
                  <div className="cal-event-org-row">
                    <span className="org-badge" style={{background:ORG_COLOR[sel.org]||'var(--border2)'}}>{sel.org}</span>
                    <span className="cal-event-title">{sel.name}</span>
                  </div>
                  <div className="cal-event-meta">{formatEventDate(sel.date)} · {sel.venue} · {sel.city}</div>
                </div>
                <div>
                  <div className="cal-countdown-big" style={{color:isPast(sel.date,today)?'var(--text-dim)':daysUntil(sel.date,today)<=7?'var(--accent)':'var(--green)'}}>{countdown(sel.date,today)}</div>
                  <div className="cal-countdown-label">{isPast(sel.date,today)?'COMPLETED':'DAYS UNTIL EVENT'}</div>
                </div>
              </div>

              <div className="tab-content">
                <div className="sec-label">MAIN EVENT{sel.card.main.title?' — TITLE FIGHT':''}</div>
                <div className="cal-main-bout">
                  <div className="cmb-side">
                    <div className="cmb-fighter-name"><FighterName name={sel.card.main.f1} onGoFighter={onGoFighter}/></div>
                    <div className="cmb-weight-tag">{sel.card.main.weight.toUpperCase()}</div>
                  </div>
                  <div className="cmb-vs">
                    VS
                    {findFighterByName(sel.card.main.f1, FIGHTERS) && findFighterByName(sel.card.main.f2, FIGHTERS) && (
                      <button className="cal-compare-btn" style={{marginTop:8}} onClick={() => goCompare(sel.card.main.f1, sel.card.main.f2)} aria-label={`Compare ${sel.card.main.f1} vs ${sel.card.main.f2}`}>COMPARE</button>
                    )}
                  </div>
                  <div className="cmb-side right">
                    <div className="cmb-fighter-name"><FighterName name={sel.card.main.f2} onGoFighter={onGoFighter}/></div>
                    <div className="cmb-weight-tag">{sel.card.main.weight.toUpperCase()}</div>
                  </div>
                </div>
                {sel.card.main.title && <div className="cal-title-banner">TITLE FIGHT — {sel.card.main.weight.toUpperCase()} CHAMPIONSHIP</div>}

                <div className="sec-label">CO-MAIN EVENT{sel.card.comain.title?' — TITLE FIGHT':''}</div>
                <div className="cal-bout">
                  <span className="cal-bout-name"><FighterName name={sel.card.comain.f1} onGoFighter={onGoFighter}/></span>
                  <span className="cal-bout-vs">vs</span>
                  <span className="cal-bout-name"><FighterName name={sel.card.comain.f2} onGoFighter={onGoFighter}/></span>
                  <span className="cal-bout-weight">{sel.card.comain.weight.toUpperCase()}</span>
                  {findFighterByName(sel.card.comain.f1, FIGHTERS) && findFighterByName(sel.card.comain.f2, FIGHTERS) && (
                    <button className="cal-compare-btn" onClick={() => goCompare(sel.card.comain.f1, sel.card.comain.f2)} aria-label={`Compare ${sel.card.comain.f1} vs ${sel.card.comain.f2}`}>COMPARE</button>
                  )}
                </div>
                {sel.card.comain.title && <div className="cal-title-banner cal-title-banner--comain">TITLE FIGHT — {sel.card.comain.weight.toUpperCase()} CHAMPIONSHIP</div>}

                {sel.card.prelims.length>0 && <>
                  <div className="sec-label">PRELIMS</div>
                  {sel.card.prelims.map((b,i)=>(
                    <div className="cal-bout" key={i}>
                      <span className="cal-bout-name"><FighterName name={b.f1} onGoFighter={onGoFighter}/></span>
                      <span className="cal-bout-vs">vs</span>
                      <span className="cal-bout-name"><FighterName name={b.f2} onGoFighter={onGoFighter}/></span>
                      <span className="cal-bout-weight">{b.weight.toUpperCase()}</span>
                      {findFighterByName(b.f1, FIGHTERS) && findFighterByName(b.f2, FIGHTERS) && (
                        <button className="cal-compare-btn" onClick={() => goCompare(b.f1, b.f2)} aria-label={`Compare ${b.f1} vs ${b.f2}`}>COMPARE</button>
                      )}
                    </div>
                  ))}
                </>}

                {sel.card.early_prelims.length>0 && <>
                  <div className="sec-label">EARLY PRELIMS</div>
                  {sel.card.early_prelims.map((b,i)=>(
                    <div className="cal-bout" key={i}>
                      <span className="cal-bout-name"><FighterName name={b.f1} onGoFighter={onGoFighter}/></span>
                      <span className="cal-bout-vs">vs</span>
                      <span className="cal-bout-name"><FighterName name={b.f2} onGoFighter={onGoFighter}/></span>
                      <span className="cal-bout-weight">{b.weight.toUpperCase()}</span>
                      {findFighterByName(b.f1, FIGHTERS) && findFighterByName(b.f2, FIGHTERS) && (
                        <button className="cal-compare-btn" onClick={() => goCompare(b.f1, b.f2)} aria-label={`Compare ${b.f1} vs ${b.f2}`}>COMPARE</button>
                      )}
                    </div>
                  ))}
                </>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
