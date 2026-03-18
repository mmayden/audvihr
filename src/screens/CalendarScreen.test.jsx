import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CalendarScreen } from './CalendarScreen';

const renderInRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const { MOCK_EVENT } = vi.hoisted(() => ({
  MOCK_EVENT: {
    id: 1, name: 'UFC 314', org: 'UFC', date: '2099-06-01',
    venue: 'Mock Arena', city: 'Mock City',
    card: {
      main:          { f1: 'Fighter A', f2: 'Fighter B', weight: 'Lightweight',  title: false },
      comain:        { f1: 'Fighter C', f2: 'Fighter D', weight: 'Welterweight', title: false },
      prelims:       [],
      early_prelims: [],
    },
  },
}));

vi.mock('../data/events',   () => ({ EVENTS: [MOCK_EVENT] }));
vi.mock('../data/fighters', () => ({ FIGHTERS: [] }));

beforeEach(() => { localStorage.clear(); });

describe('CalendarScreen — sidebar toggle', () => {
  it('renders the EVENTS button', () => {
    renderInRouter(<CalendarScreen onBack={() => {}} onGoFighter={() => {}} />);
    expect(screen.getByText('EVENTS')).toBeTruthy();
  });

  it('sidebar-backdrop is absent when sidebar is closed', () => {
    renderInRouter(<CalendarScreen onBack={() => {}} onGoFighter={() => {}} />);
    expect(document.querySelector('.sidebar-backdrop')).toBeNull();
  });

  it('clicking EVENTS renders the sidebar-backdrop', () => {
    renderInRouter(<CalendarScreen onBack={() => {}} onGoFighter={() => {}} />);
    fireEvent.click(screen.getByText('EVENTS'));
    expect(document.querySelector('.sidebar-backdrop')).toBeTruthy();
  });

  it('sidebar gets sidebar--open class when opened', () => {
    renderInRouter(<CalendarScreen onBack={() => {}} onGoFighter={() => {}} />);
    fireEvent.click(screen.getByText('EVENTS'));
    expect(document.querySelector('.sidebar--open')).toBeTruthy();
  });

  it('clicking backdrop closes the sidebar', () => {
    renderInRouter(<CalendarScreen onBack={() => {}} onGoFighter={() => {}} />);
    fireEvent.click(screen.getByText('EVENTS'));
    const backdrop = document.querySelector('.sidebar-backdrop');
    fireEvent.click(backdrop);
    expect(document.querySelector('.sidebar-backdrop')).toBeNull();
  });

  it('EVENTS button carries aria-expanded=false when closed', () => {
    renderInRouter(<CalendarScreen onBack={() => {}} onGoFighter={() => {}} />);
    const btn = screen.getByText('EVENTS');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('EVENTS button carries aria-expanded=true when open', () => {
    renderInRouter(<CalendarScreen onBack={() => {}} onGoFighter={() => {}} />);
    const btn = screen.getByText('EVENTS');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });
});
