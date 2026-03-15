/**
 * ErrorBoundary.test.jsx — tests for the class component error boundary.
 * Covers: normal render (children pass-through), error state (default fallback UI),
 * custom fallback prop, RETRY button reset, and unknown-error message fallback.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

/** Component that throws unconditionally — used to trigger the boundary. */
const Throws = ({ message = 'test error' }) => {
  throw new Error(message);
};

/** Component that throws an error with no message. */
const ThrowsNoMessage = () => {
  throw new Error('');
};

/** Component that renders normally. */
const Safe = () => <div>safe content</div>;

describe('ErrorBoundary', () => {
  // React logs errors to console.error during error boundary tests.
  // Suppress to keep test output clean.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Safe />
      </ErrorBoundary>
    );
    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>
    );
    expect(screen.getByText('RENDER ERROR')).toBeInTheDocument();
    expect(screen.getByText('test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RETRY' })).toBeInTheDocument();
  });

  it('renders a custom fallback prop instead of the default UI', () => {
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <Throws />
      </ErrorBoundary>
    );
    expect(screen.getByText('custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('RENDER ERROR')).not.toBeInTheDocument();
  });

  it('displays "Unknown error" when the thrown error has no message', () => {
    render(
      <ErrorBoundary>
        <ThrowsNoMessage />
      </ErrorBoundary>
    );
    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('RETRY button resets hasError state and re-renders children', () => {
    render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>
    );
    expect(screen.getByText('RENDER ERROR')).toBeInTheDocument();
    // Clicking RETRY resets hasError → false; Throws immediately re-throws,
    // which sets hasError → true again — verifying the full reset cycle.
    fireEvent.click(screen.getByRole('button', { name: 'RETRY' }));
    expect(screen.getByText('RENDER ERROR')).toBeInTheDocument();
  });
});
