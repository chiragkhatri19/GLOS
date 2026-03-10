'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

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

type FilterType = 'all' | 'high-risk' | 'multi-context' | 'no-context'

function toneVariant(tone: string): 'red' | 'amber' | 'cyan' | 'muted' {
  if (tone === 'destructive') return 'red'
  if (tone === 'urgent') return 'red'
  if (tone === 'formal') return 'amber'
  if (tone === 'casual') return 'cyan'
  return 'muted'
}

function riskColor(count: number): string {
  if (count >= 3) return 'var(--red)'
  if (count === 2) return 'var(--amber)'
  return 'var(--cyan)'
}

export default function ContextPage() {
  const [keys, setKeys] = useState<Record<string, KeyData>>({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    fetch('/api/context')
      .then(r => r.ok ? r.json() : { keys: {} })
      .then(data => { setKeys(data.keys ?? {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allKeys = Object.entries(keys)

  const filteredKeys = allKeys.filter(([key, data]) => {
    if (search && !key.toLowerCase().includes(search.toLowerCase())) return false
    const count = data.occurrences.length
    if (filter === 'high-risk') return count >= 3
    if (filter === 'multi-context') return count >= 2
    if (filter === 'no-context') return count === 0
    return true
  })

  const selectedData = selected ? keys[selected] : null

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '26px', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Context Map
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>
          Every translation key mapped to its visual context
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Left panel — key list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Search */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys..."
              style={{
                width: '100%',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontFamily: 'var(--mono)',
                fontSize: '13px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(['all', 'high-risk', 'multi-context', 'no-context'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                  background: filter === f ? 'var(--primary-dim)' : 'transparent',
                  color: filter === f ? 'var(--primary)' : 'var(--text-2)',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Key list */}
          <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...Array(8)].map((_, i) => <Skeleton key={i} height="32px" />)}
              </div>
            ) : filteredKeys.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)' }}>No keys found</p>
              </div>
            ) : filteredKeys.map(([key, data]) => (
              <div
                key={key}
                onClick={() => setSelected(key)}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderLeft: selected === key ? '2px solid var(--primary)' : '2px solid transparent',
                  background: selected === key ? 'var(--primary-dim)' : 'transparent',
                  transition: 'all 150ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: riskColor(data.occurrences.length),
                    flexShrink: 0,
                    animation: data.occurrences.length >= 3 ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                    display: 'inline-block',
                  }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: selected === key ? 'var(--primary)' : 'var(--text)' }}>
                    {key}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)' }}>
                  ×{data.occurrences.length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — occurrence detail */}
        <div>
          {!selected ? (
            <Card style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', color: 'var(--text-3)', marginBottom: '12px' }}>◎</div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text-3)' }}>
                Select a key to view context
              </p>
              {allKeys.length > 0 && (
                <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>
                  {allKeys.length} keys loaded
                </p>
              )}
            </Card>
          ) : (
            <div className="fade-up">
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '22px', color: 'var(--primary)' }}>
                  {selected}
                </h2>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>
                  {selectedData?.occurrences.length} occurrence{selectedData?.occurrences.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedData?.occurrences.map((occ, i) => (
                  <Card key={i} style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <Badge variant="muted">{occ.route}</Badge>
                      <Badge variant="primary">{occ.element_type}</Badge>
                      <Badge variant={toneVariant(occ.tone)}>{occ.tone}</Badge>
                      <Badge variant="muted">{occ.page_section}</Badge>
                    </div>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                      {occ.context}
                    </p>
                    {occ.nearby_elements?.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)' }}>near:</span>
                        {occ.nearby_elements.map((el, j) => (
                          <span key={j} style={{
                            fontFamily: 'var(--sans)',
                            fontSize: '12px',
                            color: 'var(--text-2)',
                            background: 'var(--surface-3)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}>
                            {el}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
