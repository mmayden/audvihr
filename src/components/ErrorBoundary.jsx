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
        <div className="error-fallback">
          <div className="error-fallback-icon">⚠</div>
          <div className="error-fallback-title">RENDER ERROR</div>
          <div className="error-fallback-message">{this.state.message}</div>
          <button
            className="error-fallback-btn"
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
