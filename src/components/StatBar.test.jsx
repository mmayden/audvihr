import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatBar } from './StatBar';

describe('StatBar', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatBar val={50} max={100} color="var(--accent)" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('sets fill width as a percentage of val/max', () => {
    const { container } = render(<StatBar val={75} max={100} color="red" />);
    const fill = container.querySelector('.srl-fill');
    expect(fill.style.width).toBe('75%');
  });

  it('clamps fill to 100% when val exceeds max', () => {
    const { container } = render(<StatBar val={150} max={100} color="red" />);
    const fill = container.querySelector('.srl-fill');
    expect(fill.style.width).toBe('100%');
  });

  it('applies the provided color to the fill', () => {
    const { container } = render(<StatBar val={50} max={100} color="var(--green)" />);
    const fill = container.querySelector('.srl-fill');
    expect(fill.style.background).toBe('var(--green)');
  });

  it('renders zero fill when val is 0', () => {
    const { container } = render(<StatBar val={0} max={100} color="red" />);
    const fill = container.querySelector('.srl-fill');
    expect(fill.style.width).toBe('0%');
  });
});
