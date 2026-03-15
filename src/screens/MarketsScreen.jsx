import { useState, useMemo } from 'react';
import { MARKETS } from '../data/markets';
import { useWatchlist } from '../hooks/useWatchlist';
import { mlToImplied } from '../utils/odds';
import { daysUntil } from '../utils/date';

const SORT_LABELS = ['CLOSING', 'VOLUME', 'EVENT'];
const PLATFORMS = ['ALL', 'Polymarket', 'Kalshi', 'Novig'];

/** Format a USD volume number as a compact string (e.g. $1.2M, $340K). */
function fmtVolume(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

/** Sum all platform volumes for a market. */
function totalVolume(market) {
  return market.platforms.reduce((acc, p) => acc + p.volume, 0);
}

/**
 * Compute cross-platform arbitrage data for a market.
 * Arb exists when bestF1Implied + bestF2Implied < 100.
 * "Best" = lowest implied probability = best available price for bettors.
 */
function computeArb(market) {
  const f1Implieds = market.platforms.map((p) => parseFloat(mlToImplied(p.f1_ml)) || 100);
  const f2Implieds = market.platforms.map((p) => parseFloat(mlToImplied(p.f2_ml)) || 100);
  const bestF1 = Math.min(...f1Implieds);
  const bestF2 = Math.min(...f2Implieds);
  const sum = bestF1 + bestF2;
  const edge = parseFloat((100 - sum).toFixed(1));
  return { bestF1: bestF1.toFixed(1), bestF2: bestF2.toFixed(1), sum: sum.toFixed(1), edge, hasArb: edge > 0 };
}

/** Returns a compact countdown label for a closing date. */
function countdown(dateStr, today) {
  const d = daysUntil(dateStr, today);
  if (d < 0) return 'CLOSED';
  if (d === 0) return 'TODAY';
  if (d === 1) return '1D';
  return `${d}D`;
}

/** Returns a CSS color variable for a closing date urgency. */
function countdownColor(dateStr, today) {
  const d = daysUntil(dateStr, today);
  if (d < 0) return 'var(--text-dim)';
  if (d <= 7) return 'var(--accent)';
  return 'var(--green)';
}

/**
 * MarketsScreen — prediction market dashboard.
 * Displays active UFC markets across Polymarket, Kalshi, and Novig with:
 *   - Moneyline prices and implied probabilities per platform
 *   - Cross-platform arbitrage detection (best-of implied sum < 100%)
 *   - Method props (KO/TKO, Submission, Decision)
 *   - Watchlist (localStorage-persisted)
 *   - Filters: platform, title fights only, watchlist only
 *   - Sort: closing date, total volume, event date
 * @param {function} onBack - callback invoked when the back button is clicked
 */
export function MarketsScreen({ onBack }) {
  const { isWatched, toggle } = useWatchlist();
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [titleOnly, setTitleOnly]           = useState(false);
  const [watchedOnly, setWatchedOnly]       = useState(false);
  const [sortKey, setSortKey]               = useState('CLOSING');

  const cycleSort = () => setSortKey((k) => {
    const i = SORT_LABELS.indexOf(k);
    return SORT_LABELS[(i + 1) % SORT_LABELS.length];
  });

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const filtered = useMemo(() => {
    let list = MARKETS.filter((m) => {
      if (platformFilter !== 'ALL' && !m.platforms.some((p) => p.name === platformFilter)) return false;
      if (titleOnly && !m.isTitle) return false;
      if (watchedOnly && !isWatched(m.id)) return false;
      return true;
    });
    if (sortKey === 'CLOSING') list = [...list].sort((a, b) => new Date(a.closing) - new Date(b.closing));
    if (sortKey === 'VOLUME')  list = [...list].sort((a, b) => totalVolume(b) - totalVolume(a));
    if (sortKey === 'EVENT')   list = [...list].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    return list;
  }, [platformFilter, titleOnly, watchedOnly, sortKey, isWatched]);

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-section">MARKETS</span>
        <div className="topbar-right">
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>

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
            const arb = computeArb(market);
            const vol = totalVolume(market);
            const watched = isWatched(market.id);
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
                    <span className="mkt-countdown" style={{ color: countdownColor(market.closing, today) }}>
                      {countdown(market.closing, today)}
                    </span>
                    <span className="mkt-vol-total">{fmtVolume(vol)} VOL</span>
                  </div>
                </div>

                {/* Platform prices */}
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

                {/* Overround / arb */}
                <div className="mkt-overround-row">
                  {arb.hasArb ? null : `OVERROUND: ${arb.sum}%`}
                </div>
                {arb.hasArb && (
                  <div className="mkt-arb-alert">
                    ⚡ ARB ALERT — best-of sum: {arb.sum}% ({arb.edge}% edge) ·
                    F1 best: {arb.bestF1}% · F2 best: {arb.bestF2}%
                  </div>
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
