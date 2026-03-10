import Link from 'next/link'
import { resolveMessagesDir } from '@/lib/context-reader'
import { calculateQualityReport } from '@/lib/quality-calculator'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { QualityChart } from './QualityChart'

export default function QualityPage() {
  const messagesDir = resolveMessagesDir()
  const report = messagesDir ? calculateQualityReport(messagesDir, ['ja', 'de', 'ar']) : null

  const chartData = report
    ? Object.entries(report.by_locale).map(([locale, improvement]) => ({ locale, improvement }))
    : []

  if (!report || report.scores.length === 0) {
    return (
      <div className="fade-up">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Quality
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
            Before/after translation quality comparison
          </p>
        </div>
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
          <div style={{ fontFamily: 'var(--mono)', fontSize: '48px', color: 'var(--text-3)' }}>◐</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--text-2)' }}>No quality data yet</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-3)', textAlign: 'center', maxWidth: '400px' }}>
            Run a capture + translate cycle to generate before/after comparison data. Quality scores appear once{' '}
            <code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>{'{locale}.before.json'}</code> files exist alongside translated locale files.
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
            Run pipeline →
          </Link>
        </div>
      </div>
    )
  }

  const topScores = report.scores.slice(0, 20)

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Quality
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
          <span style={{ color: 'var(--primary)' }}>{report.scores.length}</span> keys improved ·{' '}
          <span style={{ color: 'var(--green)' }}>+{report.average_improvement}%</span> average vs blind translation
        </p>
      </div>

      {/* Top row: locale stat cards + chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Locale stat cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              By Locale
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {Object.entries(report.by_locale).map(([locale, pct]) => (
                <div key={locale} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    {locale}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 600, color: 'var(--primary)' }}>
                    +{pct}%
                  </div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>
                    {report.scores.filter(s => s.locale === locale).length} keys
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Overall Average
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '52px', fontWeight: 600, color: 'var(--green)', lineHeight: 1 }}>
                +{report.average_improvement}%
              </span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)' }}>
                improvement vs blind translation
              </span>
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-3)', marginTop: '8px' }}>
              Across {report.total_keys} total keys · {Object.keys(report.by_locale).length} locales
            </div>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
              Improvement by Locale
            </div>
            <QualityChart data={chartData} />
          </Card>
        )}
      </div>

      {/* Full scores table */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>
            Score Details
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)' }}>
            top {topScores.length} of {report.scores.length}
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Key', 'Locale', 'Before (blind)', 'After (glos)', 'Δ'].map(h => (
                <th key={h} style={{
                  padding: '10px 24px',
                  textAlign: 'left',
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topScores.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 24px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>
                  {s.key}
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <Badge variant="muted">{s.locale}</Badge>
                </td>
                <td style={{ padding: '12px 24px', fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--red)', maxWidth: '200px' }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.before}
                  </span>
                </td>
                <td style={{ padding: '12px 24px', fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text)', maxWidth: '220px' }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.after}
                  </span>
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <Badge variant={s.improvement_percent >= 20 ? 'green' : s.improvement_percent >= 10 ? 'cyan' : 'amber'}>
                    +{s.improvement_percent}%
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

