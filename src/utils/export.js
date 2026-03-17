/**
 * export.js — client-side export utilities.
 *
 * Generates downloadable files (Markdown, CSV) entirely in the browser.
 * No data leaves the browser to any third party.
 *
 * Security:
 *   - CSV cells are guarded against spreadsheet formula injection
 *     (values starting with =, +, -, @ are prefixed with a single quote).
 *   - All values are stringified before insertion — no HTML generation.
 *   - Object URLs are revoked immediately after the download anchor is clicked.
 */

/**
 * Guard a CSV cell value against formula injection.
 * Prefixes dangerous leading characters with a single quote.
 * @param {*} val - raw value (will be coerced to string)
 * @returns {string}
 */
export function sanitizeCsvCell(val) {
  const s = String(val ?? '');
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

/**
 * Trigger a browser file download from a string.
 * Creates a temporary Blob URL, clicks it, then immediately revokes it.
 * @param {string} content  - file content
 * @param {string} filename - suggested filename
 * @param {string} mimeType - MIME type (e.g. 'text/plain', 'text/csv')
 */
export function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Build a Markdown export string from a compare-screen snapshot.
 *
 * @param {object}   f1             - fighter 1 object from FIGHTERS
 * @param {object}   f2             - fighter 2 object from FIGHTERS
 * @param {object}   checked        - { [itemId]: boolean } checklist state
 * @param {Array}    checklistItems - CHECKLIST constant array
 * @param {Array}    signals        - edge signal objects from computeEdgeSignals()
 * @param {string}   [notes]        - optional free-text notes string
 * @returns {string} markdown text
 */
export function checklistToMarkdown(f1, f2, checked, checklistItems, signals, notes) {
  const now = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push(`# Audwihr — Compare Export`);
  lines.push(`**Date:** ${now}`);
  lines.push('');
  lines.push(`## ${f1.name} (${f1.record}) vs ${f2.name} (${f2.record})`);
  lines.push(`**F1 archetype:** ${f1.archetype || '—'}  `);
  lines.push(`**F2 archetype:** ${f2.archetype || '—'}`);
  lines.push('');

  // Group checklist items by category
  const cats = [...new Set(checklistItems.map(i => i.cat))];
  lines.push('## Trade Checklist');
  for (const cat of cats) {
    lines.push(`\n### ${cat}`);
    for (const item of checklistItems.filter(i => i.cat === cat)) {
      const mark = checked[item.id] ? '[x]' : '[ ]';
      lines.push(`- ${mark} ${item.text}`);
      if (item.sub) lines.push(`  > ${item.sub}`);
    }
  }

  // Edge signals
  if (signals && signals.length > 0) {
    lines.push('');
    lines.push('## Edge Signals *(research prompts — not picks)*');
    for (const s of signals) {
      lines.push(`- ${s.text}`);
    }
  }

  // Optional notes
  if (notes && notes.trim()) {
    lines.push('');
    lines.push('## Notes');
    lines.push(notes.trim());
  }

  return lines.join('\n');
}

/**
 * Build a CSV string from the CLV log array.
 * Columns: timestamp, fight_key, source, fighter1, fighter2, f1_price_pct, f2_price_pct
 *
 * @param {Array} log - CLVEntry[] from readCLVLog()
 * @returns {string} CSV text with header row
 */
export function clvLogToCsv(log) {
  const HEADER = ['timestamp', 'fight_key', 'source', 'fighter1', 'fighter2', 'f1_price_pct', 'f2_price_pct'];
  const rows   = [HEADER.join(',')];

  for (const entry of log) {
    const ts    = entry.ts    ? new Date(entry.ts).toISOString() : '';
    const f1pct = typeof entry.f1Price === 'number' ? (entry.f1Price * 100).toFixed(2) : '';
    const f2pct = typeof entry.f2Price === 'number' ? (entry.f2Price * 100).toFixed(2) : '';
    const cells = [
      sanitizeCsvCell(ts),
      sanitizeCsvCell(entry.fightKey  ?? ''),
      sanitizeCsvCell(entry.source    ?? ''),
      sanitizeCsvCell(entry.fighter1  ?? ''),
      sanitizeCsvCell(entry.fighter2  ?? ''),
      sanitizeCsvCell(f1pct),
      sanitizeCsvCell(f2pct),
    ];
    rows.push(cells.join(','));
  }

  return rows.join('\n');
}
