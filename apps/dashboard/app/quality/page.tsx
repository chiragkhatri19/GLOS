'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

const LOCALES = ['ja', 'de', 'ar', 'fr', 'es']

interface Score {
  key: string
  locale: string
  before: string
  after: string
  improvement_percent: number
}

interface QualityData {
  scores: Score[]
  average_improvement: number
  by_locale: Record<string, number>
  total_keys: number
}

export default function QualityPage() {
  const [data, setData] = useState<QualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLocale, setActiveLocale] = useState('ja')
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    fetch(`/api/quality?locales=${LOCALES.join(',')}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const visibleScores = data?.scores.filter(s => s.locale === activeLocale) ?? []

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '26px', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Quality
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>
            Before vs after — context-aware translation
          </p>
        </div>
        <button
          onClick={async () => {
            setTranslating(true)
            try {
              await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locales: LOCALES }),
              })
              window.location.reload()
            } finally {
              setTranslating(false)
            }
          }}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            fontWeight: 500,
            padding: '10px 20px',
            borderRadius: '7px',
            border: 'none',
            background: translating ? 'var(--primary-dim)' : 'var(--primary)',
            color: translating ? 'var(--primary)' : '#fff',
            cursor: translating ? 'not-allowed' : 'pointer',
            boxShadow: translating ? 'none' : 'var(--primary-glow)',
            transition: 'all 200ms',
          }}
        >
          {translating ? '◌ Translating...' : '⟳ Run Translate'}
        </button>
      </div>

      {/* Locale tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {LOCALES.map(locale => (
          <button
            key={locale}
            onClick={() => setActiveLocale(locale)}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '13px',
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeLocale === locale ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              color: activeLocale === locale ? 'var(--primary)' : 'var(--text-2)',
              cursor: 'pointer',
              transition: 'all 150ms',
              marginBottom: '-1px',
            }}
          >
            {locale.toUpperCase()}
            {data?.by_locale[locale] !== undefined && (
              <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--cyan)' }}>
                +{data.by_locale[locale]}%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              {['KEY', 'BEFORE (BLIND)', 'AFTER (GLOS)', 'Δ'].map(h => (
                <th key={h} style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontFamily: 'var(--sans)',
                  fontSize: '11px',
                  fontWeight: 500,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  color: 'var(--text-3)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} style={{ padding: '12px 24px' }}>
                    <Skeleton height="32px" />
                  </td>
                </tr>
              ))
            ) : visibleScores.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '60px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)' }}>
                    No data for {activeLocale.toUpperCase()} — click Run Translate
                  </p>
                </td>
              </tr>
            ) : visibleScores.map((score, i) => (
              <tr
                key={i}
                className="fade-up"
                style={{ borderBottom: '1px solid var(--border)', animationDelay: `${i * 30}ms` }}
              >
                <td style={{ padding: '14px 24px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>
                  {score.key}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <Badge variant="red">{score.before}</Badge>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <Badge variant="cyan">{score.after}</Badge>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <Badge variant="primary">+{score.improvement_percent}%</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary bar */}
        {!loading && data && data.total_keys > 0 && (
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-3)' }}>
              {visibleScores.length} keys improved
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '18px', color: 'var(--cyan)' }}>
              +{data.by_locale[activeLocale] ?? 0}% average
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}
