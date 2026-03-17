import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePolymarket } from '../hooks/usePolymarket';
import { useKalshi } from '../hooks/useKalshi';
import { mlToImplied, lineMovement } from '../utils/odds';
import { PriceChart } from '../components/PriceChart';

/**
 * TabMarket — renders the Market tab for a fighter profile.
 *
 * Provides editable fields for moneyline (open/current), method odds,
 * public bet percentage, and free-text analysis notes. All manual data is
 * persisted to localStorage keyed by fighter id.
 *
 * When Polymarket or Kalshi data is available for this fighter's next fight
 * (matched by fighter name), a live probability chart is displayed.
 *
 * @param {object} fighter - fighter object from FIGHTERS
 */
export const TabMarket = ({ fighter }) => {
  const [data, setData] = useLocalStorage(
    `mkt_${fighter.id}`,
    { ml_open: '', ml_current: '', odds_ko: '', odds_sub: '', odds_dec: '', public_pct: '', notes: '' }
  );
  const upd = (k, v) => setData((p) => ({ ...p, [k]: v }));
  const mv  = lineMovement(data.ml_open, data.ml_current);

  const { data: polyMarkets, fetchHistory: polyFetchHistory } = usePolymarket();
  const { data: kalshiMarkets, fetchHistory: kalshiFetchHistory } = useKalshi();

  const [polyHistory, setPolyHistory]     = useState(null);
  const [kalshiHistory, setKalshiHistory] = useState(null);
  const [chartLoaded, setChartLoaded]     = useState(false);

  // Find the live market for this fighter (match by last name).
  const lastName = fighter.name.trim().toLowerCase().split(/\s+/).pop();

  const polyMatch = (polyMarkets || []).find((m) => {
    const key = m.fightKey || '';
    return key.includes(lastName);
  });

  const kalshiMatch = (kalshiMarkets || []).find((m) => {
    const key = m.fightKey || '';
    return key.includes(lastName);
  });

  const hasLive = Boolean(polyMatch || kalshiMatch);

  // Lazy-load history when live match is found and user hasn't loaded it yet.
  useEffect(() => {
    if (!hasLive || chartLoaded) return;
    setChartLoaded(true);

    if (polyMatch?.polymarket?.conditionId && polyMatch?.polymarket?.token1Id) {
      polyFetchHistory(polyMatch.polymarket.conditionId, polyMatch.polymarket.token1Id)
        .then(setPolyHistory);
    }
    if (kalshiMatch?.kalshi?.ticker) {
      kalshiFetchHistory(kalshiMatch.kalshi.ticker)
        .then(setKalshiHistory);
    }
  }, [hasLive, chartLoaded, polyMatch, kalshiMatch, polyFetchHistory, kalshiFetchHistory]);

  // Current live prices from matched markets.
  const polyPct = polyMatch?.polymarket
    ? `${(polyMatch.polymarket.f1_price * 100).toFixed(1)}%`
    : null;
  const kalshiPct = kalshiMatch?.kalshi
    ? `${(kalshiMatch.kalshi.f1_price * 100).toFixed(1)}%`
    : null;

  return (
    <div className="anim-fade">

      {/* Live market prices (when available) */}
      {hasLive && (
        <div className="section-mb-16">
          <div className="sec-label">LIVE MARKET PRICES</div>
          <div className="market-grid">
            {polyMatch && (
              <div className="market-card">
                <div className="mc-label">
                  <span className="mkt-platform-badge platform-polymarket">POLYMARKET</span>
                </div>
                <div className="mc-live-price">
                  {polyPct}
                </div>
                <div className="mc-implied">{polyMatch.polymarket.f1_ml} ML equiv.</div>
              </div>
            )}
            {kalshiMatch && (
              <div className="market-card">
                <div className="mc-label">
                  <span className="mkt-platform-badge platform-kalshi">KALSHI</span>
                </div>
                <div className="mc-live-price">
                  {kalshiPct}
                </div>
                <div className="mc-implied">{kalshiMatch.kalshi.f1_ml} ML equiv.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price history charts */}
      {hasLive && (polyHistory || kalshiHistory) && (
        <div className="section-mb-16">
          <div className="sec-label">PRICE HISTORY</div>
          <div className="mkt-chart-area">
            {polyHistory && polyHistory.length >= 2 && (
              <PriceChart
                series={polyHistory}
                color="var(--blue)"
                label={`POLYMARKET — ${fighter.name.split(' ').pop()}`}
              />
            )}
            {kalshiHistory && kalshiHistory.length >= 2 && (
              <PriceChart
                series={kalshiHistory}
                color="var(--green)"
                label={`KALSHI — ${fighter.name.split(' ').pop()}`}
                height={56}
              />
            )}
            {polyHistory?.length < 2 && kalshiHistory?.length < 2 && (
              <div className="mono-status-dim">
                NO HISTORY DATA AVAILABLE
              </div>
            )}
          </div>
        </div>
      )}
      {hasLive && !polyHistory && !kalshiHistory && chartLoaded && (
        <div className="mono-status-dim section-mb-16">
          LOADING PRICE HISTORY…
        </div>
      )}

      {/* Manual entry */}
      <div className="sec-label">MONEYLINE</div>
      <div className="market-grid">
        {[{ k: 'ml_open', l: 'OPENING LINE' }, { k: 'ml_current', l: 'CURRENT LINE' }].map(({ k, l }) => (
          <div className="market-card" key={k}>
            <div className="mc-label">{l}</div>
            <input
              className="mc-input"
              placeholder="-150"
              value={data[k]}
              onChange={(e) => upd(k, e.target.value)}
            />
            {data[k] && <div className="mc-implied">Implied: <span>{mlToImplied(data[k])}%</span></div>}
          </div>
        ))}
      </div>
      {mv && (
        <div className={`line-movement-bar line-movement-bar--${mv.dir}`}>
          {mv.dir === 'up' ? '▲' : '▼'} LINE MOVEMENT: {mv.label}
        </div>
      )}

      <div className="sec-label">METHOD ODDS</div>
      <div className="market-grid">
        {[{ k: 'odds_ko', l: 'WIN BY KO/TKO' }, { k: 'odds_sub', l: 'WIN BY SUB' }, { k: 'odds_dec', l: 'WIN BY DEC' }].map(({ k, l }) => (
          <div className="market-card" key={k}>
            <div className="mc-label">{l}</div>
            <input
              className="mc-input"
              placeholder="+300"
              value={data[k]}
              onChange={(e) => upd(k, e.target.value)}
            />
            {data[k] && <div className="mc-implied">Implied: <span>{mlToImplied(data[k])}%</span></div>}
          </div>
        ))}
      </div>

      <div className="sec-label">PUBLIC MONEY %</div>
      <div className="market-grid market-grid--single">
        <div className="market-card">
          <div className="mc-label">PUBLIC BET % (if available from tracker)</div>
          <input
            className="mc-input"
            placeholder="65"
            value={data.public_pct}
            onChange={(e) => upd('public_pct', e.target.value)}
          />
          {data.public_pct && data.ml_current && (
            <div className="mc-implied mc-implied--mt">
              {!isNaN(parseInt(data.public_pct)) && parseInt(data.public_pct) > 70
                ? <span className="mc-public-warning">⚠ Heavy public action — potential price inflation</span>
                : <span className="mc-public-ok">Public distribution within normal range</span>}
            </div>
          )}
        </div>
      </div>

      <div className="sec-label">ANALYSIS NOTES</div>
      <textarea
        className="notes-area"
        placeholder="Line movement story, sharp action signals, your edge thesis for this fight..."
        value={data.notes}
        onChange={(e) => upd('notes', e.target.value)}
      />
    </div>
  );
};
