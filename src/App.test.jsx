import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

// Mock all screens so they render a trivial sentinel — avoids pulling in heavy
// data files and hooks that require env vars.
vi.mock('./screens/MenuScreen',    () => ({ MenuScreen:    () => <div>MENU_SCREEN</div> }));
vi.mock('./screens/FighterScreen', () => ({ FighterScreen: () => <div>FIGHTERS_SCREEN</div> }));
vi.mock('./screens/CompareScreen', () => ({ CompareScreen: () => <div>COMPARE_SCREEN</div> }));
vi.mock('./screens/CalendarScreen',() => ({ CalendarScreen:() => <div>CALENDAR_SCREEN</div> }));
vi.mock('./screens/MarketsScreen', () => ({ MarketsScreen: () => <div>MARKETS_SCREEN</div> }));
vi.mock('./screens/NewsScreen',    () => ({ NewsScreen:    () => <div>NEWS_SCREEN</div> }));

beforeEach(() => {
  localStorage.clear();
  // Pre-accept disclaimer gate so bottom nav is reachable
  localStorage.setItem('disclaimer_accepted', '1');
});

describe('App — bottom nav', () => {
  it('renders a nav with all 5 screen labels', () => {
    render(<App />);
    const nav = document.querySelector('.bottom-nav');
    expect(nav).toBeTruthy();
    expect(screen.getByText('FIGHTERS')).toBeTruthy();
    expect(screen.getByText('COMPARE')).toBeTruthy();
    expect(screen.getByText('CALENDAR')).toBeTruthy();
    expect(screen.getByText('MARKETS')).toBeTruthy();
    expect(screen.getByText('NEWS')).toBeTruthy();
  });

  it('navigates to FighterScreen when FIGHTERS nav item is clicked', () => {
    render(<App />);
    const fightersBtn = document.querySelector('.bottom-nav-item');
    fireEvent.click(fightersBtn);
    expect(screen.getByText('FIGHTERS_SCREEN')).toBeTruthy();
  });

  it('marks the active screen item with class active', () => {
    render(<App />);
    const fightersBtn = document.querySelector('.bottom-nav-item');
    fireEvent.click(fightersBtn);
    const activeItem = document.querySelector('.bottom-nav-item.active');
    expect(activeItem).toBeTruthy();
    expect(activeItem.textContent).toContain('FIGHTERS');
  });

});
