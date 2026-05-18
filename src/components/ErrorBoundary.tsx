'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Defaults to the built-in recovery screen. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message:  string;
}

/**
 * ErrorBoundary — catches any unhandled render error in its subtree and
 * shows a recovery UI instead of a blank / broken screen.
 *
 * Used at the root layout level so the entire app has a safety net.
 *
 * React requires error boundaries to be *class* components.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Unknown error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in all envs; swap for a monitoring service (Sentry, etc.) in production.
    console.error('[BarFlow ErrorBoundary]', error, info.componentStack);
  }

  private handleReload = () => {
    // Reset state first, then reload so the boundary re-mounts cleanly.
    this.setState({ hasError: false, message: '' }, () => window.location.reload());
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '100dvh', backgroundColor: '#0B0F14',
            padding: '24px', gap: '20px', textAlign: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: '52px', lineHeight: 1 }}>⚠️</div>

          {/* Heading */}
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '13px', color: '#4A5B72', marginTop: '6px' }}>
              BarFlow hit an unexpected error. Your offline orders are safe.
            </p>
          </div>

          {/* Error message (collapsed) */}
          {this.state.message && (
            <code
              style={{
                display: 'block', maxWidth: '480px', width: '100%',
                backgroundColor: '#111827', border: '1px solid #1E2A3A',
                borderRadius: '10px', padding: '10px 14px',
                fontSize: '11px', color: '#8B9BB4', textAlign: 'left',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}
            >
              {this.state.message}
            </code>
          )}

          {/* Reload button */}
          <button
            onClick={this.handleReload}
            style={{
              padding: '14px 32px', borderRadius: '12px', fontWeight: 700,
              fontSize: '15px', cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
              color: '#0B0F14',
              boxShadow: '0 0 24px rgba(0,212,255,0.35)',
            }}
          >
            Reload BarFlow
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
