import { describe, it, expect } from 'vitest';
import {
  stripHtml,
  parseRssFeed,
  classifyCategory,
  classifyRelevance,
  matchFighterName,
  rssItemToNewsItem,
} from './newsParser';

// ---------------------------------------------------------------------------
// stripHtml
// ---------------------------------------------------------------------------

describe('stripHtml', () => {
  it('returns plain text unchanged', () => {
    expect(stripHtml('hello world')).toBe('hello world');
  });

  it('strips a simple tag', () => {
    expect(stripHtml('<b>bold</b>')).toBe('bold');
  });

  it('strips nested tags', () => {
    expect(stripHtml('<p><strong>UFC</strong> news</p>')).toBe('UFC news');
  });

  it('neutralises a script XSS attempt — returns text content only', () => {
    const xss = '<script>alert("xss")</script>dangerous';
    // DOMParser text/html extracts textContent — script tag body is included as text
    // but no script is ever executed and no markup reaches the DOM
    const result = stripHtml(xss);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('neutralises an img onerror XSS attempt', () => {
    const xss = '<img src=x onerror="alert(1)">caption';
    const result = stripHtml(xss);
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror');
  });

  it('neutralises an anchor href javascript: XSS attempt', () => {
    const xss = '<a href="javascript:void(0)">click</a>';
    const result = stripHtml(xss);
    expect(result).not.toContain('<a');
    expect(result).not.toContain('javascript:');
  });

  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('');
  });

  it('returns empty string for null', () => {
    expect(stripHtml(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(stripHtml(undefined)).toBe('');
  });

  it('returns empty string for non-string input', () => {
    expect(stripHtml(42)).toBe('');
  });

  it('handles HTML entities in text', () => {
    // DOMParser decodes &amp; etc. — result should be readable text
    const result = stripHtml('<p>Makhachev &amp; Tsarukyan</p>');
    expect(result).toContain('Makhachev');
    expect(result).toContain('Tsarukyan');
  });
});

// ---------------------------------------------------------------------------
// parseRssFeed
// ---------------------------------------------------------------------------

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>MMA News</title>
    <item>
      <title>Makhachev defends title at UFC 316</title>
      <pubDate>Mon, 16 Mar 2026 10:00:00 GMT</pubDate>
      <description>Islam Makhachev is set to defend the lightweight title.</description>
    </item>
    <item>
      <title>Aspinall vs Jones targeted for UFC 317</title>
      <pubDate>Sun, 15 Mar 2026 08:00:00 GMT</pubDate>
      <description>The heavyweight unification bout is taking shape.</description>
    </item>
  </channel>
</rss>`;

describe('parseRssFeed', () => {
  it('parses a valid RSS feed into items', () => {
    const items = parseRssFeed(SAMPLE_RSS);
    expect(items).toHaveLength(2);
  });

  it('extracts title from items', () => {
    const items = parseRssFeed(SAMPLE_RSS);
    expect(items[0].title).toBe('Makhachev defends title at UFC 316');
  });

  it('extracts pubDate from items', () => {
    const items = parseRssFeed(SAMPLE_RSS);
    expect(items[0].date).toContain('2026');
  });

  it('extracts description from items', () => {
    const items = parseRssFeed(SAMPLE_RSS);
    expect(items[0].description).toContain('Makhachev');
  });

  it('returns [] for empty string', () => {
    expect(parseRssFeed('')).toEqual([]);
  });

  it('returns [] for null', () => {
    expect(parseRssFeed(null)).toEqual([]);
  });

  it('returns [] for non-string input', () => {
    expect(parseRssFeed(42)).toEqual([]);
  });

  it('returns [] for malformed XML', () => {
    expect(parseRssFeed('<rss><unclosed>')).toEqual([]);
  });

  it('handles items with missing title gracefully', () => {
    const rss = `<?xml version="1.0"?><rss><channel>
      <item><pubDate>Mon, 16 Mar 2026 00:00:00 GMT</pubDate><description>test</description></item>
    </channel></rss>`;
    const items = parseRssFeed(rss);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('');
  });

  it('returns [] when channel has no items', () => {
    const rss = `<?xml version="1.0"?><rss><channel><title>Empty</title></channel></rss>`;
    expect(parseRssFeed(rss)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// classifyCategory
// ---------------------------------------------------------------------------

describe('classifyCategory', () => {
  it('returns "injury" when headline contains injury keyword', () => {
    expect(classifyCategory('Oliveira injury update', '')).toBe('injury');
  });

  it('returns "injury" when body contains "fracture"', () => {
    expect(classifyCategory('Fighter update', 'Confirmed rib fracture sustained in camp.')).toBe('injury');
  });

  it('returns "weigh-in" when headline contains "miss weight"', () => {
    expect(classifyCategory('Pimblett misses weight by 2 lbs', '')).toBe('weigh-in');
  });

  it('returns "weigh-in" for "weigh-in" in headline', () => {
    expect(classifyCategory('Official weigh-in results', '')).toBe('weigh-in');
  });

  it('returns "result" when body contains "defeats"', () => {
    expect(classifyCategory('Fight recap', 'Tsarukyan defeats Gaethje via TKO.')).toBe('result');
  });

  it('returns "result" for "unanimous decision"', () => {
    expect(classifyCategory('', 'Won by unanimous decision in round 3.')).toBe('result');
  });

  it('returns "camp" when headline contains "training"', () => {
    expect(classifyCategory('Tsarukyan training camp update', '')).toBe('camp');
  });

  it('returns "camp" for "coach" keyword', () => {
    expect(classifyCategory('New coach joins camp ahead of title fight', '')).toBe('camp');
  });

  it('defaults to "fight" when no keyword matches', () => {
    expect(classifyCategory('UFC 316 card announced', 'Main event confirmed.')).toBe('fight');
  });

  it('is case-insensitive', () => {
    expect(classifyCategory('INJURY REPORT: Fighter OUT', '')).toBe('injury');
  });
});

// ---------------------------------------------------------------------------
// classifyRelevance
// ---------------------------------------------------------------------------

describe('classifyRelevance', () => {
  it('returns "high" for title fight news', () => {
    expect(classifyRelevance('Title fight booked for UFC 316', '')).toBe('high');
  });

  it('returns "high" for injury news', () => {
    expect(classifyRelevance('Fighter pulls from event', 'Confirmed injury.')).toBe('high');
  });

  it('returns "high" for KO mention', () => {
    expect(classifyRelevance('', 'Won by KO in round 2')).toBe('high');
  });

  it('returns "low" for historical/opinion content', () => {
    expect(classifyRelevance('Greatest of all time debate', '')).toBe('low');
  });

  it('returns "low" for pound-for-pound content', () => {
    expect(classifyRelevance('Updated pound-for-pound rankings', '')).toBe('low');
  });

  it('returns "medium" for neutral news', () => {
    expect(classifyRelevance('UFC 316 press conference recap', 'Fighters spoke about the matchup.')).toBe('medium');
  });

  it('high keywords take priority over low keywords', () => {
    // Both 'title' (high) and 'hall of fame' (low) present — high wins since we check high first
    expect(classifyRelevance('Hall of fame title fight', '')).toBe('high');
  });
});

// ---------------------------------------------------------------------------
// matchFighterName
// ---------------------------------------------------------------------------

const MOCK_FIGHTERS = [
  { id: 1, name: 'Islam Makhachev' },
  { id: 2, name: 'Dustin Poirier' },
  { id: 3, name: 'Jon Jones' },
  { id: 4, name: 'Li Wei' }, // last name < 3 chars ('wei' is fine, but 'li' would be skipped if last)
];

describe('matchFighterName', () => {
  it('matches a fighter by last name in headline', () => {
    expect(matchFighterName('Makhachev defends title', '', MOCK_FIGHTERS)).toBe(1);
  });

  it('matches a fighter by last name in body', () => {
    expect(matchFighterName('UFC news', 'Poirier expected to return soon.', MOCK_FIGHTERS)).toBe(2);
  });

  it('is case-insensitive', () => {
    expect(matchFighterName('JONES vs ASPINALL', '', MOCK_FIGHTERS)).toBe(3);
  });

  it('returns null when no fighter last name found', () => {
    expect(matchFighterName('Random event news', 'No fighters mentioned.', MOCK_FIGHTERS)).toBeNull();
  });

  it('returns null for empty text', () => {
    expect(matchFighterName('', '', MOCK_FIGHTERS)).toBeNull();
  });

  it('returns null when fighters array is empty', () => {
    expect(matchFighterName('Makhachev news', '', [])).toBeNull();
  });

  it('returns null for non-array fighters input', () => {
    expect(matchFighterName('Makhachev news', '', null)).toBeNull();
  });

  it('skips fighters with last names shorter than 3 characters', () => {
    // 'Li' is 2 chars, should be skipped
    const fighters = [{ id: 99, name: 'Jet Li' }];
    expect(matchFighterName('Jet Li wins fight', '', fighters)).toBeNull();
  });

  it('matches the first fighter found (roster order)', () => {
    // Both Makhachev and Jones in headline — returns whichever comes first in array
    const result = matchFighterName('Jones vs Makhachev superfight', '', MOCK_FIGHTERS);
    // MOCK_FIGHTERS order: Makhachev (1), Poirier (2), Jones (3)
    expect(result).toBe(1); // Makhachev comes first in array
  });
});

// ---------------------------------------------------------------------------
// rssItemToNewsItem
// ---------------------------------------------------------------------------

const FIGHTERS_FOR_TRANSFORM = [
  { id: 1, name: 'Islam Makhachev' },
  { id: 5, name: 'Justin Gaethje' },
];

describe('rssItemToNewsItem', () => {
  it('produces a valid NewsItem shape', () => {
    const raw = {
      title:       'Makhachev defends title at UFC 316',
      date:        'Mon, 16 Mar 2026 10:00:00 GMT',
      description: 'Full preview of the lightweight title defense.',
    };
    const item = rssItemToNewsItem(raw, 'MMA Fighting', FIGHTERS_FOR_TRANSFORM, 0);
    expect(item).toMatchObject({
      id:           'live-mma-fighting-0',
      fighter_id:   1,
      fighter_name: 'Islam Makhachev',
      source:       'MMA Fighting',
      isLive:       true,
    });
    expect(typeof item.date).toBe('string');
    expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(['fight','injury','camp','weigh-in','result']).toContain(item.category);
    expect(['high','medium','low']).toContain(item.relevance);
  });

  it('sets fighter_id null when no fighter matched', () => {
    const raw = { title: 'General UFC news', date: '', description: 'No specific fighter mentioned.' };
    const item = rssItemToNewsItem(raw, 'Source', FIGHTERS_FOR_TRANSFORM, 1);
    expect(item.fighter_id).toBeNull();
    expect(item.fighter_name).toBeNull();
  });

  it('strips HTML from title (XSS in headline)', () => {
    const raw = {
      title:       '<b>Makhachev</b> <script>alert("xss")</script> title defense',
      date:        '',
      description: 'Details here.',
    };
    const item = rssItemToNewsItem(raw, 'Source', FIGHTERS_FOR_TRANSFORM, 2);
    expect(item.headline).not.toContain('<b>');
    expect(item.headline).not.toContain('<script>');
    expect(item.headline).not.toContain('</script>');
    expect(item.headline).toContain('Makhachev');
  });

  it('strips HTML from description (XSS in body)', () => {
    const raw = {
      title:       'News item',
      date:        '',
      description: '<p>Camp update.</p><img src=x onerror="steal()">',
    };
    const item = rssItemToNewsItem(raw, 'Source', FIGHTERS_FOR_TRANSFORM, 3);
    expect(item.body).not.toContain('<p>');
    expect(item.body).not.toContain('onerror');
  });

  it('caps headline at 160 characters', () => {
    const raw = { title: 'A'.repeat(200), date: '', description: '' };
    const item = rssItemToNewsItem(raw, 'Source', [], 0);
    expect(item.headline.length).toBeLessThanOrEqual(160);
  });

  it('caps body at 600 characters', () => {
    const raw = { title: 'title', date: '', description: 'B'.repeat(800) };
    const item = rssItemToNewsItem(raw, 'Source', [], 0);
    expect(item.body.length).toBeLessThanOrEqual(600);
  });

  it('handles missing title gracefully', () => {
    const raw = { date: '', description: 'Gaethje update.' };
    const item = rssItemToNewsItem(raw, 'Source', FIGHTERS_FOR_TRANSFORM, 0);
    expect(item.headline).toBe('');
    // Fighter still matchable via body
    expect(item.fighter_id).toBe(5);
  });

  it('uses idx in generated id', () => {
    const raw = { title: 'test', date: '', description: '' };
    expect(rssItemToNewsItem(raw, 'MMA Junkie', [], 7).id).toBe('live-mma-junkie-7');
  });

  it('falls back to today\'s date on invalid pubDate', () => {
    const raw = { title: 'test', date: 'not a date', description: '' };
    const item = rssItemToNewsItem(raw, 'Source', [], 0);
    expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
