import { useState, useMemo } from 'react';
import { EVENTS } from '../data/events';
import { ORG_COLOR } from '../constants/qualifiers';
import { FighterName } from '../components/FighterName';

/** Format an ISO date string as a human-readable event date (e.g. 'Sat, Apr 12, 2026'). */
function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Returns true if the event date is in the past relative to today. */
function isPast(dateStr, today) { return new Date(dateStr) < today; }

/** Returns days until an event date from the given today reference. */
function daysUntil(dateStr, today) {
  return Math.round((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

/** Returns a compact countdown label for an event date. */
function countdown(dateStr, today) {
  const d = daysUntil(dateStr, today);
  if (d < 0) return 'PAST';
  if (d === 0) return 'TODAY';
  if (d === 1) return '1D';
  return d + 'D';
}

/**
 * CalendarScreen — fight calendar screen with sidebar event list and detail view.
 * Automatically selects the first upcoming event on mount. Supports org filtering.
 * Fighter names that exist in the roster are rendered as clickable profile links.
 * @param {function} onBack - callback invoked when the back button is clicked
 * @param {function} onGoFighter - callback invoked with a fighter object to deep-navigate to their profile
 */
export function CalendarScreen({onBack, onGoFighter}) {
  const today = useMemo(()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; },[]);
  const sorted = useMemo(()=>[...EVENTS].sort((a,b)=>new Date(a.date)-new Date(b.date)),[]);
  const firstUpcoming = sorted.find(e=>new Date(e.date)>=today);
  const [selId,setSelId] = useState((firstUpcoming||sorted[0]).id);
  const [orgFilter,setOrgFilter] = useState('ALL');
  const sel = EVENTS.find(e=>e.id===selId);
  const orgs = ['ALL',...new Set(EVENTS.map(e=>e.org))];
  const filtered = sorted.filter(e=>orgFilter==='ALL'||e.org===orgFilter);

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span><span className="topbar-sep">/</span>
        <span className="topbar-section">CALENDAR</span>
        <div className="topbar-right"><button className="topbar-back" onClick={onBack}>← MENU</button></div>
      </div>
      <div className="main-layout">
        <div className="sidebar">
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
                <div key={e.id} className={`sidebar-fighter${sel?.id===e.id?' active':''}${past?' past-event':''}`} onClick={()=>setSelId(e.id)}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                    <span className="sf-name">{e.name}</span>
                    <span className="cal-countdown" style={{color:cdColor}}>{countdown(e.date, today)}</span>
                  </div>
                  <div className="sf-meta">
                    <span className="org-badge" style={{background:ORG_COLOR[e.org]||'#444'}}>{e.org}</span>
                    {' '}{fmtDate(e.date)}
                  </div>
                  <div className="cal-event-main-preview">{e.card.main.f1} vs {e.card.main.f2}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="fighter-area">
          {sel && (
            <div className="anim-fade" style={{display:'flex',flexDirection:'column',height:'100%'}}>
              <div className="cal-event-header">
                <div>
                  <div style={{display:'flex',alignItems:'center'}}>
                    <span className="org-badge" style={{background:ORG_COLOR[sel.org]||'#444'}}>{sel.org}</span>
                    <span className="cal-event-title">{sel.name}</span>
                  </div>
                  <div className="cal-event-meta">{fmtDate(sel.date)} · {sel.venue} · {sel.city}</div>
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
                  <div className="cmb-vs">VS</div>
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
                </div>
                {sel.card.comain.title && <div className="cal-title-banner" style={{marginTop:-1}}>TITLE FIGHT — {sel.card.comain.weight.toUpperCase()} CHAMPIONSHIP</div>}

                {sel.card.prelims.length>0 && <>
                  <div className="sec-label">PRELIMS</div>
                  {sel.card.prelims.map((b,i)=>(
                    <div className="cal-bout" key={i}>
                      <span className="cal-bout-name"><FighterName name={b.f1} onGoFighter={onGoFighter}/></span>
                      <span className="cal-bout-vs">vs</span>
                      <span className="cal-bout-name"><FighterName name={b.f2} onGoFighter={onGoFighter}/></span>
                      <span className="cal-bout-weight">{b.weight.toUpperCase()}</span>
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
