import { useState, useMemo, useRef } from 'react';

/**
 * FighterSearch — type-to-search fighter selector with filtered dropdown.
 * Replaces scroll-based <select> elements throughout the app.
 *
 * Security: the search query is only used to filter the in-memory fighters
 * array via .toLowerCase().includes(). It is never passed to innerHTML,
 * dangerouslySetInnerHTML, or any DOM-insertion API. Results render via JSX.
 *
 * Accessibility: role="combobox" on wrapper, aria-autocomplete="list",
 * aria-expanded on input, role="listbox" on dropdown, role="option" +
 * aria-selected on each item.
 *
 * @param {object[]} fighters    - filtered FIGHTERS array to search within
 * @param {string}   selectedId  - currently selected fighter ID (string) or ''
 * @param {function} onSelect    - called with fighter ID string when a fighter is chosen
 * @param {string}   [placeholder] - input placeholder text
 */
export const FighterSearch = ({ fighters, selectedId, onSelect, placeholder = 'Search fighter…' }) => {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef            = useRef(null);

  const selected = useMemo(
    () => fighters.find(f => String(f.id) === String(selectedId)) ?? null,
    [fighters, selectedId]
  );

  /** Text shown in the input: query while typing, fighter name when closed + selected. */
  const displayValue = open ? query : (selected?.name ?? '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fighters.slice(0, 25);
    return fighters.filter(f => f.name.toLowerCase().includes(q)).slice(0, 25);
  }, [fighters, query]);

  const handleFocus = () => {
    setOpen(true);
    setQuery('');
  };

  const handleChange = (e) => {
    setQuery(e.target.value.trim() === '' ? '' : e.target.value);
    setOpen(true);
  };

  /** onMouseDown fires before onBlur, so the click registers before the dropdown closes. */
  const handleOptionMouseDown = (fighter) => {
    onSelect(String(fighter.id));
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    // Small delay so onMouseDown can fire first
    setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div
      className="fighter-search"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <input
        ref={inputRef}
        className="fighter-search-input"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {open && filtered.length > 0 && (
        <div className="fighter-search-dropdown" role="listbox" aria-label="Fighter options">
          {filtered.map(f => (
            <div
              key={f.id}
              className={`fighter-search-option${selected?.id === f.id ? ' selected' : ''}`}
              role="option"
              aria-selected={selected?.id === f.id}
              onMouseDown={() => handleOptionMouseDown(f)}
            >
              <span className="fighter-search-name">{f.name}</span>
              <span className="fighter-search-meta">{f.record} · {f.weight}</span>
            </div>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="fighter-search-dropdown" role="listbox">
          <div className="fighter-search-option" style={{ color: 'var(--text-dim)', cursor: 'default' }}>
            <span className="fighter-search-name">No fighters found</span>
          </div>
        </div>
      )}
    </div>
  );
};
