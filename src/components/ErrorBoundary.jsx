import { Component } from 'react';

/**
 * ErrorBoundary — catches render errors in child component trees and displays
 * a fallback UI instead of crashing the entire app.
 * @param {React.ReactNode} children - the component subtree to protect
 * @param {React.ReactNode} [fallback] - custom fallback UI (optional)
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: 12,
          background: 'var(--bg)', color: 'var(--text)',
          fontFamily: 'var(--mono)', fontSize: 13,
        }}>
          <div style={{ fontSize: 28, opacity: .3 }}>⚠</div>
          <div style={{ color: 'var(--red)' }}>RENDER ERROR</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>{this.state.message}</div>
          <button
            style={{ marginTop: 8, padding: '6px 16px', cursor: 'pointer',
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11 }}
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            RETRY
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
