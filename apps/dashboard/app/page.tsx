import Link from 'next/link'
import { readContextFile, resolveMessagesDir } from '@/lib/context-reader'
import { calculateQualityReport } from '@/lib/quality-calculator'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { ContextFile } from '@/lib/types'

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}) {
  return (
    <Card accent={accent} style={{ padding: '28px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '52px', fontWeight: 600, color: accent ? 'var(--primary)' : 'var(--text)', lineHeight: 1, marginTop: '16px' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', marginTop: '10px' }}>
          {sub}
        </div>
      )}
    </Card>
  )
}

export default async function OverviewPage() {
  const context: ContextFile | null = readContextFile()
  const messagesDir = resolveMessagesDir()
  const report = messagesDir ? calculateQualityReport(messagesDir, ['ja', 'de', 'ar']) : null

  const routesAnalyzed = context?.routes_analyzed ?? 0
  const keysMapped = context?.keys_mapped ?? 0
  const avgImprovement = report?.average_improvement ?? 0
  const localeCount = report ? Object.keys(report.by_locale).length : 0
  const topScores = report?.scores.slice(0, 8) ?? []
  const hasData = !!context

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Overview
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
          {hasData
            ? `Last capture: ${new Date(context!.generated).toLocaleString()} · ${context!.app_url}`
            : 'No context file found — run a capture to get started.'}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '36px' }}>
        <StatCard label="Routes Analyzed" value={routesAnalyzed} sub="pages captured" />
        <StatCard label="Keys Mapped" value={keysMapped} sub="translation keys" />
        <StatCard label="Avg Improvement" value={avgImprovement > 0 ? `+${avgImprovement}%` : '—'} sub="vs blind translation" accent={avgImprovement > 0} />
        <StatCard label="Locales Active" value={localeCount || '—'} sub="with before/after data" />
      </div>

      {/* Bottom grid: top improvements + status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Top improvements */}
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>Top Improvements</span>
            <Link href="/quality" style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--primary)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {topScores.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Key', 'Locale', 'Before', 'After', 'Δ'].map(h => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topScores.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 24px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{s.key}</td>
                    <td style={{ padding: '12px 24px' }}><Badge variant="muted">{s.locale}</Badge></td>
                    <td style={{ padding: '12px 24px', fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--red)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.before}</td>
                    <td style={{ padding: '12px 24px', fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.after}</td>
                    <td style={{ padding: '12px 24px' }}><Badge variant="green">+{s.improvement_percent}%</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)', marginBottom: '12px' }}>
                No translation data yet
              </div>
              <Link href="/settings" style={{
                display: 'inline-block',
                background: 'var(--primary-dim)',
                color: 'var(--primary)',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}>
                Run capture →
              </Link>
            </div>
          )}
        </Card>

        {/* Status panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Pipeline status */}
          <Card style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Pipeline Status
            </div>
            {[
              { label: 'Context File', ok: !!context },
              { label: 'Messages Dir', ok: !!messagesDir },
              { label: 'Quality Data', ok: (report?.scores.length ?? 0) > 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)' }}>{item.label}</span>
                <Badge variant={item.ok ? 'green' : 'red'}>{item.ok ? 'ready' : 'missing'}</Badge>
              </div>
            ))}
          </Card>

          {/* Locale breakdown */}
          {report && Object.keys(report.by_locale).length > 0 && (
            <Card style={{ padding: '20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                By Locale
              </div>
              {Object.entries(report.by_locale).map(([locale, pct]) => (
                <div key={locale} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-2)' }}>{locale}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--primary)' }}>+{pct}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--surface-3)', borderRadius: '999px' }}>
                    <div style={{ height: '3px', width: `${Math.min(pct * 2, 100)}%`, background: 'var(--primary)', borderRadius: '999px', transition: 'width 600ms ease' }} />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Quick actions */}
          <Card style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Quick Actions
            </div>
            <Link href="/settings" style={{
              display: 'block',
              padding: '10px 14px',
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: '7px',
              textDecoration: 'none',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              textAlign: 'center',
              marginBottom: '8px',
            }}>
              ◎ Run Capture
            </Link>
            <Link href="/settings" style={{
              display: 'block',
              padding: '10px 14px',
              background: 'var(--surface-3)',
              color: 'var(--text-2)',
              borderRadius: '7px',
              textDecoration: 'none',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              textAlign: 'center',
            }}>
              ◐ Run Translate
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

