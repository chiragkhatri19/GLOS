'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatCardSkeleton, Skeleton } from '@/components/ui/Skeleton'

interface ContextData {
  routes_analyzed: number
  keys_mapped: number
  app_url: string
  generated: string
  keys: Record<string, any>
}

interface QualityData {
  scores: { key: string; locale: string; before: string; after: string; improvement_percent: number }[]
  average_improvement: number
  by_locale: Record<string, number>
  total_keys: number
}

function Label({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: 'var(--sans)',
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: 'var(--text-3)',
    }}>{children}</div>
  )
}

function StatNumber({ children, color = 'var(--text)' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)',
      fontWeight: 600,
      fontSize: '52px',
      letterSpacing: '-0.03em',
      lineHeight: 1,
      color,
      marginTop: '14px',
    }}>{children}</div>
  )
}

export default function OverviewPage() {
  const [ctx, setCtx] = useState<ContextData | null>(null)
  const [quality, setQuality] = useState<QualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/context').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/quality?locales=ja,de,ar').then(r => r.json()).catch(() => null),
    ]).then(([ctxData, qualityData]) => {
      setCtx(ctxData)
      setQuality(qualityData)
      setLoading(false)
    })
  }, [])

  const chartData = quality?.by_locale
    ? Object.entries(quality.by_locale).map(([locale, improvement]) => ({ locale, improvement }))
    : []

  const topScores = quality?.scores?.slice(0, 8) ?? []

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '26px', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Overview
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>
            {ctx?.app_url ? `Analyzing ${ctx.app_url}` : 'Run capture to begin'}
          </p>
        </div>
        <button
          onClick={async () => {
            const url = prompt('Enter your app URL:', 'http://localhost:3001')
            if (!url) return
            setCapturing(true)
            try {
              const res = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url,
                  routes: ['/en/settings', '/en/checkout', '/en/account', '/en/dashboard'],
                }),
              })
              const data = await res.json()
              if (data.success) {
                window.location.reload()
              } else {
                alert(`Capture failed: ${data.error}`)
              }
            } finally {
              setCapturing(false)
            }
          }}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            fontWeight: 500,
            padding: '10px 20px',
            borderRadius: '7px',
            border: 'none',
            background: capturing ? 'var(--primary-dim)' : 'var(--primary)',
            color: capturing ? 'var(--primary)' : '#fff',
            cursor: capturing ? 'not-allowed' : 'pointer',
            boxShadow: capturing ? 'none' : 'var(--primary-glow)',
            transition: 'all 200ms',
          }}
        >
          {capturing ? '◌ Scanning...' : '▶ Run Capture'}
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {loading ? (
          <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
        ) : (
          <>
            <Card className="fade-up" style={{ padding: '28px', animationDelay: '0ms' }}>
              <Label>ROUTES ANALYZED</Label>
              <StatNumber>{ctx?.routes_analyzed ?? 0}</StatNumber>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>pages captured</p>
            </Card>
            <Card className="fade-up" style={{ padding: '28px', animationDelay: '60ms' }}>
              <Label>KEYS MAPPED</Label>
              <StatNumber>{ctx?.keys_mapped ?? 0}</StatNumber>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>translation keys with context</p>
            </Card>
            <Card className="fade-up" style={{ padding: '28px', animationDelay: '120ms' }}>
              <Label>AVG IMPROVEMENT</Label>
              <StatNumber color="var(--cyan)">+{quality?.average_improvement ?? 0}%</StatNumber>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>vs blind translation</p>
            </Card>
          </>
        )}
      </div>

      {/* Chart */}
      <Card className="fade-up" style={{ padding: '28px', marginBottom: '24px' }}>
        <Label>QUALITY IMPROVEMENT BY LOCALE</Label>
        {loading ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skeleton width="100%" height="160px" />
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)' }}>
              No quality data yet — run capture then translate
            </p>
          </div>
        ) : (
          <div style={{ marginTop: '20px', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="locale"
                  tick={{ fontFamily: 'var(--mono)', fontSize: 12, fill: 'var(--text-2)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: 'var(--mono)', fontSize: 11, fill: 'var(--text-2)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `+${v}%`}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--mono)', fontSize: '12px' }}
                  formatter={(v: any) => [`+${v}%`, 'improvement']}
                  cursor={{ fill: 'var(--surface-3)' }}
                />
                <Bar dataKey="improvement" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? 'var(--primary)' : 'var(--cyan)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Top improved keys table */}
      <Card className="fade-up" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label>TOP IMPROVED KEYS</Label>
          {quality && <Badge variant="primary">+{quality.average_improvement}% avg</Badge>}
        </div>
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} height="44px" />)}
          </div>
        ) : topScores.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)' }}>
              Run translate to see before/after comparison
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>
              glos translate --locales ja,de,ar
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['KEY', 'LOCALE', 'BEFORE', 'AFTER', 'Δ'].map(h => (
                  <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topScores.map((score, i) => (
                <tr key={i} className="fade-up" style={{ borderBottom: '1px solid var(--border)', animationDelay: `${i * 40}ms` }}>
                  <td style={{ padding: '14px 24px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{score.key}</td>
                  <td style={{ padding: '14px 24px' }}><Badge variant="muted">{score.locale}</Badge></td>
                  <td style={{ padding: '14px 24px' }}><Badge variant="red">{score.before}</Badge></td>
                  <td style={{ padding: '14px 24px' }}><Badge variant="cyan">{score.after}</Badge></td>
                  <td style={{ padding: '14px 24px' }}><Badge variant="primary">+{score.improvement_percent}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
