import { useState, useMemo } from 'react';
import { FIGHTERS } from '../data/fighters';
import { FighterName } from '../components/FighterName';
import { RELEVANCE_COLOR, CATEGORY_COLOR } from '../constants/qualifiers';
import { useNews } from '../hooks/useNews';

const CATEGORIES = ['ALL', 'FIGHT', 'INJURY', 'CAMP', 'WEIGH-IN', 'RESULT'];

/** Format ISO date string as 'Mar 14 2026'. */
function fmtDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * NewsScreen — fighter news feed with category and fighter filters.
 * Displays live RSS items (LIVE badge) when available; falls back to static
 * mock items (MOCK badge) when all RSS sources are unreachable.
 * @param {function} onBack - callback invoked when the back button is clicked
 * @param {function} onGoFighter - callback invoked with a fighter object for deep navigation
 */
export const NewsScreen = ({ onBack, onGoFighter }) => {
  const [catFilter, setCatFilter] = useState('ALL');
  const [fighterFilter, setFighterFilter] = useState('ALL');

  const { items, loading, isLive } = useNews();

  const rosterOptions = useMemo(() => {
    const ids = [...new Set(items.filter(n => n.fighter_id).map(n => n.fighter_id))];
    return ids
      .map(id => FIGHTERS.find(f => f.id === id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const catOk     = catFilter === 'ALL' || item.category === catFilter.toLowerCase();
      const fighterOk = fighterFilter === 'ALL' || item.fighter_id === Number(fighterFilter);
      return catOk && fighterOk;
    });
  }, [items, catFilter, fighterFilter]);

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-section">FIGHTER NEWS</span>
        <div className="topbar-right">
          <span className={`news-source-badge ${isLive ? 'news-source-badge--live' : 'news-source-badge--mock'}`}>
            {loading ? 'LOADING' : isLive ? 'LIVE' : 'MOCK'}
          </span>
          <button className="topbar-back" onClick={onBack}>← MENU</button>
        </div>
      </div>

      <div className="news-filterbar">
        <div className="news-cat-chips">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${catFilter === cat ? 'on' : ''}`}
              onClick={() => setCatFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          className="news-fighter-select"
          value={fighterFilter}
          onChange={e => setFighterFilter(e.target.value)}
        >
          <option value="ALL">ALL FIGHTERS</option>
          {rosterOptions.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="news-count-bar">
        <span className="news-count">{filtered.length} ITEM{filtered.length !== 1 ? 'S' : ''}</span>
        <span className="news-count-dim">— sorted by date, newest first</span>
      </div>

      <div className="news-list">
        {filtered.length === 0 && (
          <div className="news-empty">No news items match the current filters.</div>
        )}
        {filtered.map(item => (
          <div key={item.id} className={`news-card news-card--${item.category}`}>
            <div className="news-card-header">
              <span
                className="news-cat-badge"
                style={{ color: CATEGORY_COLOR[item.category] ?? 'var(--text-dim)', borderColor: CATEGORY_COLOR[item.category] ?? 'var(--border)' }}
              >
                {item.category.toUpperCase()}
              </span>
              {item.fighter_name && (
                <span className="news-fighter-tag">
                  <FighterName name={item.fighter_name} onGoFighter={onGoFighter} />
                </span>
              )}
              <span
                className="news-relevance"
                style={{ color: RELEVANCE_COLOR[item.relevance] }}
                title={`Trading relevance: ${item.relevance}`}
              >
                ● {item.relevance.toUpperCase()}
              </span>
              <span className={`news-item-badge ${item.isLive ? 'news-item-badge--live' : 'news-item-badge--mock'}`}>
                {item.isLive ? 'LIVE' : 'MOCK'}
              </span>
              <span className="news-date">{fmtDate(item.date)}</span>
            </div>
            <div className="news-headline">{item.headline}</div>
            <div className="news-body">{item.body}</div>
            <div className="news-footer">
              <span className="news-source">{item.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
