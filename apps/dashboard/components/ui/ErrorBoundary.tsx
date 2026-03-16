'use client'
import React from 'react'

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '40px',
      }}>
        <div style={{
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '480px',
          textAlign: 'center' as const,
        }}>
          {/* icon */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(248,113,113,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '24px',
          }}>
            ⚠
          </div>

          <h2 style={{
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '20px',
            color: '#f87171', letterSpacing: '-0.03em', marginBottom: '12px',
          }}>
            Something went wrong
          </h2>

          <p style={{
            fontFamily: 'var(--sans)', fontSize: '14px', color: '#6868a0',
            lineHeight: 1.7, marginBottom: '8px',
          }}>
            An unexpected error occurred while rendering this page.
          </p>

          {this.state.error && (
            <pre style={{
              fontFamily: 'var(--mono)', fontSize: '11px', color: '#f87171',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.12)',
              borderRadius: '8px', padding: '12px',
              textAlign: 'left' as const,
              overflow: 'auto', maxHeight: '120px',
              marginBottom: '24px',
              whiteSpace: 'pre-wrap' as const,
              wordBreak: 'break-word' as const,
            }}>
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600,
              padding: '10px 28px', borderRadius: '8px',
              background: '#6366f1', color: '#fff', border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(99,102,241,0.28)',
              transition: 'all 200ms',
            }}
            onMouseOver={e => {
              (e.target as HTMLButtonElement).style.background = '#4f52d4';
              (e.target as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(99,102,241,0.45)'
            }}
            onMouseOut={e => {
              (e.target as HTMLButtonElement).style.background = '#6366f1';
              (e.target as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(99,102,241,0.28)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
}
