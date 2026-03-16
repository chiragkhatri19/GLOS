'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const LOCALES = [
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'de', name: 'German',   flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic',   flag: '🇸🇦' },
  { code: 'fr', name: 'French',   flag: '🇫🇷' },
  { code: 'es', name: 'Spanish',  flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese',  flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi',    flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ko', name: 'Korean',   flag: '🇰🇷' },
  { code: 'it', name: 'Italian',  flag: '🇮🇹' },
]

interface Score {
  key: string
  locale: string
  source_en?: string
  before?: string
  after?: string
  translated: string
  status: 'translated' | 'missing'
  tone: string
  ambiguity_score: number
  context_hint?: string
  improvement_percent?: number
}

interface QualityData {
  scores: Score[]
  total_keys: number
  average_improvement: number
  by_locale: Record<string, number>
}

// ── Summary bar ─────────────────────────────────────────────────────────────
function SummaryBar({ data }: { data: QualityData }) {
  const translatedCount = data.scores.filter(s => s.status === 'translated').length
  const missingCount = data.scores.filter(s => s.status === 'missing').length
  const localesWithTranslations = Object.keys(data.by_locale).filter(l => data.by_locale[l] > 0).length
  
  // Calculate improvement stats - count how many have before/after differences
  const improvedCount = data.scores.filter(s => 
    s.status === 'translated' && 
    s.before && s.after && 
    s.before !== s.after &&
    s.before !== 'Missing' &&
    s.after !== 'Missing'
  ).length
  
  const totalTranslated = data.scores.filter(s => s.status === 'translated').length
  const improvementPercent = totalTranslated > 0 
    ? Math.round((improvedCount / totalTranslated) * 100) 
    : 0

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px',
    }}>
      {[
        { label: 'Total Keys', value: data.total_keys, color: 'var(--text)', sub: 'translation keys processed' },
        { label: 'Translated', value: translatedCount, color: 'var(--green)', sub: 'successfully translated' },
        { label: 'Context Improved', value: `${improvementPercent}%`, color: 'var(--lime)', sub: `${improvedCount} keys enhanced with context` },
        { label: 'Active Locales', value: localesWithTranslations, color: 'var(--cyan)', sub: 'with translations' },
      ].map(({ label, value, color, sub }) => (
        <Card key={label} style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '36px', fontWeight: 700, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)', marginTop: '6px' }}>
            {sub}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Locale section header ───────────────────────────────────────────────────
function LocaleSection({ locale, scores, avg }: { locale: typeof LOCALES[0]; scores: Score[]; avg: number }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? scores : scores.slice(0, 5)

  if (scores.length === 0) return null

  return (
    <div className="fade-up" style={{ marginBottom: '24px' }}>
      {/* Locale header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: expanded ? 'var(--r-lg) var(--r-lg) 0 0' : 'var(--r-lg)',
        borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 150ms',
      }}
      onClick={() => setExpanded(e => !e)}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
      >
        <span style={{ fontSize: '18px' }}>{locale.flag}</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>{locale.name}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', marginLeft: '10px' }}>{locale.code.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)' }}>{scores.length} key{scores.length !== 1 ? 's' : ''}</span>
          <Badge variant={avg >= 80 ? 'green' : avg >= 50 ? 'cyan' : 'muted'} size="sm">
            {avg}% coverage
          </Badge>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Rows */}
      {expanded && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 var(--r-lg) var(--r-lg)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 100px',
            padding: '8px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}>
            {['KEY', 'ENGLISH SOURCE', 'TRANSLATION', 'STATUS'].map((h, i) => (
              <span key={i} style={{ fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-3)' }}>{h}</span>
            ))}
          </div>

          {shown.map((s, i) => {
            return (
              <div key={i} className="row-hover" style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 100px',
                padding: '12px 20px', alignItems: 'center',
                borderBottom: i < shown.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 120ms',
              }}>
                {/* Key */}
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{s.key}</div>
                </div>
                
                {/* English Source */}
                <div style={{ paddingRight: '12px' }}>
                  <div style={{ 
                    fontFamily: 'var(--sans)', 
                    fontSize: '13px', 
                    color: 'var(--text)',
                    lineHeight: 1.5,
                    padding: '8px 12px',
                    background: 'var(--surface-2)',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                  }}>
                    {s.source_en || s.key}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <Badge variant="muted" size="xs">{s.tone}</Badge>
                    <Badge variant="muted" size="xs">⚡ {s.ambiguity_score}/10</Badge>
                  </div>
                </div>
                
                {/* Translation */}
                <div style={{ paddingRight: '12px' }}>
                  {s.status === 'translated' ? (
                    <div style={{ 
                      fontFamily: 'var(--sans)', 
                      fontSize: '13px', 
                      color: 'var(--cyan)',
                      lineHeight: 1.5,
                      padding: '8px 12px',
                      background: 'var(--cyan-dim)',
                      borderRadius: '6px',
                      border: '1px solid rgba(34,211,238,0.2)',
                    }}>
                      {s.translated}
                    </div>
                  ) : (
                    <div style={{ 
                      fontFamily: 'var(--sans)', 
                      fontSize: '13px', 
                      color: 'var(--text-3)',
                      fontStyle: 'italic',
                      padding: '8px 12px',
                      background: 'var(--surface-2)',
                      borderRadius: '6px',
                      border: '1px dashed var(--border)',
                    }}>
                      ⚠️ Missing translation
                    </div>
                  )}
                </div>
                
                {/* Status */}
                <div>
                  <Badge 
                    variant={s.status === 'translated' ? 'green' : 'muted'}
                    size="sm"
                  >
                    {s.status === 'translated' ? '✓ Done' : 'Missing'}
                  </Badge>
                </div>
              </div>
            )
          })}

          {/* Show more */}
          {scores.length > 5 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <button
                onClick={e => { e.stopPropagation(); setExpanded(true) }}
                style={{
                  fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--primary)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                {expanded ? null : `▼ Show ${scores.length - 5} more`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Pipeline summary ────────────────────────────────────────────────────────
function PipelineSummary({ data }: { data: QualityData }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '20px 24px',
      marginBottom: '28px',
      display: 'flex', alignItems: 'flex-start', gap: '12px',
    }}>
      <span style={{ color: 'var(--primary)', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>◈</span>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>
          Context-Aware Translation Applied
        </div>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          glos analyzed your app's UI screenshots to understand the context of each text element — 
          whether it appears on a button, heading, form label, or error message. This visual context 
          was injected into the translation process, resulting in translations that naturally fit 
          your interface design and user experience across all{' '}
          <strong style={{ color: 'var(--text)' }}>{Object.keys(data.by_locale).length} locales</strong>.
        </p>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<QualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fixingAll, setFixingAll] = useState(false)
  const [fixAllProgress, setFixAllProgress] = useState<{ locale: string; status: string } | null>(null)

  useEffect(() => {
    fetch('/api/quality?locales=ja,de,ar,fr,es,zh,hi,pt,ko,it')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleFixAll = async () => {
    setFixingAll(true)
    setFixAllProgress({ locale: 'Starting...', status: 'initializing' })
    
    try {
      const locales = Object.keys(data?.by_locale || {})
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locales }),
      })
      
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
        
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(5))
            if (event.type === 'locale_start') {
              setFixAllProgress({ 
                locale: event.locale.toUpperCase(), 
                status: `Pass ${event.pass} of 2` 
              })
            } else if (event.type === 'locale_done') {
              setFixAllProgress({ 
                locale: event.locale.toUpperCase(), 
                status: '✓ Complete' 
              })
            }
          } catch {}
        }
      }
      
      // Refresh data after fix
      const newData = await fetch('/api/quality?locales=ja,de,ar,fr,es,zh,hi,pt,ko,it').then(r => r.json())
      setData(newData)
      setFixAllProgress({ locale: 'All done!', status: 'complete' })
    } catch (err) {
      console.error('Fix All error:', err)
      setFixAllProgress({ locale: 'Error', status: 'failed' })
    } finally {
      setFixingAll(false)
      setTimeout(() => setFixAllProgress(null), 3000)
    }
  }

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <button
              onClick={() => router.push('/dashboard/quality')}
              style={{
                fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              ← Quality
            </button>
            <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>/</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--primary)' }}>Results</span>
          </div>
          <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '26px', letterSpacing: '-0.02em' }}>
            Translation Results
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '5px' }}>
            All translations generated with visual UI context analysis
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard/quality')} style={{
            fontFamily: 'var(--mono)', fontSize: '12px',
            padding: '9px 18px', borderRadius: 'var(--r)', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-2)', cursor: 'pointer',
          }}>← Back to Quality</button>
          <button onClick={() => router.push('/dashboard')} style={{
            fontFamily: 'var(--mono)', fontSize: '12px',
            padding: '9px 18px', borderRadius: 'var(--r)', border: 'none',
            background: 'var(--primary)', color: '#fff', cursor: 'pointer',
            boxShadow: 'var(--primary-glow)',
          }}>◈ Overview</button>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {[...Array(4)].map((_, i) => <Card key={i} style={{ padding: '20px' }}><Skeleton className="h-[60px] w-full" /></Card>)}
          </div>
          <Card style={{ padding: '20px' }}><Skeleton className="h-[80px] w-full" /></Card>
          <Card style={{ padding: '20px' }}><Skeleton className="h-[200px] w-full" /></Card>
        </div>
      )}

      {/* ── No data ─────────────────────────────────────────────────── */}
      {!loading && (!data || data.total_keys === 0) && (
        <Card style={{ padding: '64px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '28px', color: 'var(--text-3)', marginBottom: '16px' }}>⚡</div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text-2)', marginBottom: '8px' }}>No results yet</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-3)', marginBottom: '24px' }}>
            Run Fix All on the Quality page to generate translation results
          </p>
          <button
            onClick={() => router.push('/dashboard/quality')}
            style={{
              fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500,
              padding: '10px 24px', borderRadius: 'var(--r)', border: 'none',
              background: 'var(--primary)', color: '#fff', cursor: 'pointer',
              boxShadow: 'var(--primary-glow)',
            }}
          >⚡ Go to Quality → Fix All</button>
        </Card>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {!loading && data && data.total_keys > 0 && (
        <>
          <SummaryBar data={data} />
          
          {/* Fix All Button */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '28px', padding: '16px 20px',
            background: fixingAll ? 'rgba(163,230,53,0.1)' : 'var(--surface)',
            border: fixingAll ? '2px solid var(--primary)' : '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{fixingAll ? '⚡' : '🔧'}</span>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                  {fixingAll ? 'Fixing all translations...' : 'Fix All Translations'}
                </div>
                {fixAllProgress ? (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: fixingAll ? 'var(--primary)' : 'var(--text-3)' }}>
                    {fixAllProgress.locale} — {fixAllProgress.status}
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)' }}>
                    Apply context-aware fixes to all locales at once
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleFixAll}
              disabled={fixingAll}
              style={{
                fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600,
                padding: '10px 24px', borderRadius: 'var(--r)',
                border: 'none',
                background: fixingAll ? 'var(--primary)' : 'var(--primary)',
                color: '#fff', cursor: fixingAll ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--primary-glow)',
                opacity: fixingAll ? 0.7 : 1,
              }}
            >
              {fixingAll ? '⏳ Processing...' : '⚡ Fix All'}
            </button>
          </div>

          <PipelineSummary data={data} />

          {/* ── Per-locale sections ── */}
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-3)' }}>
              Translations by locale — click to expand
            </div>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)' }}>
              {data.total_keys} total keys across {Object.keys(data.by_locale).length} locales
            </span>
          </div>

          {LOCALES.map(locale => {
            const scores = data.scores.filter(s => s.locale === locale.code)
            const avg = data.by_locale[locale.code] ?? 0
            return <LocaleSection key={locale.code} locale={locale} scores={scores} avg={avg} />
          })}

          {/* ── Footer action ── */}
          <div className="fade-up" style={{
            marginTop: '12px', padding: '16px 20px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', marginBottom: '2px' }}>
                Context-aware translations applied
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)' }}>
                All translations include visual UI context for better accuracy
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => router.push('/dashboard/context')} style={{
                fontFamily: 'var(--mono)', fontSize: '12px',
                padding: '9px 18px', borderRadius: 'var(--r)', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-2)', cursor: 'pointer',
              }}>◎ Context Map</button>
              <button onClick={() => router.push('/dashboard/quality')} style={{
                fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 500,
                padding: '9px 18px', borderRadius: 'var(--r)', border: 'none',
                background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                boxShadow: 'var(--primary-glow)',
              }}>⚡ Quality view</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
