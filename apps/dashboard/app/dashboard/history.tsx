'use client'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'

interface ScanRecord {
  url: string
  scannedAt: string
  routes: number
  keys: number
  avgImprovement: number
}

interface ContextData {
  elements: any[]
  total_keys: number
  routes: number
}

interface QualityData {
  keys: any[]
  total: number
}

const HARDCODED_EXAMPLES: Record<string, { blind: Record<string, string>; context: string }> = {
  save_changes: {
    blind: {
      ja: '保存する (game save)',
      de: 'Speichern (file)',
      es: 'Guardar (keep)',
    },
    context: 'button in form section · tone: formal · ambiguity: 8/10',
  },
  delete: {
    blind: {
      ja: '削除',
      de: 'Löschen',
      es: 'Borrar',
    },
    context: 'button in danger zone · tone: destructive · ambiguity: 9/10',
  },
  back: {
    blind: {
      ja: '戻る',
      de: 'Zurück',
      es: 'Atrás',
    },
    context: 'navigation link in header · tone: neutral · ambiguity: 6/10',
  },
  confirm: {
    blind: {
      ja: '確認',
      de: 'Bestätigen',
      es: 'Confirmar',
    },
    context: 'modal action button · tone: urgent · ambiguity: 7/10',
  },
  archive: {
    blind: {
      ja: 'アーカイブ',
      de: 'Archivieren',
      es: 'Archivar',
    },
    context: 'action menu item · tone: formal · ambiguity: 8/10',
  },
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanRecord[]>([])
  const [contextData, setContextData] = useState<ContextData | null>(null)
  const [qualityData, setQualityData] = useState<QualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUrl, setLastUrl] = useState('')

  useEffect(() => {
    // Load history from localStorage
    const stored = localStorage.getItem('glos_history')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setHistory(Array.isArray(parsed) ? parsed : [])
        if (parsed.length > 0) {
          setLastUrl(parsed[0].url)
        }
      } catch {}
    }

    // Fetch fresh data
    Promise.all([
      fetch('/api/context').then(r => r.json()),
      fetch('/api/quality?locales=ja,de,ar,fr,es,zh,hi,pt,ko,it').then(r => r.json()),
    ])
      .then(([ctx, qual]) => {
        setContextData(ctx)
        setQualityData(qual)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Calculate stats
  const keysWithContext = contextData?.total_keys || 0
  const stringsAtRisk = qualityData?.keys?.filter((k: any) => k.ambiguity_score >= 7).length || 0
  const languagesProtected = 10

  function getRelativeTime(isoString: string) {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
  }

  function handleExport() {
    const dataStr = JSON.stringify(contextData?.elements || [], null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'glos.context.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleCopyCommand() {
    const cmd = `npx @chiragbuilds/glos capture --url ${lastUrl || 'http://localhost:3000'}`
    navigator.clipboard.writeText(cmd)
  }

  const topAmbiguousKeys = qualityData?.keys
    ?.sort((a: any, b: any) => b.ambiguity_score - a.ambiguity_score)
    .slice(0, 5) || []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Results & History
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
            See the impact of context-aware translation
          </p>
        </div>

        {/* Section 1 — Impact Summary */}
        <div style={{
          marginBottom: '40px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(163,230,53,0.05) 0%, rgba(34,197,94,0.05) 100%)',
          border: '1px solid rgba(163,230,53,0.2)',
          borderRadius: 'var(--r-lg)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(163,230,53,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }} />

          <h2 style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '20px', 
            fontWeight: 600, 
            color: 'var(--lime)',
            marginBottom: '24px',
            position: 'relative',
          }}>
            Context makes translations better.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '20px', position: 'relative' }}>
            <StatBlock
              label="Keys With Context"
              value={keysWithContext.toString()}
              color="var(--lime)"
            />
            <StatBlock
              label="Strings At Risk"
              value={stringsAtRisk.toString()}
              color="var(--red)"
              subtext="would mistranslate without context"
            />
            <StatBlock
              label="Languages Protected"
              value={languagesProtected.toString()}
              color="var(--cyan)"
            />
          </div>

          <p style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '11px', 
            color: 'var(--text-3)',
            position: 'relative',
          }}>
            Last scan found {keysWithContext} ambiguous strings across {contextData?.routes || 0} routes — {stringsAtRisk} of them score 7+ ambiguity and need contextual translation.
          </p>
        </div>

        {/* Section 2 — Before vs After Comparison */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '18px', 
            fontWeight: 500, 
            color: 'var(--text)',
            marginBottom: '20px',
          }}>
            Before vs After: The Power of Context
          </h2>

          <div style={{ display: 'grid', gap: '20px' }}>
            {topAmbiguousKeys.map((item: any, idx) => {
              const example = HARDCODED_EXAMPLES[item.key] || HARDCODED_EXAMPLES.save_changes
              
              return (
                <div key={item.key} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '24px',
                  padding: '24px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  alignItems: 'stretch',
                }}>
                  {/* Left — Without glos */}
                  <div style={{
                    padding: '20px',
                    background: 'rgba(248,113,113,0.05)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 'var(--r)',
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      background: 'rgba(248,113,113,0.15)',
                      border: '1px solid rgba(248,113,113,0.3)',
                      borderRadius: '999px',
                      marginBottom: '16px',
                    }}>
                      <span style={{ fontSize: '12px' }}>❌</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase' }}>
                        Context-blind
                      </span>
                    </div>

                    <div style={{ fontFamily: 'var(--sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text)', marginBottom: '16px' }}>
                      {item.value}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(example.blind).map(([locale, translation]) => (
                        <div key={locale} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: 'var(--surface-2)',
                          borderRadius: 'var(--r)',
                        }}>
                          <span style={{ fontSize: '12px' }}>
                            {LOCALE_FLAGS[locale]}
                          </span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-2)' }}>
                            {translation}
                          </span>
                          <span style={{ 
                            marginLeft: 'auto',
                            fontFamily: 'var(--mono)', 
                            fontSize: '9px', 
                            color: 'var(--text-3)',
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '999px',
                          }}>
                            Generic
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-2)',
                    }}>
                      VS
                    </div>
                  </div>

                  {/* Right — With glos */}
                  <div style={{
                    padding: '20px',
                    background: 'rgba(34,197,94,0.05)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 'var(--r)',
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: '999px',
                      marginBottom: '16px',
                    }}>
                      <span style={{ fontSize: '12px' }}>✓</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase' }}>
                        Context-aware
                      </span>
                    </div>

                    <div style={{ fontFamily: 'var(--sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text)', marginBottom: '16px' }}>
                      {item.value}
                    </div>

                    {/* Context hint card */}
                    <div style={{
                      padding: '12px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--lime)',
                      borderRadius: 'var(--r)',
                      marginBottom: '12px',
                    }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--lime)', lineHeight: 1.5 }}>
                        {example.context}
                      </div>
                    </div>

                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)' }}>
                      → Translator gets full context
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 3 — Scan History Timeline */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '18px', 
            fontWeight: 500, 
            color: 'var(--text)',
            marginBottom: '20px',
          }}>
            Scan History
          </h2>

          {history.length === 0 ? (
            <div style={{
              padding: '60px 40px',
              textAlign: 'center',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text-2)', marginBottom: '8px' }}>
                No scans yet
              </p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-3)' }}>
                Go to Overview to run your first scan
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((scan, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto',
                  gap: '20px',
                  alignItems: 'center',
                  padding: '20px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)' }}>
                    {getRelativeTime(scan.scannedAt)}
                  </div>
                  
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>
                      {scan.url}
                    </div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)' }}>
                      {scan.routes} routes · {scan.keys} keys mapped
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['🇯🇵', '🇩🇪', '🇫🇷', '🇪🇸'].map((flag, i) => (
                        <span key={i} style={{ fontSize: '14px', opacity: 0.7 }}>{flag}</span>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '11px',
                        padding: '6px 14px',
                        background: 'transparent',
                        border: '1px solid var(--lime)',
                        borderRadius: 'var(--r)',
                        color: 'var(--lime)',
                        cursor: 'pointer',
                      }}
                    >
                      Re-scan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4 — Export */}
        <div style={{
          padding: '24px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}>
          <h3 style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '14px', 
            fontWeight: 500, 
            color: 'var(--text)',
            marginBottom: '16px',
          }}>
            Export & CLI
          </h3>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleExport}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                padding: '10px 18px',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: 'var(--r)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Export context map as JSON
            </button>

            <button
              onClick={handleCopyCommand}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                padding: '10px 18px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              Copy CLI command
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatBlock({ label, value, color, subtext }: { label: string; value: string; color: string; subtext?: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '36px', fontWeight: 600, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', marginTop: '4px' }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

const LOCALE_FLAGS: Record<string, string> = {
  ja: '🇯🇵',
  de: '🇩🇪',
  ar: '🇸🇦',
  fr: '🇫🇷',
  es: '🇪🇸',
  zh: '🇨🇳',
  hi: '🇮🇳',
  pt: '🇧🇷',
  ko: '🇰🇷',
  it: '🇮🇹',
}
