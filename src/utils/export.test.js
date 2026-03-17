import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeCsvCell, clvLogToCsv, checklistToMarkdown, downloadBlob } from './export';

// ── sanitizeCsvCell ───────────────────────────────────────────────────────────

describe('sanitizeCsvCell', () => {
  it('passes through normal strings unchanged', () => {
    expect(sanitizeCsvCell('Makhachev')).toBe('Makhachev');
    expect(sanitizeCsvCell('polymarket')).toBe('polymarket');
    expect(sanitizeCsvCell('0.72')).toBe('0.72');
  });

  it('prefixes = with single quote (formula injection)', () => {
    expect(sanitizeCsvCell('=SUM(A1)')).toBe("'=SUM(A1)");
  });

  it('prefixes + with single quote', () => {
    expect(sanitizeCsvCell('+110')).toBe("'+110");
  });

  it('prefixes - with single quote', () => {
    expect(sanitizeCsvCell('-130')).toBe("'-130");
  });

  it('prefixes @ with single quote', () => {
    expect(sanitizeCsvCell('@user')).toBe("'@user");
  });

  it('converts numbers to strings', () => {
    expect(sanitizeCsvCell(42)).toBe('42');
    expect(sanitizeCsvCell(0)).toBe('0');
  });

  it('converts null/undefined to empty string', () => {
    expect(sanitizeCsvCell(null)).toBe('');
    expect(sanitizeCsvCell(undefined)).toBe('');
  });

  it('does not prefix mid-string special chars', () => {
    expect(sanitizeCsvCell('fight=key')).toBe('fight=key');
    expect(sanitizeCsvCell('a+b')).toBe('a+b');
  });
});

// ── clvLogToCsv ──────────────────────────────────────────────────────────────

describe('clvLogToCsv', () => {
  it('returns just the header row for an empty log', () => {
    const csv = clvLogToCsv([]);
    expect(csv).toBe('timestamp,fight_key,source,fighter1,fighter2,f1_price_pct,f2_price_pct');
  });

  it('produces correct columns for a single entry', () => {
    const ts = new Date('2026-01-15T12:00:00.000Z').getTime();
    const log = [{
      ts,
      fightKey: 'makhachev_vs_poirier',
      source: 'polymarket',
      fighter1: 'Islam Makhachev',
      fighter2: 'Dustin Poirier',
      f1Price: 0.72,
      f2Price: 0.28,
    }];
    const csv = clvLogToCsv(log);
    const rows = csv.split('\n');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toContain('makhachev_vs_poirier');
    expect(rows[1]).toContain('polymarket');
    expect(rows[1]).toContain('72.00');
    expect(rows[1]).toContain('28.00');
  });

  it('sanitizes formula injection in fightKey', () => {
    const log = [{
      ts: Date.now(),
      fightKey: '=EVIL()',
      source: 'kalshi',
      fighter1: 'A',
      fighter2: 'B',
      f1Price: 0.5,
      f2Price: 0.5,
    }];
    const csv = clvLogToCsv(log);
    expect(csv).toContain("'=EVIL()");
  });

  it('handles missing f1Price / f2Price gracefully', () => {
    const log = [{ ts: Date.now(), fightKey: 'a_vs_b', source: 'polymarket', fighter1: 'A', fighter2: 'B' }];
    const csv = clvLogToCsv(log);
    const row = csv.split('\n')[1];
    // f1_price_pct and f2_price_pct columns should be empty
    expect(row.endsWith(',,')).toBe(true);
  });

  it('handles missing ts gracefully', () => {
    const log = [{ fightKey: 'a_vs_b', source: 'polymarket', fighter1: 'A', fighter2: 'B', f1Price: 0.6, f2Price: 0.4 }];
    const csv = clvLogToCsv(log);
    // First column (timestamp) should be empty
    expect(csv.split('\n')[1].startsWith(',')).toBe(true);
  });

  it('produces one data row per log entry', () => {
    const log = Array.from({ length: 5 }, (_, i) => ({
      ts: Date.now() + i,
      fightKey: `fight_${i}`,
      source: 'polymarket',
      fighter1: 'A',
      fighter2: 'B',
      f1Price: 0.5,
      f2Price: 0.5,
    }));
    const csv = clvLogToCsv(log);
    expect(csv.split('\n')).toHaveLength(6); // header + 5 rows
  });
});

