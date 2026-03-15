import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketsScreen } from './MarketsScreen';

// Mock all three live hooks — MarketsScreen degrades to mock data when they return null.
vi.mock('../hooks/useOdds',       () => ({ useOdds:       () => ({ data: null, loading: false, error: null, refetch: vi.fn() }) }));
vi.mock('../hooks/usePolymarket', () => ({ usePolymarket: () => ({ data: null, loading: false, error: null, fetchHistory: vi.fn(() => Promise.resolve([])), refetch: vi.fn() }) }));
vi.mock('../hooks/useKalshi',     () => ({ useKalshi:     () => ({ data: null, loading: false, error: null, fetchHistory: vi.fn(() => Promise.resolve([])), refetch: vi.fn() }) }));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('MarketsScreen — smoke tests', () => {
  it('renders without crashing', () => {
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText('MARKETS')).toBeTruthy();
  });

  it('renders the filter bar', () => {
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText('ALL')).toBeTruthy();
    expect(screen.getByText('Polymarket')).toBeTruthy();
    expect(screen.getByText('Kalshi')).toBeTruthy();
    expect(screen.getByText('TITLE')).toBeTruthy();
  });

  it('renders mock market cards from data/markets.js', () => {
    render(<MarketsScreen onBack={() => {}} />);
    // At least one market card should be present (non-empty mock data)
    const cards = document.querySelectorAll('.mkt-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders the CLV LOG button', () => {
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText('CLV LOG')).toBeTruthy();
  });

  it('renders the back button and calls onBack when clicked', async () => {
    const onBack = vi.fn();
    const { getByText } = render(<MarketsScreen onBack={onBack} />);
    getByText('← MENU').click();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the sort button', () => {
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText(/SORT:/)).toBeTruthy();
  });

  it('does not show ● LIVE indicator when all hooks return null', () => {
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.queryByText('● LIVE')).toBeNull();
  });
});
