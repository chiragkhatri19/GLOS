'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

type FilterType = 'all' | 'high' | 'multi' | 'single'

interface Occurrence {
  route: string
  element_type: string
  tone: string
  context: string
  nearby_elements: string[]
  page_section: string
}

interface KeyData {
  occurrences: Occurrence[]
}

function toneVariant(tone: string): 'red' | 'amber' | 'cyan' | 'muted' {
  if (tone === 'destructive' || tone === 'urgent') return 'red'
  if (tone === 'formal') return 'amber'
  if (tone === 'casual') return 'cyan'
  return 'muted'
}

function toneColor(tone: string) {
  if (tone === 'destructive' || tone === 'urgent') return 'var(--red)'
  if (tone === 'formal') return 'var(--amber)'
  if (tone === 'casual') return 'var(--cyan)'
  return 'var(--text-2)'
}

function elementIcon(type: string) {
  if (type.includes('button') || type.includes('cta')) return '⬡'
  if (type.includes('head') || type.includes('title')) return '❋'
  if (type.includes('label') || type.includes('form')) return '◧'
  if (type.includes('nav') || type.includes('link')) return '→'
  if (type.includes('error') || type.includes('alert')) return '⚠'
  if (type.includes('placeholder') || type.includes('input')) return '◻'
  return '◈'
}

function riskDot(count: number) {
  if (count >= 3) return { color: 'var(--red)',  label: 'High risk',   glow: 'rgba(248,113,113,0.3)' }
  if (count === 2) return { color: 'var(--amber)', label: 'Multi-ctx',   glow: 'rgba(251,191,36,0.3)'  }
  return               { color: 'var(--cyan)',  label: 'Single',      glow: 'rgba(34,211,238,0.3)'  }
}

const FILTER_LABELS: Record<FilterType, string> = {
  all:    'All keys',
  high:   'High risk',
  multi:  'Multi-context',
  single: 'Single',
}

