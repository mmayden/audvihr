import { useState, useMemo, useEffect, useCallback } from 'react';
import { MARKETS } from '../data/markets';
import { EVENTS } from '../data/events';
import { useWatchlist } from '../hooks/useWatchlist';
import { useOdds } from '../hooks/useOdds';
import { usePolymarket } from '../hooks/usePolymarket';
import { useKalshi } from '../hooks/useKalshi';
import { useAlerts } from '../hooks/useAlerts';
import { mlToImplied } from '../utils/odds';
import { fightKey } from '../utils/normalizeOdds';
import { daysUntil, countdown } from '../utils/date';
import { readCLVLog, readOpeningLines } from '../utils/clv';
import { clvLogToCsv, downloadBlob } from '../utils/export';
import { readPickLog, appendPick, updatePickOutcome } from '../utils/pickLog';
import { PriceChart } from '../components/PriceChart';

// Build a static fightKey → tapology_pct lookup from generated events data.
// tapology_pct is optional per fight; present only after build-time scrape runs.
const tapologyByKey = (() => {
  const map = {};
  EVENTS.forEach((ev) => {
    const bouts = [ev.card.main, ev.card.comain, ...(ev.card.prelims || []), ...(ev.card.early_prelims || [])].filter(Boolean);
    bouts.forEach((bout) => {
      if (bout.tapology_pct) map[fightKey(bout.f1, bout.f2)] = bout.tapology_pct;
    });
  });
  return map;
})();

