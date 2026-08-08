import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel" style={{
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          minHeight: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(242, 172, 172, 0.1)',
            border: '1px solid var(--accent-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={32} style={{ color: 'var(--accent-2)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', color: 'var(--accent-2)', marginBottom: '0.5rem' }}>
              SOMETHING WENT WRONG
            </h2>
            <p style={{ color: 'var(--base-muted)', maxWidth: '400px', fontSize: '0.95rem' }}>
              An unexpected error occurred. Please try resetting the application.
            </p>
            {this.state.error && (
              <pre style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'var(--base-200)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'DM Mono, monospace',
                color: 'var(--accent-2)',
                maxWidth: '500px',
                overflowX: 'auto'
              }}>
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              background: 'var(--accent-2)',
              color: '#0a0a0a',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textTransform: 'uppercase'
            }}
          >
            <RefreshCw size={16} /> RESET APPLICATION
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
