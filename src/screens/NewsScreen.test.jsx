import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NewsScreen } from './NewsScreen';

const renderInRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const MOCK_ITEM = {
  id: 'item-1',
  headline: 'Makhachev retains title with dominant performance',
  body: 'Islam Makhachev submitted Dustin Poirier in round two.',
  source: 'MMA Fighting',
  date: '2026-03-18',
  category: 'fight',
  relevance: 'high',
  fighter_id: null,
  fighter_name: null,
  isLive: false,
};

vi.mock('../hooks/useNews', () => ({
  useNews: () => ({ items: [MOCK_ITEM], loading: false, isLive: false }),
}));
vi.mock('../data/fighters', () => ({ FIGHTERS: [] }));

beforeEach(() => { localStorage.clear(); });

describe('NewsScreen — headline expand/collapse', () => {
  it('renders a news headline', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    expect(screen.getByText(MOCK_ITEM.headline)).toBeTruthy();
  });

  it('headline starts collapsed (no news-headline--expanded)', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    expect(headline.classList.contains('news-headline--expanded')).toBe(false);
  });

  it('headline has aria-expanded=false when collapsed', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    expect(headline.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking headline adds news-headline--expanded', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    fireEvent.click(headline);
    expect(headline.classList.contains('news-headline--expanded')).toBe(true);
  });

  it('headline has aria-expanded=true after click', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    fireEvent.click(headline);
    expect(headline.getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking headline again collapses it', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    fireEvent.click(headline);
    fireEvent.click(headline);
    expect(headline.classList.contains('news-headline--expanded')).toBe(false);
  });

  it('pressing Enter on headline expands it', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    fireEvent.keyDown(headline, { key: 'Enter' });
    expect(headline.classList.contains('news-headline--expanded')).toBe(true);
  });

  it('pressing Space on headline expands it', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    fireEvent.keyDown(headline, { key: ' ' });
    expect(headline.classList.contains('news-headline--expanded')).toBe(true);
  });

  it('headline has role=button', () => {
    renderInRouter(<NewsScreen onBack={() => {}} onGoFighter={() => {}} />);
    const headline = document.querySelector('.news-headline');
    expect(headline.getAttribute('role')).toBe('button');
  });
});
