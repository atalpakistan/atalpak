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
    console.error('[ATAL ErrorBoundary] Uncaught Error caught by boundary:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      // Clear corrupt sessions if any
      const savedCust = localStorage.getItem('atal_customer');
      if (savedCust === 'undefined' || savedCust === 'null') {
        localStorage.removeItem('atal_customer');
      }
      const savedStaff = localStorage.getItem('atal_staff_user');
      if (savedStaff === 'undefined' || savedStaff === 'null') {
        localStorage.removeItem('atal_staff_user');
      }
    } catch {}
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
          padding: '2rem',
          backgroundColor: '#062419',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '28rem',
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
            }}>ATAL Store - Quick Refresh</h1>
            <p style={{
              fontSize: '0.8125rem',
              color: '#475569',
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              The application encountered a display refresh state. Click below to reload ATAL Store smoothly.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              🔄 Reload ATAL Store
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
