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
    try {
      localStorage.removeItem('atal_staff_user');
      localStorage.removeItem('atal_customer');
      localStorage.removeItem('atal_wishlist');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
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
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            maxWidth: '26rem',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#0f172a'
          }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              backgroundColor: '#ecfdf5',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.75rem'
            }}>🛍️</div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#062419',
              marginBottom: '0.5rem',
              letterSpacing: '0.025em'
            }}>ATAL Store</h1>
            <p style={{
              fontSize: '0.8125rem',
              color: '#475569',
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              We encountered a temporary display state. Click below to continue browsing ATAL Store smoothly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={this.handleReset}
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
