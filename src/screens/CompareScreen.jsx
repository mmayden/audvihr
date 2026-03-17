import { useState, useMemo, useCallback, Fragment } from 'react';
import { FIGHTERS } from '../data/fighters';
import { ARCH_COLORS } from '../constants/archetypes';
import { COMPARE_ROW_DEFS } from '../constants/compareRows';
import { CHECKLIST } from '../constants/checklist';
import { ChecklistPanel } from '../components/ChecklistPanel';
import { mlToImplied } from '../utils/odds';
import { checklistToMarkdown, downloadBlob } from '../utils/export';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ── Edge signal helpers ──────────────────────────────────────────────────────

/** Modifier tags that represent betting-relevant risks. */
const NEGATIVE_MODS = new Set([
  'DURABILITY RISK', 'CARDIO CONCERN', 'WEIGHT CUT FLAG',
  'FRONT-RUNNER', 'STEP-UP CONCERN',
]);

/** Modifier tags that suggest underpricing. */
const POSITIVE_MODS = new Set(['LATE BLOOMER']);

/**
 * Known archetype matchup edges: [attacker archetype, defender archetype, research note].
 * Directional — applies when f1 is attacker and f2 is defender, or vice versa.
 */
const ARCH_EDGES = [
  ['WRESTLER',         'COUNTER STRIKER', 'wrestling controls distance — counter timing disrupted'],
  ['WRESTLER',         'KICKBOXER',       'takedowns neutralize striking range advantage'],
  ['PRESSURE FIGHTER', 'COUNTER STRIKER', 'forward pressure disrupts counter-punching rhythm'],
  ['PRESSURE FIGHTER', 'KICKBOXER',       'inside pressure limits long-range kicking game'],
  ['BJJ / SUB HUNTER', 'WRESTLER',        'guard danger neutralizes single-leg attacks'],
];

/**
 * Compute edge signals from two fighter objects and their compare rows.
 * Returns an array of { type, label, text } objects — research prompts only.
 * @param {object} f1
 * @param {object} f2
 * @param {Array}  rows - computed COMPARE_ROW_DEFS output
 * @returns {Array<{ type: string, text: string }>}
 */
