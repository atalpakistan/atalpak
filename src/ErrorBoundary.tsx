import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ATAL ErrorBoundary] Caught render exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.hash = '';
      window.history.replaceState(null, '', window.location.pathname || '/');
    } catch (_) {}
    window.location.reload();
  };

  private handleReloadAdmin = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#admin';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: '#062419',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2.5rem 2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            maxWidth: '28rem',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#0f172a'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#ecfdf5',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '2rem'
            }}>🛡️</div>
            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#062419',
              marginBottom: '0.5rem',
              letterSpacing: '0.025em'
            }}>ATAL Store - Display Recovery</h1>
            <p style={{
              fontSize: '0.8125rem',
              color: '#475569',
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              The application encountered a display refresh state. Click below to continue browsing or access the ATAL Admin Portal smoothly.
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.75rem',
                color: '#dc2626',
                textAlign: 'left',
                fontFamily: 'monospace',
                overflowX: 'auto',
                maxHeight: '5rem'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={this.handleReloadAdmin}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                🔐 Open Admin Portal
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🏠 Return to Store Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