const SORT_LABELS = ['CLOSING', 'VOLUME', 'EVENT'];
const PLATFORMS   = ['ALL', 'Polymarket', 'Kalshi', 'Novig'];
/** Format USD volume as compact string. */
function fmtVolume(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

/** Sum all mock platform volumes for a market. */
function totalVolume(market) {
  return market.platforms.reduce((acc, p) => acc + p.volume, 0);
}

/**
 * Compute cross-platform arbitrage across all available price sources.
 * Accepts an array of { f1Implied, f2Implied, source } objects.
 */
function computeArb(sources) {
  if (!sources || sources.length === 0) return null;
  const f1Min = Math.min(...sources.map((s) => s.f1Implied));
  const f2Min = Math.min(...sources.map((s) => s.f2Implied));
  const sum   = f1Min + f2Min;
  const edge  = parseFloat((100 - sum).toFixed(1));
  return { f1Min: f1Min.toFixed(1), f2Min: f2Min.toFixed(1), sum: sum.toFixed(1), edge, hasArb: edge > 0 };
}

/** Build implied% from a moneyline string. Returns a number or null. */
function impliedNum(ml) {
  const s = mlToImplied(ml);
  return s ? parseFloat(s) : null;
}


/** Returns a CSS color for closing urgency. */
function countdownColor(dateStr, today) {
  const d = daysUntil(dateStr, today);
  if (d < 0) return 'var(--text-dim)';
  if (d <= 7) return 'var(--accent)';
  return 'var(--green)';
}

/**
 * MarketsScreen — prediction market dashboard.
 *
 * Displays active UFC markets with three live data columns (Sportsbook, Polymarket, Kalshi)
 * when API keys are configured. Falls back to mock platform rows from `data/markets.js`
 * when live APIs are unavailable (no keys, quota exceeded, offline).
 *
 * Features:
 *   - Unified market row: Sportsbook (best available) | Polymarket | Kalshi | Arb alert
 *   - Cross-platform arbitrage detection across all three live sources
 *   - Opening line display in sportsbook column ("OPEN -130 / +110") from localStorage
 *   - "NOT IN ROSTER" badge on live-only stub fight rows (fighters not in 69-fighter seed)
 *   - Tapology public pick % row ("PUBLIC Fighter 68% / Opponent 32%") when build-time scrape data
 *     is present; amber FADE badge when public diverges ≥15pt from sportsbook implied probability
 *   - Probability movement line chart (lazy-loaded per market)
 *   - Personal CLV log view (localStorage-persisted snapshots)
 *   - Line-movement alerts (bell icon per fight; fires browser Notification when ML moves ≥threshold)
 *   - Watchlist (localStorage-persisted)
 *   - Filters: platform, title fights, watchlist; Sort: closing, volume, event
 *
 * @param {function} onBack - callback invoked when the back button is clicked
 */
export const MarketsScreen = ({ onBack }) => {
  const { isWatched, toggle }                    = useWatchlist();
  const [platformFilter, setPlatformFilter]      = useState('ALL');
  const [titleOnly, setTitleOnly]                = useState(false);
  const [watchedOnly, setWatchedOnly]            = useState(false);
  const [sortKey, setSortKey]                    = useState('CLOSING');
  const [expandedChart, setExpandedChart]        = useState(null); // market id with open chart
  const [chartHistory, setChartHistory]          = useState({});   // { fightKey: { poly: [], kalshi: [] } }
  const [showCLV, setShowCLV]                    = useState(false);
  const [clvLog, setCLVLog]                      = useState([]);
  const [openingLines]                           = useState(() => readOpeningLines());
  const [pickerOpen, setPickerOpen]              = useState(null);  // _fightKey of open pick form
  const [pickForm, setPickForm]                  = useState({ fighter: '', method: 'Any', confidence: 3, notes: '' });
  const [showPickLog, setShowPickLog]            = useState(false);
  const [pickLog, setPickLog]                    = useState([]);

  const { data: oddsData }                       = useOdds();
  const { data: polyData, fetchHistory: polyFetchHistory } = usePolymarket();
  const { data: kalshiData, fetchHistory: kalshiFetchHistory } = useKalshi();
  const { alertRules, toggleFightAlert, setFightThreshold } = useAlerts(oddsData);

  const liveAvailable = Boolean(oddsData || polyData || kalshiData);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  // Build a lookup map: fightKey → live sources
  const liveByKey = useMemo(() => {
    const map = {};

    (oddsData || []).forEach((f) => {
      if (!map[f.fightKey]) map[f.fightKey] = { sportsbook: null, polymarket: null, kalshi: null, fighter1: f.fighter1, fighter2: f.fighter2, eventDate: f.eventDate };
      map[f.fightKey].sportsbook = f.sportsbook;
    });

    (polyData || []).forEach((f) => {
      if (!map[f.fightKey]) map[f.fightKey] = { sportsbook: null, polymarket: null, kalshi: null, fighter1: f.fighter1, fighter2: f.fighter2, eventDate: '' };
      map[f.fightKey].polymarket = f.polymarket;
    });

    (kalshiData || []).forEach((f) => {
      if (!map[f.fightKey]) map[f.fightKey] = { sportsbook: null, polymarket: null, kalshi: null, fighter1: f.fighter1, fighter2: f.fighter2, eventDate: '' };
      map[f.fightKey].kalshi = f.kalshi;
    });

    return map;
  }, [oddsData, polyData, kalshiData]);

  // Build the composite market list: merge mock MARKETS with live data.
  // Mock markets anchor the list (they have event metadata); live-only fights appended.
  const allMarkets = useMemo(() => {
    const mockKeys = new Set();
    const merged = MARKETS.map((m) => {
      const key = fightKey(m.fighter1, m.fighter2);
      mockKeys.add(key);
      return { ...m, _fightKey: key, _live: liveByKey[key] || null };
    });

    // Append live-only fights not present in mock MARKETS.
    Object.entries(liveByKey).forEach(([key, live]) => {
      if (!mockKeys.has(key)) {
        merged.push({
          id:         `live_${key}`,
          event:      live.eventDate ? `Event ${live.eventDate.slice(0, 7)}` : 'LIVE',
          eventDate:  live.eventDate || '',
          fighter1:   live.fighter1,
          fighter2:   live.fighter2,
          weight:     'Unknown',
          isTitle:    false,
          closing:    live.eventDate || '',
          platforms:  [],
          method_props: [],
          _fightKey:  key,
          _live:      live,
        });
      }
    });

    return merged;
  }, [liveByKey]);

  const cycleSort = () => setSortKey((k) => {
    const i = SORT_LABELS.indexOf(k);
    return SORT_LABELS[(i + 1) % SORT_LABELS.length];
  });

  const filtered = useMemo(() => {
    let list = allMarkets.filter((m) => {
      if (platformFilter !== 'ALL') {
        const hasMockPlatform = m.platforms.some((p) => p.name === platformFilter);
        const hasLivePlatform = platformFilter === 'Polymarket'
          ? m._live?.polymarket
          : platformFilter === 'Kalshi'
            ? m._live?.kalshi
            : false;
        if (!hasMockPlatform && !hasLivePlatform) return false;
      }
      if (titleOnly && !m.isTitle) return false;
      if (watchedOnly && !isWatched(m.id)) return false;
      return true;
    });
    if (sortKey === 'CLOSING') list = [...list].sort((a, b) => new Date(a.closing) - new Date(b.closing));
    if (sortKey === 'VOLUME')  list = [...list].sort((a, b) => totalVolume(b) - totalVolume(a));
    if (sortKey === 'EVENT')   list = [...list].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    return list;
  }, [allMarkets, platformFilter, titleOnly, watchedOnly, sortKey, isWatched]);

  /** Lazy-load price history for a market card on expand. */
  const handleExpandChart = useCallback(async (market) => {
    const key = market._fightKey;
    if (expandedChart === market.id) {
      setExpandedChart(null);
      return;
    }
    setExpandedChart(market.id);

    if (chartHistory[key]) return; // already loaded

    const live = market._live || {};
    const results = { poly: [], kalshi: [] };

    if (live.polymarket?.conditionId && live.polymarket?.token1Id) {
      results.poly = await polyFetchHistory(live.polymarket.conditionId, live.polymarket.token1Id);
    }
    if (live.kalshi?.ticker) {
      results.kalshi = await kalshiFetchHistory(live.kalshi.ticker);
    }

    setChartHistory((prev) => ({ ...prev, [key]: results }));
  }, [expandedChart, chartHistory, polyFetchHistory, kalshiFetchHistory]);

  /** Load CLV log when panel is opened. */
  useEffect(() => {
    if (showCLV) setCLVLog(readCLVLog());
  }, [showCLV]);

  /** Load pick log when panel is opened. */
  useEffect(() => {
    if (showPickLog) setPickLog(readPickLog());
  }, [showPickLog]);

  /** Save a pick and close the inline form. */
  const handleSavePick = useCallback((market) => {
    if (!pickForm.fighter) return;
    appendPick({
      fightKey:   market._fightKey,
      fighter:    pickForm.fighter,
      method:     pickForm.method,
      confidence: pickForm.confidence,
      notes:      pickForm.notes.trim(),
      ts:         new Date().toISOString(),
    });
    setPickerOpen(null);
    setPickForm({ fighter: '', method: 'Any', confidence: 3, notes: '' });
    if (showPickLog) setPickLog(readPickLog());
  }, [pickForm, showPickLog]);

  /** Mark an existing pick W or L and refresh the log. */
  const handlePickOutcome = useCallback((fightKey, outcome) => {
    updatePickOutcome(fightKey, outcome);
    setPickLog(readPickLog());
  }, []);

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-section">MARKETS</span>
        <div className="topbar-right">
          <button
            className={`topbar-back topbar-back--mr${showPickLog ? ' active' : ''}`}
            onClick={() => setShowPickLog((v) => !v)}
          >
            PICKS
          </button>
          <button
            className={`topbar-back topbar-back--mr${showCLV ? ' active' : ''}`}
            onClick={() => setShowCLV((v) => !v)}
          >
            CLV LOG
          </button>
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>

      {/* CLV Log panel */}
      {showCLV && (
        <div className="markets-clv-panel">
          <div className="sec-label sec-label--mb-8" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>PERSONAL CLV LOG — {clvLog.length} SNAPSHOTS</span>
            {clvLog.length > 0 && (
              <button
                className="topbar-back"
                onClick={() => {
                  const csv = clvLogToCsv(clvLog);
                  const date = new Date().toISOString().slice(0, 10);
                  downloadBlob(csv, `audwihr_clv_${date}.csv`, 'text/csv');
                }}
              >↓ CSV</button>
            )}
          </div>
          {clvLog.length === 0 ? (
            <div className="mono-status-dim">
              No snapshots yet. CLV entries are recorded automatically when live market data is fetched.
            </div>
          ) : (
            <div className="clv-table">
              <div className="clv-row clv-header">
                <span>FIGHT</span>
                <span>SOURCE</span>
                <span>TIME</span>
                <span>F1 PRICE</span>
                <span>F2 PRICE</span>
              </div>
              {[...clvLog].reverse().slice(0, 100).map((entry, i) => (
                <div key={i} className="clv-row">
                  <span className="clv-fight-name">
                    {entry.fighter1?.split(' ').pop()} vs {entry.fighter2?.split(' ').pop()}
                  </span>
                  <span className={`mkt-platform-badge platform-${(entry.source || '').toLowerCase()}`}>
                    {(entry.source || '—').toUpperCase()}
                  </span>
                  <span className="clv-val--time">
                    {entry.ts ? new Date(entry.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                  <span className="clv-val--f1">
                    {typeof entry.f1Price === 'number' ? `${(entry.f1Price * 100).toFixed(1)}%` : '—'}
                  </span>
                  <span className="clv-val--f2">
                    {typeof entry.f2Price === 'number' ? `${(entry.f2Price * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pick Log panel */}
      {showPickLog && (() => {
        const wins    = pickLog.filter(e => e.outcome === 'W').length;
        const losses  = pickLog.filter(e => e.outcome === 'L').length;
        const pending = pickLog.filter(e => !e.outcome).length;
        return (
          <div className="markets-pick-panel">
            <div className="sec-label sec-label--mb-8" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>PICK LOG — {wins}W {losses}L {pending}P</span>
            </div>
            {pickLog.length === 0 ? (
              <div className="mono-status-dim">No picks logged yet. Use + PICK on any fight.</div>
            ) : (
              <div className="pick-log-table">
                {[...pickLog].reverse().slice(0, 20).map((entry, i) => (
                  <div key={i} className="pick-log-row">
                    <span className="pick-log-fight">{entry.fightKey.replace(/_/g, ' ')}</span>
                    <span className="pick-log-fighter">{entry.fighter.split(' ').pop()}</span>
                    <span className="pick-log-method">{entry.method}</span>
                    <span className="pick-log-conf">{'★'.repeat(Math.max(1, Math.min(5, entry.confidence)))}</span>
                    {entry.outcome === 'W' && <span className="pick-log-outcome--w">W</span>}
                    {entry.outcome === 'L' && <span className="pick-log-outcome--l">L</span>}
                    {!entry.outcome && (
                      <>
                        <button className="pick-log-result-btn" onClick={() => handlePickOutcome(entry.fightKey, 'W')}>W</button>
                        <button className="pick-log-result-btn" onClick={() => handlePickOutcome(entry.fightKey, 'L')}>L</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      <div className="compare-layout">
        {/* Filter + sort bar */}
        <div className="markets-filterbar">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              className={`filter-chip ${platformFilter === p ? 'on' : ''}`}
              onClick={() => setPlatformFilter(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={`filter-chip ${titleOnly ? 'on' : ''}`}
            onClick={() => setTitleOnly((v) => !v)}
          >
            TITLE
          </button>
          <button
            className={`filter-chip ${watchedOnly ? 'on' : ''}`}
            onClick={() => setWatchedOnly((v) => !v)}
          >
            ★ WATCHLIST
          </button>
          <button className="markets-sort-btn" onClick={cycleSort}>
            SORT: {sortKey} ↕
          </button>
          {liveAvailable && (
            <span className="live-indicator">
              ● LIVE
            </span>
          )}
        </div>

        {/* Market list */}
        <div className="markets-list">
          {filtered.length === 0 && (
            <div className="mkt-empty">
              <div className="empty-state-icon">📊</div>
              <span>NO MARKETS MATCH FILTER</span>
            </div>
          )}
          {filtered.map((market) => {
            const live        = market._live;
            const watched     = isWatched(market.id);
            const histKey     = market._fightKey;
            const isExpanded  = expandedChart === market.id;
            const hist        = chartHistory[histKey];
            const isStub      = market.id.startsWith('live_');
            const opening     = openingLines[market._fightKey] || null;
            const tapologyPct = tapologyByKey[market._fightKey] || null;

            // Build arb sources from live data if available, else from mock platforms.
            const arbSources = [];
            if (live?.sportsbook) {
              const f1i = impliedNum(live.sportsbook.f1_ml);
              const f2i = impliedNum(live.sportsbook.f2_ml);
              if (f1i && f2i) arbSources.push({ f1Implied: f1i, f2Implied: f2i, source: 'sportsbook' });
            }
            if (live?.polymarket) {
              arbSources.push({ f1Implied: live.polymarket.f1_price * 100, f2Implied: live.polymarket.f2_price * 100, source: 'polymarket' });
            }
            if (live?.kalshi) {
              arbSources.push({ f1Implied: live.kalshi.f1_price * 100, f2Implied: live.kalshi.f2_price * 100, source: 'kalshi' });
            }
            // Fallback to mock platforms for arb if no live data.
            if (arbSources.length === 0 && market.platforms.length > 0) {
              market.platforms.forEach((p) => {
                const f1i = impliedNum(p.f1_ml);
                const f2i = impliedNum(p.f2_ml);
                if (f1i && f2i) arbSources.push({ f1Implied: f1i, f2Implied: f2i, source: p.name });
              });
            }
            const arb = computeArb(arbSources);
            const vol = totalVolume(market);

            const alertKey     = market._fightKey;
            const alertRule    = alertRules[alertKey] || {};
            const alertEnabled = alertRule.enabled === true;
            const alertThresh  = typeof alertRule.threshold === 'number' ? alertRule.threshold : 5;

            return (
              <div key={market.id} className={`mkt-card${watched ? ' watched' : ''}`}>

                {/* Header */}
                <div className="mkt-card-header">
                  <button
                    className={`mkt-watchlist-btn${watched ? ' on' : ''}`}
                    onClick={() => toggle(market.id)}
                    title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {watched ? '★' : '☆'}
                  </button>
                  <button
                    className={`mkt-alert-bell${alertEnabled ? ' on' : ''}`}
                    onClick={() => toggleFightAlert(alertKey)}
                    title={alertEnabled ? 'Disable line-movement alert' : 'Enable line-movement alert'}
                    aria-label={alertEnabled ? 'Alert on' : 'Alert off'}
                  >
                    {alertEnabled ? '🔔' : '🔕'}
                  </button>
                  {alertEnabled && (
                    <input
                      className="mkt-alert-threshold"
                      type="number"
                      min="1"
                      max="99"
                      value={alertThresh}
                      aria-label="Alert threshold in moneyline points"
                      title="Alert threshold (ML points)"
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v > 0) setFightThreshold(alertKey, v);
                      }}
                    />
                  )}
                  <button
                    className={`mkt-pick-btn${pickerOpen === market._fightKey ? ' on' : ''}`}
                    onClick={() => {
                      if (pickerOpen === market._fightKey) {
                        setPickerOpen(null);
                      } else {
                        setPickerOpen(market._fightKey);
                        setPickForm({ fighter: '', method: 'Any', confidence: 3, notes: '' });
                      }
                    }}
                    aria-label="Log a pick for this fight"
                  >
                    + PICK
                  </button>
                  <div className="mkt-card-header-body">
                    <div className="mkt-fight-name">
                      {market.fighter1} <span className="mkt-fight-name-vs">vs</span> {market.fighter2}
                    </div>
                    <div className="mkt-fight-meta">
                      {market.event} · {market.weight.toUpperCase()}{market.isTitle ? ' · TITLE' : ''}
                      {isStub && <span className="mkt-not-in-roster">NOT IN ROSTER</span>}
                    </div>
                  </div>
                  <div className="mkt-header-right">
                    {market.closing && (
                      <span className="mkt-countdown" style={{ color: countdownColor(market.closing, today) }}>
                        {countdown(market.closing, today, 'CLOSED')}
                      </span>
                    )}
                    {vol > 0 && <span className="mkt-vol-total">{fmtVolume(vol)} VOL</span>}
                  </div>
                </div>

                {/* Inline pick form */}
                {pickerOpen === market._fightKey && (
                  <div className="mkt-pick-form">
                    <div className="mkt-pick-form-row">
                      <span className="mkt-pick-label">PICK</span>
                      {[market.fighter1, market.fighter2].map(name => (
                        <button
                          key={name}
                          className={`mkt-pick-chip${pickForm.fighter === name ? ' on' : ''}`}
                          onClick={() => setPickForm(f => ({ ...f, fighter: name }))}
                        >
                          {name.split(' ').pop()}
                        </button>
                      ))}
                    </div>
                    <div className="mkt-pick-form-row">
                      <span className="mkt-pick-label">METHOD</span>
                      {['KO/TKO', 'Submission', 'Decision', 'Any'].map(m => (
                        <button
                          key={m}
                          className={`mkt-pick-chip${pickForm.method === m ? ' on' : ''}`}
                          onClick={() => setPickForm(f => ({ ...f, method: m }))}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="mkt-pick-form-row">
                      <span className="mkt-pick-label">CONF</span>
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n}
                          className={`mkt-pick-chip${pickForm.confidence === n ? ' on' : ''}`}
                          onClick={() => setPickForm(f => ({ ...f, confidence: n }))}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="mkt-pick-form-row">
                      <span className="mkt-pick-label">NOTES</span>
                      <textarea
                        className="mkt-pick-notes"
                        rows={2}
                        maxLength={200}
                        placeholder="optional notes..."
                        value={pickForm.notes}
                        onChange={e => setPickForm(f => ({ ...f, notes: e.target.value }))}
                      />
                    </div>
                    <div className="mkt-pick-form-actions">
                      <button
                        className="mkt-pick-save"
                        disabled={!pickForm.fighter}
                        onClick={() => handleSavePick(market)}
                      >
                        SAVE PICK
                      </button>
                      <button className="mkt-pick-cancel" onClick={() => setPickerOpen(null)}>
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {/* Unified live price row (shown when any live data is available) */}
                {live && (
                  <div className="mkt-live-row">
                    {/* Sportsbook column */}
                    <LivePriceCell
                      label="SPORTSBOOK"
                      colorClass="platform-draftkings"
                      f1Name={market.fighter1.split(' ').pop()}
                      f2Name={market.fighter2.split(' ').pop()}
                      f1Val={live.sportsbook ? live.sportsbook.f1_ml : null}
                      f2Val={live.sportsbook ? live.sportsbook.f2_ml : null}
                      formatF1={(v) => v}
                      formatF2={(v) => v}
                      sublabel={live.sportsbook?.source || null}
                      isML
                      openingLine={opening}
                    />
                    {/* Polymarket column */}
                    <LivePriceCell
                      label="POLYMARKET"
                      colorClass="platform-polymarket"
                      f1Name={market.fighter1.split(' ').pop()}
                      f2Name={market.fighter2.split(' ').pop()}
                      f1Val={live.polymarket ? live.polymarket.f1_price : null}
                      f2Val={live.polymarket ? live.polymarket.f2_price : null}
                      formatF1={(v) => `${(v * 100).toFixed(1)}%`}
                      formatF2={(v) => `${(v * 100).toFixed(1)}%`}
                    />
                    {/* Kalshi column */}
                    <LivePriceCell
                      label="KALSHI"
                      colorClass="platform-kalshi"
                      f1Name={market.fighter1.split(' ').pop()}
                      f2Name={market.fighter2.split(' ').pop()}
                      f1Val={live.kalshi ? live.kalshi.f1_price : null}
                      f2Val={live.kalshi ? live.kalshi.f2_price : null}
                      formatF1={(v) => `${(v * 100).toFixed(1)}%`}
                      formatF2={(v) => `${(v * 100).toFixed(1)}%`}
                    />
                  </div>
                )}

                {/* Fallback: mock platform rows (shown when no live data) */}
                {!live && market.platforms.length > 0 && (
                  <div className="mkt-platforms">
                    {market.platforms.map((p) => {
                      const f1Impl = mlToImplied(p.f1_ml);
                      const f2Impl = mlToImplied(p.f2_ml);
                      const f1Num = parseInt(p.f1_ml);
                      const f1IsFav = !isNaN(f1Num) && f1Num < 0;
                      return (
                        <div className="mkt-platform-row" key={p.name}>
                          <span className={`mkt-platform-badge platform-${p.name.toLowerCase()}`}>
                            {p.name.toUpperCase()}
                          </span>
                          <div className="mkt-price-cell">
                            <div className="mkt-price-name">{market.fighter1.split(' ').pop()}</div>
                            <div className={`mkt-price-ml ${f1IsFav ? 'fav' : 'dog'}`}>{p.f1_ml}</div>
                            {f1Impl && <div className="mkt-price-implied">{f1Impl}%</div>}
                          </div>
                          <div className="mkt-price-cell">
                            <div className="mkt-price-name">{market.fighter2.split(' ').pop()}</div>
                            <div className={`mkt-price-ml ${!f1IsFav ? 'fav' : 'dog'}`}>{p.f2_ml}</div>
                            {f2Impl && <div className="mkt-price-implied">{f2Impl}%</div>}
                          </div>
                          <div className="mkt-platform-vol">{fmtVolume(p.volume)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Overround / arb */}
                {arb && (
                  <>
                    {arb.hasArb ? (
                      <div className="mkt-arb-alert">
                        ⚡ ARB ALERT — best-of sum: {arb.sum}% ({arb.edge}% edge) ·
                        F1 best: {arb.f1Min}% · F2 best: {arb.f2Min}%
                      </div>
                    ) : (
                      <div className="mkt-overround-row">OVERROUND: {arb.sum}%</div>
                    )}
                  </>
                )}

                {/* Tapology community picks — fade signal when public diverges ≥15pt from sportsbook implied */}
                {tapologyPct && (() => {
                  const sbF1Impl = live?.sportsbook ? impliedNum(live.sportsbook.f1_ml) : null;
                  const gap      = sbF1Impl !== null ? Math.abs(tapologyPct.f1 - sbF1Impl) : null;
                  const isFade   = gap !== null && gap >= 15;
                  return (
                    <div className={`mkt-public-row${isFade ? ' mkt-public-row--fade' : ''}`}>
                      <span className="mkt-public-label">PUBLIC</span>
                      <span className="mkt-public-pct">
                        {market.fighter1.split(' ').pop()} {tapologyPct.f1}%
                        <span className="mkt-public-sep">/</span>
                        {market.fighter2.split(' ').pop()} {tapologyPct.f2}%
                      </span>
                      {isFade && <span className="mkt-public-fade-badge">FADE</span>}
                    </div>
                  );
                })()}

                {/* Method props */}
                {market.method_props.length > 0 && (
                  <div className="mkt-props">
                    <span className="mkt-props-label">PROPS:</span>
                    {market.method_props.map((prop) => (
                      <span key={prop.label} className="mkt-prop-chip">
                        {prop.label} {prop.ml}
                      </span>
                    ))}
                  </div>
                )}

                {/* Chart expand toggle (only when live polymarket or kalshi data exists) */}
                {live && (live.polymarket || live.kalshi) && (
                  <button
                    className="mkt-chart-toggle"
                    onClick={() => handleExpandChart(market)}
                  >
                    {isExpanded ? '▲ HIDE CHART' : '▼ PRICE HISTORY'}
                  </button>
                )}

                {/* Price history chart (lazy-loaded) */}
                {isExpanded && (
                  <div className="mkt-chart-area">
                    {!hist && (
                      <div className="mono-status-dim">
                        LOADING HISTORY…
                      </div>
                    )}
                    {hist && hist.poly.length < 2 && hist.kalshi.length < 2 && (
                      <div className="mono-status-dim">
                        NO HISTORY DATA AVAILABLE
                      </div>
                    )}
                    {hist && hist.poly.length >= 2 && (
                      <PriceChart
                        series={hist.poly}
                        color="var(--blue)"
                        label={`POLYMARKET — ${market.fighter1.split(' ').pop()}`}
                      />
                    )}
                    {hist && hist.kalshi.length >= 2 && (
                      <PriceChart
                        series={hist.kalshi}
                        color="var(--green)"
                        label={`KALSHI — ${market.fighter1.split(' ').pop()}`}
                        height={56}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * LivePriceCell — one column in the unified live market row.
 * Shows fighter name, price value, and implied probability.
 *
 * @param {string}   label       - column header (e.g. 'POLYMARKET')
 * @param {string}   colorClass  - CSS class for the badge
 * @param {string}   f1Name      - fighter 1 last name
 * @param {string}   f2Name      - fighter 2 last name
 * @param {*}        f1Val       - raw price value for F1 (null = unavailable)
 * @param {*}        f2Val       - raw price value for F2
 * @param {function} formatF1    - (val) => display string for F1
 * @param {function} formatF2    - (val) => display string for F2
 * @param {string}   [sublabel]  - optional sub-label under the badge (e.g. bookmaker name)
 * @param {boolean}  [isML]         - if true, interpret vals as American ML strings for color coding
 * @param {{ f1ml: string, f2ml: string, ts: number }|null} [openingLine] - stored opening line for delta display
 */
const LivePriceCell = ({ label, colorClass, f1Name, f2Name, f1Val, f2Val, formatF1, formatF2, sublabel, isML, openingLine }) => {
  const available = f1Val !== null && f2Val !== null;

  const f1IsFav = isML
    ? (f1Val !== null && !isNaN(parseInt(f1Val)) && parseInt(f1Val) < 0)
    : (f1Val !== null && f1Val > 0.5);

  return (
    <div className="mkt-live-cell">
      <div className="mkt-live-cell-header">
        <span className={`mkt-platform-badge ${colorClass}`}>{label}</span>
        {sublabel && <span className="mkt-live-sublabel">{sublabel}</span>}
      </div>
      {available ? (
        <>
          <div className="mkt-live-price-row">
            <span className="mkt-price-name">{f1Name}</span>
            <span className={`mkt-price-ml ${f1IsFav ? 'fav' : 'dog'}`}>{formatF1(f1Val)}</span>
          </div>
          <div className="mkt-live-price-row">
            <span className="mkt-price-name">{f2Name}</span>
            <span className={`mkt-price-ml ${!f1IsFav ? 'fav' : 'dog'}`}>{formatF2(f2Val)}</span>
          </div>
          {openingLine && (
            <div className="mkt-opening-line">
              OPEN {openingLine.f1ml} / {openingLine.f2ml}
            </div>
          )}
        </>
      ) : (
        <div className="mkt-live-unavailable">—</div>
      )}
    </div>
  );
};
