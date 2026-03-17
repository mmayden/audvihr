import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FighterSearch } from './FighterSearch';

const FIGHTERS = [
  { id: 1, name: 'Islam Makhachev',  record: '28-1', weight: 'Lightweight'   },
  { id: 2, name: 'Dustin Poirier',   record: '30-9', weight: 'Lightweight'   },
  { id: 3, name: 'Leon Edwards',     record: '22-4', weight: 'Welterweight'  },
  { id: 4, name: 'Kamaru Usman',     record: '20-4', weight: 'Welterweight'  },
];

describe('FighterSearch', () => {
  it('renders input with placeholder', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} placeholder="Pick a fighter" />);
    expect(screen.getByPlaceholderText('Pick a fighter')).toBeTruthy();
  });

  it('shows selected fighter name when closed and selectedId is set', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="1" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    expect(input.value).toBe('Islam Makhachev');
  });

  it('shows empty input when selectedId is empty string', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    expect(input.value).toBe('');
  });

  it('opens dropdown on focus and shows options', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    expect(document.querySelector('.fighter-search-dropdown')).toBeTruthy();
    expect(screen.getByText('Islam Makhachev')).toBeTruthy();
  });

  it('filters options when user types', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Leon' } });
    expect(screen.getByText('Leon Edwards')).toBeTruthy();
    expect(screen.queryByText('Islam Makhachev')).toBeNull();
  });

  it('is case-insensitive when filtering', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'islam' } });
    expect(screen.getByText('Islam Makhachev')).toBeTruthy();
  });

  it('shows "No fighters found" when query has no matches', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzznomatch' } });
    expect(screen.getByText('No fighters found')).toBeTruthy();
  });

  it('calls onSelect with fighter ID string on option mousedown', () => {
    const onSelect = vi.fn();
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={onSelect} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    const option = screen.getByText('Islam Makhachev').closest('.fighter-search-option');
    fireEvent.mouseDown(option);
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('closes dropdown on Escape key', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    expect(document.querySelector('.fighter-search-dropdown')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(document.querySelector('.fighter-search-dropdown')).toBeNull();
  });

  it('has correct ARIA attributes on wrapper', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const wrapper = document.querySelector('.fighter-search');
    expect(wrapper.getAttribute('role')).toBe('combobox');
    expect(wrapper.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('marks aria-expanded true when open', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const wrapper = document.querySelector('.fighter-search');
    expect(wrapper.getAttribute('aria-expanded')).toBe('false');
    fireEvent.focus(document.querySelector('.fighter-search-input'));
    expect(wrapper.getAttribute('aria-expanded')).toBe('true');
  });

  it('XSS input is rendered as text, never as markup', () => {
    const xssQuery = '<script>alert(1)</script>';
    render(<FighterSearch fighters={FIGHTERS} selectedId="" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: xssQuery } });
    // The script tag text should not be executed; no script element should be injected
    expect(document.querySelectorAll('script').length).toBe(0);
    // "No fighters found" shows — the XSS string matched no fighter
    expect(screen.getByText('No fighters found')).toBeTruthy();
  });

  it('highlights selected fighter in dropdown', () => {
    render(<FighterSearch fighters={FIGHTERS} selectedId="2" onSelect={() => {}} />);
    const input = document.querySelector('.fighter-search-input');
    fireEvent.focus(input);
    const options = document.querySelectorAll('.fighter-search-option');
    const selectedOption = Array.from(options).find(o => o.getAttribute('aria-selected') === 'true');
    expect(selectedOption).toBeTruthy();
    expect(selectedOption.querySelector('.fighter-search-name').textContent).toBe('Dustin Poirier');
  });
});
