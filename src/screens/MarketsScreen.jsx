import { useState, useMemo, useEffect, useCallback } from 'react';
import { MARKETS } from '../data/markets';
import { useWatchlist } from '../hooks/useWatchlist';
import { useOdds } from '../hooks/useOdds';
import { usePolymarket } from '../hooks/usePolymarket';
import { useKalshi } from '../hooks/useKalshi';
import { mlToImplied } from '../utils/odds';
import { fightKey } from '../utils/normalizeOdds';
import { daysUntil } from '../utils/date';
import { readCLVLog } from '../utils/clv';
import { PriceChart } from '../components/PriceChart';

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
 *   - Probability movement line chart (lazy-loaded per market)
 *   - Personal CLV log view (localStorage-persisted snapshots)
 *   - Watchlist (localStorage-persisted)
 *   - Filters: platform, title fights, watchlist; Sort: closing, volume, event
 *
 * @param {function} onBack - callback invoked when the back button is clicked
 */

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

/** Returns a countdown label for a closing date. */
function countdown(dateStr, today) {
  const d = daysUntil(dateStr, today);
  if (d < 0) return 'CLOSED';
  if (d === 0) return 'TODAY';
  if (d === 1) return '1D';
  return `${d}D`;
}

/** Returns a CSS color for closing urgency. */
function countdownColor(dateStr, today) {
  const d = daysUntil(dateStr, today);
  if (d < 0) return 'var(--text-dim)';
  if (d <= 7) return 'var(--accent)';
  return 'var(--green)';
}

export function MarketsScreen({ onBack }) {
  const { isWatched, toggle }                    = useWatchlist();
  const [platformFilter, setPlatformFilter]      = useState('ALL');
  const [titleOnly, setTitleOnly]                = useState(false);
  const [watchedOnly, setWatchedOnly]            = useState(false);
  const [sortKey, setSortKey]                    = useState('CLOSING');
  const [expandedChart, setExpandedChart]        = useState(null); // market id with open chart
  const [chartHistory, setChartHistory]          = useState({});   // { fightKey: { poly: [], kalshi: [] } }
  const [showCLV, setShowCLV]                    = useState(false);
  const [clvLog, setCLVLog]                      = useState([]);

  const { data: oddsData }                       = useOdds();
  const { data: polyData, fetchHistory: polyFetchHistory } = usePolymarket();
  const { data: kalshiData, fetchHistory: kalshiFetchHistory } = useKalshi();

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

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-section">MARKETS</span>
        <div className="topbar-right">
          <button
            className={`topbar-back${showCLV ? ' active' : ''}`}
            onClick={() => setShowCLV((v) => !v)}
            style={{ marginRight: 8 }}
          >
            CLV LOG
          </button>
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>

      {/* CLV Log panel */}
      {showCLV && (
        <div className="markets-clv-panel">
          <div className="sec-label" style={{ marginBottom: 8 }}>
            PERSONAL CLV LOG — {clvLog.length} SNAPSHOTS
          </div>
          {clvLog.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 11 }}>
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
                  <span style={{ color: 'var(--text-bright)' }}>
                    {entry.fighter1?.split(' ').pop()} vs {entry.fighter2?.split(' ').pop()}
                  </span>
                  <span className={`mkt-platform-badge platform-${(entry.source || '').toLowerCase()}`}>
                    {(entry.source || '—').toUpperCase()}
                  </span>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {entry.ts ? new Date(entry.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                  <span style={{ color: 'var(--green)' }}>
                    {typeof entry.f1Price === 'number' ? `${(entry.f1Price * 100).toFixed(1)}%` : '—'}
                  </span>
                  <span style={{ color: 'var(--blue)' }}>
                    {typeof entry.f2Price === 'number' ? `${(entry.f2Price * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--green)', alignSelf: 'center', marginLeft: 8 }}>
              ● LIVE
            </span>
          )}
        </div>

        {/* Market list */}
        <div className="markets-list">
          {filtered.length === 0 && (
            <div className="mkt-empty">
              <div style={{ fontSize: 28, opacity: .2 }}>📊</div>
              <span>NO MARKETS MATCH FILTER</span>
            </div>
          )}
          {filtered.map((market) => {
            const live    = market._live;
            const watched = isWatched(market.id);
            const histKey = market._fightKey;
            const isExpanded = expandedChart === market.id;
            const hist    = chartHistory[histKey];

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
                  <div style={{ flex: 1 }}>
                    <div className="mkt-fight-name">
                      {market.fighter1} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>vs</span> {market.fighter2}
                    </div>
                    <div className="mkt-fight-meta">
                      {market.event} · {market.weight.toUpperCase()}{market.isTitle ? ' · TITLE' : ''}
                    </div>
                  </div>
                  <div className="mkt-header-right">
                    {market.closing && (
                      <span className="mkt-countdown" style={{ color: countdownColor(market.closing, today) }}>
                        {countdown(market.closing, today)}
                      </span>
                    )}
                    {vol > 0 && <span className="mkt-vol-total">{fmtVolume(vol)} VOL</span>}
                  </div>
                </div>

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
                      <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 11 }}>
                        LOADING HISTORY…
                      </div>
                    )}
                    {hist && hist.poly.length < 2 && hist.kalshi.length < 2 && (
                      <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 11 }}>
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
 * @param {boolean}  [isML]      - if true, interpret vals as American ML strings for color coding
 */
const LivePriceCell = ({ label, colorClass, f1Name, f2Name, f1Val, f2Val, formatF1, formatF2, sublabel, isML }) => {
  const available = f1Val !== null && f2Val !== null;

  const f1IsFav = isML
    ? (f1Val !== null && !isNaN(parseInt(f1Val)) && parseInt(f1Val) < 0)
    : (f1Val !== null && f1Val > 0.5);

  return (
    <div className="mkt-live-cell">
      <div style={{ marginBottom: 4 }}>
        <span className={`mkt-platform-badge ${colorClass}`}>{label}</span>
        {sublabel && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', marginLeft: 4 }}>{sublabel}</span>}
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
        </>
      ) : (
        <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 10, paddingTop: 4 }}>—</div>
      )}
    </div>
  );
};
