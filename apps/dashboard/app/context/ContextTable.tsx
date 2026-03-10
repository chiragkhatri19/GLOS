'use client'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { ContextFile } from '@/lib/types'

const ELEMENT_BADGE: Record<string, 'primary' | 'cyan' | 'amber' | 'muted'> = {
  button: 'primary',
  link: 'cyan',
  heading: 'amber',
  label: 'muted',
  placeholder: 'muted',
  text: 'muted',
}

export function ContextTable({ context }: { context: ContextFile }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const keys = useMemo(() => {
    const entries = Object.entries(context.keys)
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(([key, val]) => {
      if (key.toLowerCase().includes(q)) return true
      return val.occurrences.some(o =>
        o.context.toLowerCase().includes(q) ||
        o.route.toLowerCase().includes(q) ||
        o.element_type.toLowerCase().includes(q)
      )
    })
  }, [context.keys, search])

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search keys, routes, context…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            padding: '10px 14px',
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <span style={{ marginLeft: '12px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)' }}>
          {keys.length} / {Object.keys(context.keys).length} keys
        </span>
      </div>

      {/* Table */}
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Key', 'Occurrences', 'Routes', 'Element Types', 'Tones'].map(h => (
                <th key={h} style={{
                  padding: '12px 20px',
                  textAlign: 'left',
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map(([key, val]) => {
              const isExpanded = expanded === key
              const routes = [...new Set(val.occurrences.map(o => o.route))]
              const types = [...new Set(val.occurrences.map(o => o.element_type))]
              const tones = [...new Set(val.occurrences.map(o => o.tone))]

              return (
                <>
                  <tr
                    key={key}
                    onClick={() => setExpanded(isExpanded ? null : key)}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 150ms',
                      background: isExpanded ? 'var(--primary-dim)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: isExpanded ? 'var(--primary)' : 'var(--text)' }}>{key}</span>
                        {val.occurrences.length > 1 && (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                            ×{val.occurrences.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'var(--mono)', fontSize: '22px', color: 'var(--text-2)', fontWeight: 600 }}>
                      {val.occurrences.length}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {routes.slice(0, 2).map(r => <Badge key={r} variant="muted">{r}</Badge>)}
                        {routes.length > 2 && <Badge variant="muted">+{routes.length - 2}</Badge>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {types.map(t => <Badge key={t} variant={ELEMENT_BADGE[t] ?? 'muted'}>{t}</Badge>)}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {tones.map(t => <Badge key={t} variant="cyan">{t}</Badge>)}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${key}-detail`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={5} style={{ padding: '0 20px 16px', background: 'var(--primary-dim)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {val.occurrences.map((o, i) => (
                            <div key={i} style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '14px 16px',
                              display: 'grid',
                              gridTemplateColumns: '120px 1fr 1fr 1fr',
                              gap: '12px',
                              alignItems: 'start',
                            }}>
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>ROUTE</div>
                                <Badge variant="muted">{o.route}</Badge>
                              </div>
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>CONTEXT</div>
                                <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)' }}>{o.context}</span>
                              </div>
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>SECTION · TYPE</div>
                                <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)' }}>{o.page_section} · {o.element_type}</span>
                              </div>
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>NEARBY</div>
                                <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)' }}>
                                  {o.nearby_elements.slice(0, 3).join(', ') || '—'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {keys.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)' }}>
                  No keys match your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
