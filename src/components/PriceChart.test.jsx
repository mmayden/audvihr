import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceChart } from './PriceChart';

const SERIES = [
  { t: 1000, p: 0.60 },
  { t: 2000, p: 0.65 },
  { t: 3000, p: 0.62 },
  { t: 4000, p: 0.70 },
];

describe('PriceChart', () => {
  it('renders an SVG when series has 2+ points', () => {
    const { container } = render(<PriceChart series={SERIES} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders the polyline price line', () => {
    const { container } = render(<PriceChart series={SERIES} />);
    // Two polylines: area fill + price line
    const polylines = container.querySelectorAll('polyline');
    expect(polylines.length).toBeGreaterThanOrEqual(1);
  });

  it('renders "NO HISTORY DATA" when series has fewer than 2 points', () => {
    render(<PriceChart series={[{ t: 1, p: 0.5 }]} />);
    expect(screen.getByText('NO HISTORY DATA')).toBeTruthy();
  });

  it('renders "NO HISTORY DATA" for null series', () => {
    render(<PriceChart series={null} />);
    expect(screen.getByText('NO HISTORY DATA')).toBeTruthy();
  });

  it('renders "NO HISTORY DATA" for empty array', () => {
    render(<PriceChart series={[]} />);
    expect(screen.getByText('NO HISTORY DATA')).toBeTruthy();
  });

  it('renders the label and current price when label is provided', () => {
    render(<PriceChart series={SERIES} label="POLYMARKET — Makhachev" />);
    expect(screen.getByText(/POLYMARKET — Makhachev/)).toBeTruthy();
    expect(screen.getByText(/CURRENT:/)).toBeTruthy();
  });

  it('uses the provided color and height', () => {
    const { container } = render(
      <PriceChart series={SERIES} color="var(--green)" height={56} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // Height prop is reflected in the SVG height attribute
    expect(svg.getAttribute('style')).toContain('56');
  });

  it('renders a terminal dot at the last data point', () => {
    const { container } = render(<PriceChart series={SERIES} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
  });

  it('renders a 50% reference dashed line', () => {
    const { container } = render(<PriceChart series={SERIES} />);
    const dashed = container.querySelector('line[stroke-dasharray]');
    expect(dashed).toBeTruthy();
  });
});
