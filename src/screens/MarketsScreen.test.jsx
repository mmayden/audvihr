import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketsScreen } from './MarketsScreen';
import { appendOpeningLine } from '../utils/clv';
import { fightKey } from '../utils/normalizeOdds';

// ---------- Hook mocks ----------
// Factories return vi.fn() so individual tests can override via vi.mocked().
vi.mock('../hooks/useOdds',       () => ({ useOdds:       vi.fn(() => ({ data: null, loading: false, error: null, refetch: vi.fn() })) }));
vi.mock('../hooks/usePolymarket', () => ({ usePolymarket: vi.fn(() => ({ data: null, loading: false, error: null, fetchHistory: vi.fn(() => Promise.resolve([])), refetch: vi.fn() })) }));
vi.mock('../hooks/useKalshi',     () => ({ useKalshi:     vi.fn(() => ({ data: null, loading: false, error: null, fetchHistory: vi.fn(() => Promise.resolve([])), refetch: vi.fn() })) }));

// ---------- Events mock ----------
// Inject Tsarukyan vs Gaethje with tapology_pct so tapologyByKey is non-empty.
vi.mock('../data/events', () => ({
  EVENTS: [
    {
      id: 'test-event',
      name: 'UFC Test Event',
      date: '2025-04-12',
      card: {
        main: { f1: 'Arman Tsarukyan', f2: 'Justin Gaethje', tapology_pct: { f1: 68, f2: 32 } },
        comain: null,
        prelims: [],
        early_prelims: [],
      },
    },
  ],
}));

// ---------- Imports of mocked hooks (for vi.mocked()) ----------
import { useOdds } from '../hooks/useOdds';
import { usePolymarket } from '../hooks/usePolymarket';
import { useKalshi } from '../hooks/useKalshi';

// Reset hook mocks and storage before each test.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.mocked(useOdds).mockReturnValue({ data: null, loading: false, error: null, refetch: vi.fn() });
  vi.mocked(usePolymarket).mockReturnValue({ data: null, loading: false, error: null, fetchHistory: vi.fn(() => Promise.resolve([])), refetch: vi.fn() });
  vi.mocked(useKalshi).mockReturnValue({ data: null, loading: false, error: null, fetchHistory: vi.fn(() => Promise.resolve([])), refetch: vi.fn() });
});

// ---------- Smoke tests ----------
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

// ---------- Phase 9 additions ----------
describe('MarketsScreen — Phase 9 additions', () => {
  it('shows NOT IN ROSTER badge for live-only stub fights', () => {
    vi.mocked(useOdds).mockReturnValue({
      data: [{
        fightKey: fightKey('Fighter Unknown', 'Fighter Beta'),
        fighter1: 'Fighter Unknown',
        fighter2: 'Fighter Beta',
        eventDate: '2025-06-01',
        sportsbook: { f1_ml: '-150', f2_ml: '+125', source: 'DraftKings' },
      }],
      loading: false, error: null, refetch: vi.fn(),
    });
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText('NOT IN ROSTER')).toBeTruthy();
  });

  it('shows opening line in sportsbook column when stored in localStorage', () => {
    const key = fightKey('Arman Tsarukyan', 'Justin Gaethje');
    appendOpeningLine(key, '-150', '+125', Date.now());
    vi.mocked(useOdds).mockReturnValue({
      data: [{
        fightKey: key,
        fighter1: 'Arman Tsarukyan',
        fighter2: 'Justin Gaethje',
        eventDate: '2025-04-12',
        sportsbook: { f1_ml: '-155', f2_ml: '+130', source: 'DraftKings' },
      }],
      loading: false, error: null, refetch: vi.fn(),
    });
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText('OPEN -150 / +125')).toBeTruthy();
  });

  it('shows Tapology PUBLIC row when tapology_pct is present in events data', () => {
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText('PUBLIC')).toBeTruthy();
    // tapologyByKey has Tsarukyan 68% / Gaethje 32% from mocked EVENTS
    expect(screen.getByText(/68%/)).toBeTruthy();
    expect(screen.getByText(/32%/)).toBeTruthy();
  });

  it('shows FADE badge when public % diverges ≥15pt from sportsbook implied', () => {
    // Tsarukyan public 68%. Sportsbook f1_ml = '+200' → implied ≈ 33% → gap = 35pt ≥ 15 → FADE
    vi.mocked(useOdds).mockReturnValue({
      data: [{
        fightKey: fightKey('Arman Tsarukyan', 'Justin Gaethje'),
        fighter1: 'Arman Tsarukyan',
        fighter2: 'Justin Gaethje',
        eventDate: '2025-04-12',
        sportsbook: { f1_ml: '+200', f2_ml: '-250', source: 'DraftKings' },
      }],
      loading: false, error: null, refetch: vi.fn(),
    });
    render(<MarketsScreen onBack={() => {}} />);
    expect(screen.getByText('FADE')).toBeTruthy();
  });
});
