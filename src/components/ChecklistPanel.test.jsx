import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistPanel } from './ChecklistPanel';
import { CHECKLIST } from '../constants/checklist';

beforeEach(() => localStorage.clear());

describe('ChecklistPanel', () => {
  it('renders without crashing', () => {
    render(<ChecklistPanel storageKey="test" />);
    expect(screen.getByText('TRADE CHECKLIST')).toBeInTheDocument();
  });

  it('renders all 17 checklist items', () => {
    render(<ChecklistPanel storageKey="test" />);
    CHECKLIST.forEach(item => {
      expect(screen.getByText(item.text)).toBeInTheDocument();
    });
  });

  it('renders all 5 category labels', () => {
    render(<ChecklistPanel storageKey="test" />);
    ['MARKET', 'STYLES', 'PHYSICAL', 'RISK', 'METHOD'].forEach(cat => {
      expect(screen.getByText(cat)).toBeInTheDocument();
    });
  });

  it('shows 0/17 progress initially', () => {
    render(<ChecklistPanel storageKey="test" />);
    expect(screen.getByText('0/17')).toBeInTheDocument();
  });

  it('toggles an item checked and updates progress', () => {
    render(<ChecklistPanel storageKey="test" />);
    const firstItem = screen.getByText(CHECKLIST[0].text).closest('.cl-item');
    fireEvent.click(firstItem);
    expect(screen.getByText('1/17')).toBeInTheDocument();
    expect(firstItem.querySelector('.cl-box')).toHaveClass('checked');
  });

  it('toggles item back to unchecked on second click', () => {
    render(<ChecklistPanel storageKey="test" />);
    const firstItem = screen.getByText(CHECKLIST[0].text).closest('.cl-item');
    fireEvent.click(firstItem);
    fireEvent.click(firstItem);
    expect(screen.getByText('0/17')).toBeInTheDocument();
    expect(firstItem.querySelector('.cl-box')).not.toHaveClass('checked');
  });

  it('reset button clears all checked items', () => {
    render(<ChecklistPanel storageKey="test" />);
    // Check a few items
    [CHECKLIST[0], CHECKLIST[1], CHECKLIST[2]].forEach(item => {
      fireEvent.click(screen.getByText(item.text).closest('.cl-item'));
    });
    expect(screen.getByText('3/17')).toBeInTheDocument();
    fireEvent.click(screen.getByText('RESET'));
    expect(screen.getByText('0/17')).toBeInTheDocument();
  });

  it('persists checked state to localStorage', () => {
    render(<ChecklistPanel storageKey="persist_test" />);
    fireEvent.click(screen.getByText(CHECKLIST[0].text).closest('.cl-item'));
    const stored = JSON.parse(localStorage.getItem('cl_persist_test'));
    expect(stored[CHECKLIST[0].id]).toBe(true);
  });

  it('uses distinct localStorage keys for different storageKey props', () => {
    const { unmount } = render(<ChecklistPanel storageKey="matchup_1_2" />);
    fireEvent.click(screen.getByText(CHECKLIST[0].text).closest('.cl-item'));
    unmount();

    render(<ChecklistPanel storageKey="matchup_3_4" />);
    // Second panel should start fresh
    expect(screen.getByText('0/17')).toBeInTheDocument();
  });
});