function computeEdgeSignals(f1, f2, rows) {
  const signals = [];

  // 1. Stat row score — count contested rows (exclude ties)
  let f1Wins = 0, f2Wins = 0;
  for (const r of rows) {
    if (r.n1 === r.n2) continue;
    if (r.higherIsBetter ? r.n1 > r.n2 : r.n1 < r.n2) f1Wins++;
    else f2Wins++;
  }
  const total = f1Wins + f2Wins;
  if (total > 0) {
    const pct = f1Wins / total;
    const edge = pct >= 0.65 ? 'CLEAR STAT EDGE' : pct >= 0.55 ? 'SLIGHT STAT EDGE' : pct <= 0.35 ? 'CLEAR STAT EDGE' : pct <= 0.45 ? 'SLIGHT STAT EDGE' : null;
    const leader = pct >= 0.55 ? 'F1' : pct <= 0.45 ? 'F2' : null;
    signals.push({
      type: 'stat',
      text: leader
        ? `Stats: ${leader} wins ${leader === 'F1' ? f1Wins : f2Wins}/${total} contested rows — ${edge}`
        : `Stats: Even across ${total} contested rows — no clear stat edge`,
    });
  }

  // 2. Archetype matchup
  for (const [atk, def, note] of ARCH_EDGES) {
    if (f1.archetype === atk && f2.archetype === def) {
      signals.push({ type: 'archetype', text: `Archetype: F1 (${atk}) vs F2 (${def}) — ${note}` });
    } else if (f2.archetype === atk && f1.archetype === def) {
      signals.push({ type: 'archetype', text: `Archetype: F2 (${atk}) vs F1 (${def}) — ${note}` });
    }
  }

  // 3. Modifier flags
  const f1NegMods = (f1.mods || []).filter(m => NEGATIVE_MODS.has(m));
  const f2NegMods = (f2.mods || []).filter(m => NEGATIVE_MODS.has(m));
  const f1PosMods = (f1.mods || []).filter(m => POSITIVE_MODS.has(m));
  const f2PosMods = (f2.mods || []).filter(m => POSITIVE_MODS.has(m));
  if (f1NegMods.length || f2NegMods.length || f1PosMods.length || f2PosMods.length) {
    const parts = [];
    if (f1NegMods.length) parts.push(`F1 red flags: ${f1NegMods.join(', ')}`);
    if (f2NegMods.length) parts.push(`F2 red flags: ${f2NegMods.join(', ')}`);
    if (f1PosMods.length) parts.push(`F1 upside: ${f1PosMods.join(', ')}`);
    if (f2PosMods.length) parts.push(`F2 upside: ${f2PosMods.join(', ')}`);
    signals.push({ type: 'flags', text: `Flags: ${parts.join(' · ')}` });
  }

  // 4. Market discrepancy (only when both fighters have ml_current set)
  const imp1 = parseFloat(mlToImplied(f1.market?.ml_current));
  const imp2 = parseFloat(mlToImplied(f2.market?.ml_current));
  if (!isNaN(imp1) && !isNaN(imp2) && total > 0) {
    const mktF1Pct  = imp1 / (imp1 + imp2);
    const statF1Pct = f1Wins / total;
    const delta = Math.abs(mktF1Pct - statF1Pct);
    if (delta >= 0.15) {
      const mktFav  = mktF1Pct  > 0.55 ? 'F1' : mktF1Pct  < 0.45 ? 'F2' : null;
      const statFav = statF1Pct > 0.55 ? 'F1' : statF1Pct < 0.45 ? 'F2' : null;
      const desc = (mktFav && statFav && mktFav !== statFav)
        ? `market favors ${mktFav} but stat rows favor ${statFav}`
        : `${Math.round(delta * 100)}pt gap between market implied% and stat-row share`;
      signals.push({ type: 'market', text: `Market: ${desc} — DISCREPANCY worth researching` });
    }
  }

  return signals;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * CompareScreen — side-by-side fighter comparison screen.
 * Allows selecting two fighters from dropdowns, renders a stat comparison
 * table with win/lose highlights, an edge-signal research panel, and the
 * trade checklist.
 *
 * When opened via a shareable URL (/compare/:f1id/:f2id), App passes
 * initialF1Id and initialF2Id so the fighters are pre-selected.
 *
 * @param {function} onBack       - callback invoked when the back button is clicked
 * @param {string}   [initialF1Id] - pre-select fighter 1 by ID string (from URL param)
 * @param {string}   [initialF2Id] - pre-select fighter 2 by ID string (from URL param)
 */
export const CompareScreen = ({ onBack, initialF1Id = '', initialF2Id = '' }) => {
  const [fighter1Id, setFighter1Id] = useState(initialF1Id);
  const [fighter2Id, setFighter2Id] = useState(initialF2Id);
  const [copyLabel, setCopyLabel]   = useState('COPY LINK');

  const f1 = FIGHTERS.find(f => f.id === parseInt(fighter1Id));
  const f2 = FIGHTERS.find(f => f.id === parseInt(fighter2Id));

  const clKey = f1 && f2
    ? `cl_${Math.min(f1.id, f2.id)}_${Math.max(f1.id, f2.id)}`
    : 'cl_default';

  // Read checklist state for the current matchup (needed for MD export)
  const initChecked = useMemo(
    () => Object.fromEntries(CHECKLIST.map(i => [i.id, false])),
    []
  );
  const [checked] = useLocalStorage(clKey, initChecked);

  const rows    = useMemo(() => f1 && f2 ? COMPARE_ROW_DEFS.map(def => def(f1, f2)) : [], [f1, f2]);
  const signals = useMemo(() => f1 && f2 ? computeEdgeSignals(f1, f2, rows) : [], [f1, f2, rows]);

  /** Copy shareable /compare/:f1id/:f2id URL to clipboard (user-initiated only). */
  const handleCopyLink = useCallback(() => {
    if (!f1 || !f2) return;
    const url = window.location.origin + '/compare/' + f1.id + '/' + f2.id;
    navigator.clipboard.writeText(url).then(() => {
      setCopyLabel('COPIED!');
      setTimeout(() => setCopyLabel('COPY LINK'), 2000);
    }).catch(() => {
      setCopyLabel('FAILED');
      setTimeout(() => setCopyLabel('COPY LINK'), 2000);
    });
  }, [f1, f2]);

  /** Download checklist + edge signals as a Markdown file. */
  const handleExportMd = useCallback(() => {
    if (!f1 || !f2) return;
    const md = checklistToMarkdown(f1, f2, checked, CHECKLIST, signals);
    const slug = `${f1.name.split(' ').pop()}_vs_${f2.name.split(' ').pop()}`.toLowerCase();
    downloadBlob(md, `audwihr_${slug}.md`, 'text/plain');
  }, [f1, f2, checked, signals]);

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span><span className="topbar-sep">/</span>
        <span className="topbar-section">COMPARE</span>
        <div className="topbar-right">
          {f1 && f2 && (
            <>
              <button className="topbar-back topbar-back--mr" onClick={handleExportMd}>↓ MD</button>
              <button className="topbar-back topbar-back--mr" onClick={handleCopyLink}>{copyLabel}</button>
            </>
          )}
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>
      <div className="compare-layout">
        <div className="compare-selector">
          <select className="compare-select" value={fighter1Id} onChange={e => setFighter1Id(e.target.value)}>
            <option value="">— Fighter 1 —</option>
            {FIGHTERS.map(f => <option key={f.id} value={f.id}>{f.name} ({f.record})</option>)}
          </select>
          <span className="vs-text">VS</span>
          <select className="compare-select" value={fighter2Id} onChange={e => setFighter2Id(e.target.value)}>
            <option value="">— Fighter 2 —</option>
            {FIGHTERS.map(f => <option key={f.id} value={f.id}>{f.name} ({f.record})</option>)}
          </select>
        </div>
        <div className="compare-body">
          <div className="compare-table-wrap">
            {f1 && f2 ? (
              <div className="anim-fade">
                <div className="compare-fighter-header">
                  <div className="compare-fighter-col">
                    <div className="compare-fighter-name">{f1.name}</div>
                    <div className="compare-fighter-record compare-fighter-record--f1">{f1.record} · {f1.rank}</div>
                    <div className="compare-fighter-arch"><span className="arch-tag arch-tag--sm" style={{borderColor:ARCH_COLORS[f1.archetype],color:ARCH_COLORS[f1.archetype]}}>{f1.archetype}</span></div>
                  </div>
                  <div className="compare-vs-col">VS</div>
                  <div className="compare-fighter-col compare-fighter-col--right">
                    <div className="compare-fighter-name">{f2.name}</div>
                    <div className="compare-fighter-record compare-fighter-record--f2">{f2.record} · {f2.rank}</div>
                    <div className="compare-fighter-arch compare-fighter-arch--right"><span className="arch-tag arch-tag--sm" style={{borderColor:ARCH_COLORS[f2.archetype],color:ARCH_COLORS[f2.archetype]}}>{f2.archetype}</span></div>
                  </div>
                </div>
                <table className="ctable">
                  <thead><tr><th className="ctable-col--wide" style={{textAlign:'left'}}>F1</th><th className="center ctable-col--center">STAT</th><th className="ctable-col--wide" style={{textAlign:'right'}}>F2</th></tr></thead>
                  <tbody>{rows.map((r, i) => {
                    const sc = i === 0 || rows[i-1].cat !== r.cat;
                    const tie = r.n1 === r.n2, f1w = r.higherIsBetter ? r.n1 > r.n2 : r.n1 < r.n2;
                    return <Fragment key={i}>
                      {sc && <tr className="cat-row"><td colSpan={3}>{r.cat}</td></tr>}
                      <tr>
                        <td className={tie ? '' : f1w ? 'win' : 'lose'}>{r.v1}</td>
                        <td className="center">{r.l}</td>
                        <td className={`r ${tie ? '' : !f1w ? 'win' : 'lose'}`}>{r.v2}</td>
                      </tr>
                    </Fragment>;
                  })}</tbody>
                </table>
                {signals.length > 0 && (
                  <div className="edge-signals">
                    <div className="edge-signals-header">
                      EDGE SIGNALS
                      <span className="edge-signals-disclaimer">RESEARCH PROMPT — NOT A PICK</span>
                    </div>
                    {signals.map((s, i) => (
                      <div key={i} className={`edge-signal edge-signal-${s.type}`}>• {s.text}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : <div className="empty-state empty-state--fill"><div className="empty-state-icon">⚔️</div><span>SELECT TWO FIGHTERS TO COMPARE</span></div>}
          </div>
          <div className="checklist-wrap"><ChecklistPanel storageKey={f1 && f2 ? `${Math.min(f1.id,f2.id)}_${Math.max(f1.id,f2.id)}` : 'default'}/></div>
        </div>
      </div>
    </div>
  );
};
