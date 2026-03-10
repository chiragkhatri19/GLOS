import Link from 'next/link'
import { readContextFile } from '@/lib/context-reader'
import { ContextTable } from './ContextTable'

export default function ContextPage() {
  const context = readContextFile()

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Context Map
        </h1>
        {context ? (
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
            <span style={{ color: 'var(--primary)' }}>{context.keys_mapped}</span> keys across{' '}
            <span style={{ color: 'var(--cyan)' }}>{context.routes_analyzed}</span> routes — click a row to expand occurrences
          </p>
        ) : (
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
            No context file found.{' '}
            <Link href="/settings" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Run a capture →
            </Link>
          </p>
        )}
      </div>

      {context ? (
        <ContextTable context={context} />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          gap: '16px',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '48px', color: 'var(--text-3)' }}>◎</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--text-2)' }}>
            No context file
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-3)', textAlign: 'center', maxWidth: '360px' }}>
            Run <code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>glos capture --url http://localhost:3001</code> or use the Settings page to generate a context map.
          </div>
          <Link href="/settings" style={{
            marginTop: '8px',
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '7px',
            textDecoration: 'none',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
          }}>
            Go to Settings →
          </Link>
        </div>
      )}
    </div>
  )
}

