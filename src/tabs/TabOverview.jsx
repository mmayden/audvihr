import { useMemo } from 'react';
import { FIGHTERS } from '../data/fighters';
import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, CATEGORY_COLOR } from '../constants/qualifiers';
import { computePercentiles } from '../utils/percentiles';

/** Format ISO date string as 'Mar 14 2026'. */
function fmtDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * Render a TOP X% percentile badge for a given rank.
 * Only shown when rank ≤ 35 (top 35% of roster).
 * @param {number} rank - percentile rank 1–100
 */
function PercentileBadge({ rank }) {
  if (rank > 35) return null;
  const cls = rank <= 10 ? 'percentile-badge--elite' : 'percentile-badge--top35';
  return <span className={`percentile-badge ${cls}`}>TOP {rank}%</span>;
}

/**
 * TabOverview — renders the Overview tab for a fighter profile.
 * Shows key numbers (streak, finish rate, method breakdown, striking/grappling
 * highlights) with percentile badges, qualitative flags (chin, cardio,
 * weight cut), trader notes, and the latest 2 news items matched to this fighter.
 * @param {object}   fighter         - fighter object from FIGHTERS
 * @param {object[]} [newsItems=[]]  - up to 2 NewsItem objects matched to this fighter
 */
export const TabOverview = ({ fighter, newsItems = [] }) => {
  const pct = useMemo(() => computePercentiles(fighter, FIGHTERS), [fighter]);

  return <div className="anim-fade">
    <div className="sec-label">KEY NUMBERS</div>
    <div className="stat-grid">
      {[
        {l:'WIN STREAK',   v:fighter.streak,              s:`${fighter.streakType} streak`,  badge: null},
        {l:'FINISH RATE',  v:fighter.finish_rate+'%',     s:'non-decision wins',             badge: <PercentileBadge rank={pct.finish_rate}/>},
        {l:'KO WINS',      v:fighter.finishes.ko,         s:'by KO/TKO',                    badge: null},
        {l:'SUB WINS',     v:fighter.finishes.sub,        s:'by submission',                badge: null},
        {l:'DEC WINS',     v:fighter.finishes.dec,        s:'by decision',                  badge: null},
        {l:'STR / MIN',    v:fighter.striking.slpm,       s:'sig strikes landed',            badge: <PercentileBadge rank={pct.slpm}/>},
        {l:'STR ABS / MIN',v:fighter.striking.sapm,       s:'sig strikes absorbed',          badge: <PercentileBadge rank={pct.sapm}/>},
        {l:'STR DEFENSE %',v:fighter.striking.str_def+'%',s:'striking defense',             badge: <PercentileBadge rank={pct.str_def}/>},
        {l:'TD DEFENSE %', v:fighter.grappling.td_def+'%',s:'takedown defense',             badge: <PercentileBadge rank={pct.td_def}/>},
      ].map(s=>(
        <div className="stat-cell" key={s.l}>
          <div className="stat-cell-label">{s.l}</div>
          <div className="stat-cell-val-row">
            <div className="stat-cell-val">{s.v}</div>
            {s.badge}
          </div>
          <div className="stat-cell-sub">{s.s}</div>
        </div>
      ))}
    </div>
    <div className="sec-label">FLAGS</div>
    <div className="stat-grid stat-grid--narrow">
      <div className="stat-cell"><div className="stat-cell-label">CHIN</div><div className="flag-value" style={{color:CHIN_COLOR[fighter.chin]||'var(--text)'}}>{fighter.chin}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">CARDIO</div><div className="flag-value" style={{color:CARDIO_COLOR[fighter.cardio]||'var(--text)'}}>{fighter.cardio}</div></div>
      <div className="stat-cell"><div className="stat-cell-label">WEIGHT CUT</div><div className="flag-value" style={{color:CUT_COLOR[fighter.weight_cut]||'var(--text)'}}>{fighter.weight_cut}</div></div>
    </div>
    <div className="sec-label">TRADER NOTES</div>
    <div className="trader-notes-block">{fighter.trader_notes}</div>
    {newsItems.length > 0 && <>
      <div className="sec-label">RECENT NEWS</div>
      <div className="overview-news-list">
        {newsItems.map(item => (
          <div key={item.id} className="overview-news-item">
            <div className="overview-news-meta">
              <span
                className="overview-news-cat"
                style={{ color: CATEGORY_COLOR[item.category] ?? 'var(--text-dim)' }}
              >
                {item.category.toUpperCase()}
              </span>
              <span className={`news-item-badge ${item.isLive ? 'news-item-badge--live' : 'news-item-badge--mock'}`}>
                {item.isLive ? 'LIVE' : 'MOCK'}
              </span>
              <span className="overview-news-date">{fmtDate(item.date)}</span>
            </div>
            <div className="overview-news-headline">{item.headline}</div>
          </div>
        ))}
      </div>
    </>}
  </div>;
};
