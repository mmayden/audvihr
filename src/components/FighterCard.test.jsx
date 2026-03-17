import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FighterCard } from './FighterCard';

const fighter = {
  id: 1,
  name: 'Islam Makhachev',
  record: '28-1',
  rank: 'CHAMPION',
  weight: 'Lightweight',
  archetype: 'WRESTLER',
  mods: ['SOUTHPAW', 'VOLUME STRIKER'],
  portrait: null,
};

describe('FighterCard', () => {
  it('renders fighter name', () => {
    render(<FighterCard fighter={fighter} />);
    expect(screen.getByText('Islam Makhachev')).toBeTruthy();
  });

  it('renders record and rank', () => {
    render(<FighterCard fighter={fighter} />);
    expect(screen.getByText(/28-1/)).toBeTruthy();
    expect(screen.getByText(/CHAMPION/)).toBeTruthy();
  });

  it('renders archetype badge', () => {
    render(<FighterCard fighter={fighter} />);
    expect(screen.getByText('WRESTLER')).toBeTruthy();
  });

  it('renders up to 2 modifier badges', () => {
    render(<FighterCard fighter={fighter} />);
    expect(screen.getByText('SOUTHPAW')).toBeTruthy();
    expect(screen.getByText('VOLUME STRIKER')).toBeTruthy();
  });

  it('shows only first 2 mods when fighter has more', () => {
    const f = { ...fighter, mods: ['SOUTHPAW', 'KO POWER', 'CARDIO CONCERN'] };
    render(<FighterCard fighter={f} />);
    expect(screen.getByText('SOUTHPAW')).toBeTruthy();
    expect(screen.getByText('KO POWER')).toBeTruthy();
    expect(screen.queryByText('CARDIO CONCERN')).toBeNull();
  });

  it('renders initials when no portrait', () => {
    render(<FighterCard fighter={fighter} />);
    expect(screen.getByText('IM')).toBeTruthy();
  });

  it('renders portrait img when portrait is set', () => {
    const f = { ...fighter, portrait: 'makhachev.jpg' };
    render(<FighterCard fighter={f} />);
    const img = document.querySelector('.fighter-card-portrait img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('alt')).toBe('Islam Makhachev');
    expect(img.getAttribute('src')).toContain('makhachev.jpg');
  });

  it('renders without onClick — no role or aria-pressed', () => {
    render(<FighterCard fighter={fighter} />);
    const card = document.querySelector('.fighter-card');
    expect(card.getAttribute('role')).toBeNull();
    expect(card.getAttribute('aria-pressed')).toBeNull();
  });

  it('adds role=button and aria-pressed when onClick provided', () => {
    render(<FighterCard fighter={fighter} onClick={() => {}} isSelected={false} />);
    const card = document.querySelector('.fighter-card');
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('aria-pressed')).toBe('false');
  });

  it('reflects isSelected in class and aria-pressed', () => {
    render(<FighterCard fighter={fighter} onClick={() => {}} isSelected={true} />);
    const card = document.querySelector('.fighter-card');
    expect(card.className).toContain('selected');
    expect(card.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FighterCard fighter={fighter} onClick={onClick} />);
    fireEvent.click(document.querySelector('.fighter-card'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onClick on Enter keydown', () => {
    const onClick = vi.fn();
    render(<FighterCard fighter={fighter} onClick={onClick} />);
    fireEvent.keyDown(document.querySelector('.fighter-card'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('handles fighter with no mods gracefully', () => {
    const f = { ...fighter, mods: [] };
    render(<FighterCard fighter={f} />);
    expect(screen.getByText('Islam Makhachev')).toBeTruthy();
  });

  it('handles unknown archetype gracefully', () => {
    const f = { ...fighter, archetype: 'UNKNOWN_TYPE' };
    render(<FighterCard fighter={f} />);
    expect(screen.getByText('UNKNOWN_TYPE')).toBeTruthy();
  });
});
