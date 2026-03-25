import { CHIN_COLOR, CARDIO_COLOR, CUT_COLOR, CATEGORY_COLOR } from '../constants/qualifiers';
import { getStatTier } from '../constants/statTiers';
import { formatDate } from '../utils/date';

/** Maps a tier label to a CSS color variable. */
function tierColor(tier) {
  if (tier === 'ELITE')      return 'var(--green)';
  if (tier === 'ABOVE AVG')  return 'var(--accent)';
  if (tier === 'AVG')        return 'var(--accent)';
  return 'var(--red)';
}

/**
 * TabOverview — renders the Overview tab for a fighter profile.
 * Shows key stats as coloured horizontal bars (ELITE/ABOVE AVG/AVG/BELOW AVG),
 * qualitative flags (chin, cardio, weight cut), trader notes, and recent news.
 * @param {object}   fighter         - fighter object from FIGHTERS
 * @param {object[]} [newsItems=[]]  - up to 2 NewsItem objects matched to this fighter
 */
export const TabOverview = ({ fighter, newsItems = [] }) => {

  return <div className="anim-fade overview-cards">

    <div className="ui-card">
      <div className="uc-hdr">KEY STATS</div>
      <div className="uc-body uc-body--bars">
        {[
          { label: 'STRIKE ACC',  val: fighter.striking.str_acc,     display: fighter.striking.str_acc + '%',    width: fighter.striking.str_acc,                      key: 'str_acc'    },
          { label: 'TD ACC',      val: fighter.grappling.td_acc,     display: fighter.grappling.td_acc + '%',    width: fighter.grappling.td_acc,                      key: 'td_acc'     },
          { label: 'TD DEF',      val: fighter.grappling.td_def,     display: fighter.grappling.td_def + '%',    width: fighter.grappling.td_def,                      key: 'td_def'     },
          { label: 'STR DEF',     val: fighter.striking.str_def,     display: fighter.striking.str_def + '%',    width: fighter.striking.str_def,                      key: 'str_def'    },
          { label: 'STR / MIN',   val: fighter.striking.slpm,        display: String(fighter.striking.slpm),     width: Math.min(100, (fighter.striking.slpm / 9) * 100), key: 'slpm'    },
          { label: 'STR ABS/MIN', val: fighter.striking.sapm,        display: String(fighter.striking.sapm),     width: Math.min(100, Math.max(0, (1 - fighter.striking.sapm / 7) * 100)), key: 'sapm' },
        ].map(({ label, val, display, width, key }) => {
          const tier = getStatTier(key, val);
          const color = tierColor(tier);
          return (
            <div className="ov-bar-row" key={label}>
              <span className="ov-bar-label">{label}</span>
              <div className="ov-bar-track">
                <div className="ov-bar-fill" style={{ width: width + '%', background: color }} />
              </div>
              <span className="ov-bar-val">{display}</span>
              <span className={`ov-bar-tier${tier === 'ELITE' ? ' ov-bar-tier--elite' : tier === 'BELOW AVG' ? ' ov-bar-tier--low' : ''}`}>{tier}</span>
            </div>
          );
        })}
      </div>
    </div>

    <div className="ui-card">
      <div className="uc-hdr">FLAGS</div>
      <div className="uc-body">
        <div className="flags-pill-row">
          <span className="flag-pill" style={{color:CHIN_COLOR[fighter.chin]||'var(--text)',borderColor:CHIN_COLOR[fighter.chin]||'var(--border2)'}}>
            <span className="flag-pill-key">CHIN</span>{fighter.chin}
          </span>
          <span className="flag-pill" style={{color:CARDIO_COLOR[fighter.cardio]||'var(--text)',borderColor:CARDIO_COLOR[fighter.cardio]||'var(--border2)'}}>
            <span className="flag-pill-key">CARDIO</span>{fighter.cardio}
          </span>
          <span className="flag-pill" style={{color:CUT_COLOR[fighter.weight_cut]||'var(--text)',borderColor:CUT_COLOR[fighter.weight_cut]||'var(--border2)'}}>
            <span className="flag-pill-key">CUT</span>{fighter.weight_cut}
          </span>
        </div>
      </div>
    </div>

    <div className="ui-card">
      <div className="uc-hdr">TRADER NOTES</div>
      <div className="uc-body">
        <div className="trader-notes-block">{fighter.trader_notes}</div>
      </div>
    </div>

    {newsItems.length > 0 && (
      <div className="ui-card">
        <div className="uc-hdr">RECENT NEWS</div>
        <div className="uc-body">
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
                  <span className="overview-news-date">{formatDate(item.date)}</span>
                </div>
                <div className="overview-news-headline">{item.headline}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

  </div>;
};