// ── Occurrence Card ─────────────────────────────────────────────────────────
function OccurrenceCard({ occ, index }: { occ: Occurrence; index: number }) {
  const icon = elementIcon(occ.element_type)
  const tColor = toneColor(occ.tone)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      transition: 'border-color 200ms, box-shadow 200ms',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement
      el.style.borderColor = 'rgba(99,102,241,0.35)'
      el.style.boxShadow = '0 4px 20px rgba(99,102,241,0.06)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement
      el.style.borderColor = 'var(--border)'
      el.style.boxShadow = 'none'
    }}
    >
      {/* Card header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.015)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        {/* Index */}
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'var(--text-3)', flexShrink: 0,
          background: 'var(--surface-3)', border: '1px solid var(--border)',
          borderRadius: '4px', padding: '2px 6px',
        }}>#{index + 1}</span>

        {/* Element type with icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
          <span style={{ color: 'var(--primary)', fontSize: '12px' }}>{icon}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 500,
            color: 'var(--primary)', letterSpacing: '-0.01em',
          }}>{occ.element_type}</span>
        </div>

        {/* Route */}
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'var(--text-3)', background: 'var(--surface-3)',
          border: '1px solid var(--border)', borderRadius: '4px',
          padding: '2px 8px', flexShrink: 0,
        }}>{occ.route}</span>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px' }}>
        {/* Context description */}
        <p style={{
          fontFamily: 'var(--sans)', fontSize: '13px',
          color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px',
        }}>
          {occ.context}
        </p>

        {/* Metadata row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
          {/* Section */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '4px 10px',
          }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: 'var(--text-3)' }}>section</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-2)' }}>{occ.page_section}</span>
          </div>

          {/* Tone */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '4px 10px',
          }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: 'var(--text-3)' }}>tone</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: tColor, fontWeight: 600 }}>{occ.tone}</span>
          </div>
        </div>

        {/* Nearby elements */}
        {occ.nearby_elements?.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: '8px' }}>
              Nearby UI elements
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
              {occ.nearby_elements.map((el, j) => (
                <span key={j} style={{
                  fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-2)',
                  background: 'var(--surface-3)', padding: '3px 9px',
                  borderRadius: '6px', border: '1px solid var(--border)',
                }}>{el}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Multi-context insight ───────────────────────────────────────────────────
function MultiContextInsight({ keyName, data }: { keyName: string; data: KeyData }) {
  if (data.occurrences.length < 2) return null

  const routes = [...new Set(data.occurrences.map(o => o.route))]
  const tones = [...new Set(data.occurrences.map(o => o.tone))]
  const types = [...new Set(data.occurrences.map(o => o.element_type))]
  const hasToneVariation = tones.length > 1
  const hasTypeVariation = types.length > 1

  return (
    <div className="fade-up" style={{
      marginTop: '16px',
      background: data.occurrences.length >= 3
        ? 'rgba(248,113,113,0.04)'
        : 'rgba(99,102,241,0.04)',
      border: `1px solid ${data.occurrences.length >= 3 ? 'rgba(248,113,113,0.15)' : 'rgba(99,102,241,0.12)'}`,
      borderRadius: 'var(--r-lg)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{
          color: data.occurrences.length >= 3 ? 'var(--red)' : 'var(--primary)',
          fontSize: '14px', flexShrink: 0, marginTop: '2px',
        }}>◈</span>
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600,
            color: data.occurrences.length >= 3 ? 'var(--red)' : 'var(--primary)',
            letterSpacing: '0.02em', textTransform: 'uppercase' as const, marginBottom: '8px',
          }}>
            {data.occurrences.length >= 3 ? 'High-risk: Multiple Conflicting Contexts' : 'Multi-context Translation Key'}
          </div>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 10px' }}>
            <strong style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{keyName}</strong> appears {data.occurrences.length} times across{' '}
            {routes.length} route{routes.length > 1 ? 's' : ''}.
            {hasToneVariation && <> The tone varies from <strong style={{ color: 'var(--red)' }}>{tones[0]}</strong> to <strong style={{ color: 'var(--cyan)' }}>{tones[tones.length - 1]}</strong> — a blind translator would pick one and get the others wrong.</>}
            {hasTypeVariation && <> It&rsquo;s used as both a <strong style={{ color: 'var(--text)' }}>{types[0]}</strong> and a <strong style={{ color: 'var(--text)' }}>{types[types.length - 1]}</strong> — two different UI roles with different translation expectations.</>}
            {' '}glos maps each occurrence individually, using the screenshot to pick the right translation for each context.
          </p>

          {/* Routes list */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
            {routes.map((r, i) => (
              <span key={i} style={{
                fontFamily: 'var(--mono)', fontSize: '11px',
                color: 'var(--text-2)', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: '6px',
                padding: '3px 10px',
              }}>{r}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function ContextPage() {
  const [keys, setKeys]         = useState<Record<string, KeyData>>({})
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<FilterType>('all')

  useEffect(() => {
    fetch('/api/context')
      .then(r => r.ok ? r.json() : { keys: {} })
      .then(d => { setKeys(d.keys ?? {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allEntries = Object.entries(keys)
  const filtered = allEntries.filter(([key, data]) => {
    if (search && !key.toLowerCase().includes(search.toLowerCase())) return false
    const n = data.occurrences.length
    if (filter === 'high')   return n >= 3
    if (filter === 'multi')  return n >= 2
    if (filter === 'single') return n === 1
    return true
  })

  const selectedData = selected ? keys[selected] : null

  const counts: Record<FilterType, number> = {
    all:    allEntries.length,
    high:   allEntries.filter(([, d]) => d.occurrences.length >= 3).length,
    multi:  allEntries.filter(([, d]) => d.occurrences.length >= 2).length,
    single: allEntries.filter(([, d]) => d.occurrences.length === 1).length,
  }

  const totalOccurrences = allEntries.reduce((acc, [, d]) => acc + d.occurrences.length, 0)
  const avgPerKey = allEntries.length ? (totalOccurrences / allEntries.length).toFixed(1) : '0'

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '26px', letterSpacing: '-0.02em' }}>Context Map</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '5px' }}>
          Every translation key mapped to its exact visual UI context
        </p>

        {/* Stats strip */}
        {!loading && allEntries.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' as const }}>
            {[
              { label: 'Total Keys',    value: allEntries.length,  color: 'var(--text)',  bg: 'var(--surface)',                    border: 'var(--border)'                  },
              { label: 'High Risk',     value: counts.high,        color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)',             border: 'rgba(248,113,113,0.2)'          },
              { label: 'Multi-context', value: counts.multi,       color: 'var(--amber)', bg: 'rgba(251,191,36,0.06)',              border: 'rgba(251,191,36,0.2)'           },
              { label: 'Avg contexts',  value: avgPerKey,          color: 'var(--cyan)',  bg: 'rgba(34,211,238,0.06)',             border: 'rgba(34,211,238,0.2)'           },
              { label: 'Occurrences',   value: totalOccurrences,   color: 'var(--primary)', bg: 'rgba(99,102,241,0.06)',           border: 'rgba(99,102,241,0.2)'           },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: 'var(--r)', padding: '10px 16px',
                display: 'flex', flexDirection: 'column', gap: '2px',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: 600, color, letterSpacing: '-0.03em' }}>{value}</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Two-panel layout ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── Left panel: key list ─────────────────────────────────── */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          position: 'sticky', top: 0,
        }}>
          {/* Search */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys..."
              style={{
                width: '100%', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: '12px',
                color: 'var(--text)', outline: 'none', transition: 'border-color 150ms',
                boxSizing: 'border-box' as const,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>

          {/* Filter chips */}
          <div style={{
            padding: '8px 12px', borderBottom: '1px solid var(--border)',
            display: 'flex', flexWrap: 'wrap' as const, gap: '5px',
          }}>
            {(['all', 'high', 'multi', 'single'] as FilterType[]).map(f => {
              const filterColors: Record<FilterType, string> = {
                all:    'var(--primary)',
                high:   'var(--red)',
                multi:  'var(--amber)',
                single: 'var(--cyan)',
              }
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontFamily: 'var(--mono)', fontSize: '10px',
                    padding: '3px 9px', borderRadius: '999px',
                    border: `1px solid ${active ? filterColors[f] : 'var(--border)'}`,
                    background: active ? `${filterColors[f]}18` : 'transparent',
                    color: active ? filterColors[f] : 'var(--text-3)',
                    cursor: 'pointer', transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  {FILTER_LABELS[f]}
                  <span style={{ opacity: 0.7 }}>{counts[f]}</span>
                </button>
              )
            })}
          </div>

          {/* Key list */}
          <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)' }}>No keys found</p>
              </div>
            ) : (
              filtered.map(([key, data]) => {
                const risk = riskDot(data.occurrences.length)
                const isSelected = selected === key
                return (
                  <div
                    key={key}
                    onClick={() => setSelected(key)}
                    style={{
                      padding: '10px 14px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                      borderLeft: `2px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                      background: isSelected ? 'var(--primary-dim)' : 'transparent',
                      transition: 'all 120ms',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                      {/* Risk dot */}
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: risk.color, flexShrink: 0,
                        boxShadow: isSelected ? `0 0 6px ${risk.glow}` : 'none',
                        animation: data.occurrences.length >= 3 ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                        display: 'inline-block',
                      }} />
                      {/* Key name */}
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: '12px',
                        color: isSelected ? 'var(--primary)' : 'var(--text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{key}</span>
                    </div>
                    {/* Count badge */}
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600,
                      color: risk.color, flexShrink: 0, marginLeft: '6px',
                      background: `${risk.color}14`,
                      border: `1px solid ${risk.color}30`,
                      borderRadius: '999px', padding: '1px 7px',
                    }}>×{data.occurrences.length}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Right panel: occurrence details ──────────────────────── */}
        <div>
          {!selected ? (
            /* Empty state */
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '64px 48px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '40px', color: 'var(--text-3)', marginBottom: '20px', letterSpacing: '-0.04em' }}>◈</div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--text-2)', marginBottom: '8px' }}>
                Select a key to view its UI context
              </p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.7, maxWidth: '320px', margin: '0 auto 20px' }}>
                Each key is mapped to every route and UI element where it appears —
                with tone, section, and nearby element context.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
                {['High risk keys pulse red', 'Multi-context keys need per-route translation', 'glos maps each occurrence individually'].map((hint, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '999px', padding: '4px 12px',
                  }}>{hint}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="fade-in">
              {/* ── Key header card ── */}
              <div style={{
                background: 'var(--surface)',
                border: `1px solid ${selectedData && selectedData.occurrences.length >= 3 ? 'rgba(248,113,113,0.3)' : selectedData && selectedData.occurrences.length >= 2 ? 'rgba(251,191,36,0.25)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {/* Key name */}
                    <h2 style={{
                      fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '20px',
                      color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: '4px',
                    }}>
                      {selected}
                    </h2>
                    {/* Summary */}
                    <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', margin: 0 }}>
                      {selectedData?.occurrences.length} occurrence{selectedData?.occurrences.length !== 1 ? 's' : ''} ·{' '}
                      {new Set(selectedData?.occurrences.map(o => o.route)).size} route{new Set(selectedData?.occurrences.map(o => o.route)).size !== 1 ? 's' : ''} ·{' '}
                      {new Set(selectedData?.occurrences.map(o => o.element_type)).size} element type{new Set(selectedData?.occurrences.map(o => o.element_type)).size !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Count + risk label */}
                  <div style={{ textAlign: 'right' }}>
                    {selectedData && (() => {
                      const risk = riskDot(selectedData.occurrences.length)
                      return (
                        <>
                          <div style={{
                            fontFamily: 'var(--mono)', fontSize: '36px', fontWeight: 700,
                            color: risk.color, letterSpacing: '-0.05em', lineHeight: 1,
                          }}>×{selectedData.occurrences.length}</div>
                          <div style={{
                            fontFamily: 'var(--sans)', fontSize: '11px', color: risk.color,
                            marginTop: '4px',
                          }}>{risk.label}</div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Tone / type pills row */}
                {selectedData && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginTop: '14px' }}>
                    {[...new Set(selectedData.occurrences.map(o => o.element_type))].map((type, i) => (
                      <span key={i} style={{
                        fontFamily: 'var(--mono)', fontSize: '11px',
                        background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                        border: '1px solid rgba(99,102,241,0.25)', borderRadius: '6px', padding: '3px 10px',
                      }}>{elementIcon(type)} {type}</span>
                    ))}
                    {[...new Set(selectedData.occurrences.map(o => o.tone))].map((tone, i) => (
                      <span key={i} style={{
                        fontFamily: 'var(--mono)', fontSize: '11px',
                        color: toneColor(tone), background: `${toneColor(tone)}12`,
                        border: `1px solid ${toneColor(tone)}30`, borderRadius: '6px', padding: '3px 10px',
                      }}>{tone}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Occurrence cards ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedData?.occurrences.map((occ, i) => (
                  <OccurrenceCard key={i} occ={occ} index={i} />
                ))}
              </div>

              {/* ── Multi-context insight ── */}
              {selectedData && (
                <MultiContextInsight keyName={selected} data={selectedData} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
