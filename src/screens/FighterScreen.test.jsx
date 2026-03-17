import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FighterScreen } from './FighterScreen';

const renderInRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// vi.mock is hoisted — fixtures must be defined via vi.hoisted so they exist
// when the factory executes (before module imports run).
const { FIGHTER_NO_PORTRAIT, FIGHTER_WITH_PORTRAIT } = vi.hoisted(() => {
  const base = {
    id: 1, name: 'Islam Makhachev', nickname: 'The Dagestani',
    record: '27-1', wins: 27, losses: 1, streak: 14, streakType: 'W',
    finish_rate: 63, finishes: { ko: 7, sub: 10, dec: 10 },
    weight: 'Lightweight', rank: 'CHAMPION', org: 'UFC', stance: 'Southpaw', country: 'Russia',
    archetype: 'WRESTLER', mods: [],
    striking: { slpm: 4.62, sapm: 2.1, str_acc: 56, str_def: 68 },
    grappling: { td_avg: 4.29, td_acc: 47, td_def: 88, sub_avg: 0.8 },
    physical: { height: "5'10\"", reach: '70"', age: 32 },
    history: [],
    chin: 'Solid', cardio: 'Elite', weight_cut: 'Minimal',
    trader_notes: 'Test notes.',
    portrait: null,
  };
  return {
    FIGHTER_NO_PORTRAIT: base,
    FIGHTER_WITH_PORTRAIT: { ...base, id: 2, name: 'Dustin Poirier', portrait: 'poirier.jpg' },
  };
});

vi.mock('../data/fighters', () => ({
  FIGHTERS: [FIGHTER_NO_PORTRAIT, FIGHTER_WITH_PORTRAIT],
}));

// Stub tabs — they pull in live data via props so a simple passthrough is fine.
vi.mock('../tabs/TabOverview',  () => ({ TabOverview:  () => <div>OVERVIEW</div> }));
vi.mock('../tabs/TabStriking',  () => ({ TabStriking:  () => <div>STRIKING</div> }));
vi.mock('../tabs/TabGrappling', () => ({ TabGrappling: () => <div>GRAPPLING</div> }));
vi.mock('../tabs/TabPhysical',  () => ({ TabPhysical:  () => <div>PHYSICAL</div> }));
vi.mock('../tabs/TabHistory',   () => ({ TabHistory:   () => <div>HISTORY</div> }));
vi.mock('../tabs/TabMarket',    () => ({ TabMarket:    () => <div>MARKET</div> }));

beforeEach(() => { localStorage.clear(); });

describe('FighterScreen — portrait', () => {
  it('shows initials fallback when fighter has no portrait', () => {
    renderInRouter(<FighterScreen onBack={() => {}} initialFighter={FIGHTER_NO_PORTRAIT} />);
    // Islam Makhachev → IM
    expect(screen.getByText('IM')).toBeTruthy();
    expect(document.querySelector('.portrait-initials')).toBeTruthy();
    expect(document.querySelector('.portrait-img')).toBeNull();
  });

  it('shows portrait img when fighter has a portrait path', () => {
    renderInRouter(<FighterScreen onBack={() => {}} initialFighter={FIGHTER_WITH_PORTRAIT} />);
    const img = document.querySelector('.portrait-img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/assets/portraits/poirier.jpg');
    expect(img.getAttribute('alt')).toBe('Dustin Poirier');
    expect(document.querySelector('.portrait-initials')).toBeNull();
  });

  it('initials use first letter of each name word (max 2)', () => {
    renderInRouter(<FighterScreen onBack={() => {}} initialFighter={FIGHTER_NO_PORTRAIT} />);
    expect(screen.getByText('IM')).toBeTruthy();
  });
});

describe('FighterScreen — sidebar toggle', () => {
  it('renders the ROSTER button', () => {
    renderInRouter(<FighterScreen onBack={() => {}} initialFighter={FIGHTER_NO_PORTRAIT} />);
    expect(screen.getByText('ROSTER')).toBeTruthy();
  });

  it('clicking ROSTER shows the sidebar-backdrop', () => {
    renderInRouter(<FighterScreen onBack={() => {}} initialFighter={FIGHTER_NO_PORTRAIT} />);
    expect(document.querySelector('.sidebar-backdrop')).toBeNull();
    fireEvent.click(screen.getByText('ROSTER'));
    expect(document.querySelector('.sidebar-backdrop')).toBeTruthy();
  });

  it('clicking backdrop closes the sidebar', () => {
    renderInRouter(<FighterScreen onBack={() => {}} initialFighter={FIGHTER_NO_PORTRAIT} />);
    fireEvent.click(screen.getByText('ROSTER'));
    const backdrop = document.querySelector('.sidebar-backdrop');
    fireEvent.click(backdrop);
    expect(document.querySelector('.sidebar-backdrop')).toBeNull();
  });

  it('sidebar gets sidebar--open class when open', () => {
    renderInRouter(<FighterScreen onBack={() => {}} initialFighter={FIGHTER_NO_PORTRAIT} />);
    fireEvent.click(screen.getByText('ROSTER'));
    expect(document.querySelector('.sidebar--open')).toBeTruthy();
  });
});