// ── checklistToMarkdown ───────────────────────────────────────────────────────

const F1 = { name: 'Islam Makhachev', record: '27-1', archetype: 'WRESTLER' };
const F2 = { name: 'Dustin Poirier',  record: '30-9', archetype: 'PRESSURE FIGHTER' };

const ITEMS = [
  { id: 1, cat: 'MARKET',  text: 'Where is sharp money?', sub: 'Line movement.' },
  { id: 2, cat: 'MARKET',  text: 'Public inflation check', sub: '' },
  { id: 3, cat: 'STYLES',  text: 'Who controls fight location?', sub: 'TD defense.' },
];

describe('checklistToMarkdown', () => {
  it('includes both fighter names and records', () => {
    const md = checklistToMarkdown(F1, F2, {}, ITEMS, []);
    expect(md).toContain('Islam Makhachev (27-1)');
    expect(md).toContain('Dustin Poirier (30-9)');
  });

  it('includes archetypes', () => {
    const md = checklistToMarkdown(F1, F2, {}, ITEMS, []);
    expect(md).toContain('WRESTLER');
    expect(md).toContain('PRESSURE FIGHTER');
  });

  it('marks checked items with [x]', () => {
    const checked = { 1: true, 2: false, 3: true };
    const md = checklistToMarkdown(F1, F2, checked, ITEMS, []);
    expect(md).toContain('[x] Where is sharp money?');
    expect(md).toContain('[ ] Public inflation check');
    expect(md).toContain('[x] Who controls fight location?');
  });

  it('groups items by category', () => {
    const md = checklistToMarkdown(F1, F2, {}, ITEMS, []);
    const marketIdx  = md.indexOf('### MARKET');
    const stylesIdx  = md.indexOf('### STYLES');
    expect(marketIdx).toBeGreaterThan(-1);
    expect(stylesIdx).toBeGreaterThan(marketIdx);
  });

  it('includes edge signals when provided', () => {
    const signals = [{ type: 'stat', text: 'Stats: F1 wins 10/15 — CLEAR STAT EDGE' }];
    const md = checklistToMarkdown(F1, F2, {}, ITEMS, signals);
    expect(md).toContain('Edge Signals');
    expect(md).toContain('Stats: F1 wins 10/15');
  });

  it('omits Edge Signals section when signals is empty', () => {
    const md = checklistToMarkdown(F1, F2, {}, ITEMS, []);
    expect(md).not.toContain('Edge Signals');
  });

  it('includes notes section when notes string provided', () => {
    const md = checklistToMarkdown(F1, F2, {}, ITEMS, [], 'Sharp money on underdog.');
    expect(md).toContain('## Notes');
    expect(md).toContain('Sharp money on underdog.');
  });

  it('omits notes section when notes is empty or whitespace', () => {
    expect(checklistToMarkdown(F1, F2, {}, ITEMS, [], '')).not.toContain('## Notes');
    expect(checklistToMarkdown(F1, F2, {}, ITEMS, [], '   ')).not.toContain('## Notes');
    expect(checklistToMarkdown(F1, F2, {}, ITEMS, [])).not.toContain('## Notes');
  });

  it('includes current date', () => {
    const md = checklistToMarkdown(F1, F2, {}, ITEMS, []);
    const today = new Date().toISOString().slice(0, 10);
    expect(md).toContain(today);
  });
});

// ── downloadBlob ──────────────────────────────────────────────────────────────

describe('downloadBlob', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
    // Mock document.createElement to capture anchor click
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return { href: '', download: '', click: vi.fn() };
      }
      return document.createElement.wrappedMethod?.(tag);
    });
  });

  it('creates an object URL and revokes it after click', () => {
    downloadBlob('hello', 'file.txt', 'text/plain');
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets download filename on the anchor', () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    downloadBlob('csv data', 'export.csv', 'text/csv');
    expect(anchor.download).toBe('export.csv');
    expect(anchor.click).toHaveBeenCalledOnce();
  });
});
