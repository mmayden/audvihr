import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, CATEGORY_COLOR } from '../constants/qualifiers';

/** Format ISO date string as 'Mar 14 2026'. */
function fmtDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * TabOverview — renders the Overview tab for a fighter profile.
 * Shows key numbers (streak, finish rate, method breakdown, striking/grappling
 * highlights), qualitative flags (chin, cardio, weight cut), trader notes,
 * and the latest 2 news items matched to this fighter (if any).
 * @param {object}   fighter   - fighter object from FIGHTERS
 * @param {object[]} [newsItems=[]] - up to 2 NewsItem objects matched to this fighter
 */
export const TabOverview = ({ fighter, newsItems = [] }) => {
  return <div className="anim-fade">
    <div className="sec-label">KEY NUMBERS</div>
    <div className="stat-grid">
      {[
        {l:'WIN STREAK',   v:fighter.streak,              s:`${fighter.streakType} streak`},
        {l:'FINISH RATE',  v:fighter.finish_rate+'%',     s:'non-decision wins'},
        {l:'KO WINS',      v:fighter.finishes.ko,         s:'by KO/TKO'},
        {l:'SUB WINS',     v:fighter.finishes.sub,        s:'by submission'},
        {l:'DEC WINS',     v:fighter.finishes.dec,        s:'by decision'},
        {l:'STR / MIN',    v:fighter.striking.slpm,       s:'sig strikes landed'},
        {l:'STR ABS / MIN',v:fighter.striking.sapm,       s:'sig strikes absorbed'},
        {l:'TD DEFENSE %', v:fighter.grappling.td_def+'%',s:'takedown defense'},
      ].map(s=><div className="stat-cell" key={s.l}><div className="stat-cell-label">{s.l}</div><div className="stat-cell-val">{s.v}</div><div className="stat-cell-sub">{s.s}</div></div>)}
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
