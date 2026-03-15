import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FighterName } from './FighterName';

describe('FighterName', () => {
  it('renders a clickable link when the fighter exists in the roster', () => {
    const onGoFighter = vi.fn();
    render(<FighterName name="Islam Makhachev" onGoFighter={onGoFighter} />);
    const link = screen.getByText('Islam Makhachev');
    expect(link).toHaveClass('fighter-link');
  });

  it('calls onGoFighter with the fighter object when the link is clicked', () => {
    const onGoFighter = vi.fn();
    render(<FighterName name="Islam Makhachev" onGoFighter={onGoFighter} />);
    fireEvent.click(screen.getByText('Islam Makhachev'));
    expect(onGoFighter).toHaveBeenCalledOnce();
    expect(onGoFighter.mock.calls[0][0]).toMatchObject({ name: 'Islam Makhachev' });
  });

  it('renders plain text when the fighter is not in the roster', () => {
    const onGoFighter = vi.fn();
    render(<FighterName name="Unknown Fighter" onGoFighter={onGoFighter} />);
    const el = screen.getByText('Unknown Fighter');
    expect(el.tagName).toBe('SPAN');
    expect(el).not.toHaveClass('fighter-link');
  });

  it('does not call onGoFighter for an unknown fighter', () => {
    const onGoFighter = vi.fn();
    render(<FighterName name="Unknown Fighter" onGoFighter={onGoFighter} />);
    fireEvent.click(screen.getByText('Unknown Fighter'));
    expect(onGoFighter).not.toHaveBeenCalled();
  });
});
