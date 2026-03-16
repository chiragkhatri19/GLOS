'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton, StatSkeleton } from '@/components/ui/Skeleton'
import { SCAN_DONE_KEY } from '@/components/layout/Sidebar'

// ── Types ──────────────────────────────────────────────────────────────────
type RouteStatus = 'waiting' | 'screenshotting' | 'analyzing' | 'done' | 'error'

interface RouteCard {
  route: string
  index: number
  status: RouteStatus
  file?: string
  elementCount?: number
  error?: string
}

interface ScanState {
  status: 'scanning' | 'done' | 'error'
  url: string
  total: number
  routes: RouteCard[]
  keysMapped?: number
  routesAnalyzed?: number
}

interface CtxData {
  routes_analyzed: number
  keys_mapped: number
  app_url: string
  generated: string
}

interface QualityData {
  scores: { key: string; locale: string; before: string; after: string; improvement_percent: number }[]
  average_improvement: number
  by_locale: Record<string, number>
  total_keys: number
}

// ── Helpers ────────────────────────────────────────────────────────────────
function Label({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 500,
      textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-3)',
    }}>{children}</div>
  )
}

function BigNum({ children, color = 'var(--text)' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '48px',
      letterSpacing: '-0.03em', lineHeight: 1, color, marginTop: '14px',
    }}>{children}</div>
  )
}

// ── Add Modal ──────────────────────────────────────────────────────────────
function AddModal({ onClose, onScan }: { onClose: () => void; onScan: (url: string) => void }) {
  const [url, setUrl] = useState('http://localhost:3001')
  const submit = () => { if (url.trim()) { onScan(url.trim()); onClose() } }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div className="fade-up" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '32px', width: '440px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
      }}>
        <h2 style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '18px', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Add your app
        </h2>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '24px' }}>
          glos will visit every route, capture screenshots, and extract UI context for your translations.
        </p>
        <label style={{ display: 'block', fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' }}>APP URL</label>
        <input
          autoFocus value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="http://localhost:3001"
          style={{
            width: '100%', background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: 'var(--r)',
            padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: '14px',
            color: 'var(--text)', outline: 'none', transition: 'border-color 150ms', marginBottom: '8px',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginBottom: '24px' }}>
          Your app must be running. glos visits /en/settings, /en/checkout, /en/account, /en/dashboard.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            fontFamily: 'var(--mono)', fontSize: '13px', padding: '10px 18px',
            borderRadius: 'var(--r)', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-2)', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={submit} style={{
            fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500,
            padding: '10px 24px', borderRadius: 'var(--r)', border: 'none',
            background: url.trim() ? 'var(--primary)' : 'var(--surface-3)',
            color: url.trim() ? '#fff' : 'var(--text-3)',
            cursor: url.trim() ? 'pointer' : 'not-allowed',
            boxShadow: url.trim() ? 'var(--primary-glow)' : 'none',
            transition: 'all 200ms',
          }}>▶ Start Scan</button>
        </div>
      </div>
    </div>
  )
}

// ── Big Live Route Card ─────────────────────────────────────────────────────
function BigLiveCard({ card, isActive, onClick }: { card: RouteCard; isActive: boolean; onClick?: () => void }) {
  const borderColor: Record<RouteStatus, string> = {
    waiting:        'var(--border)',
    screenshotting: 'rgba(251,191,36,0.5)',
    analyzing:      'rgba(99,102,241,0.6)',
    done:           'rgba(34,211,238,0.4)',
    error:          'rgba(248,113,113,0.4)',
  }
  const statusText: Record<RouteStatus, string> = {
    waiting:        '○  Waiting...',
    screenshotting: '◌  Capturing screenshot...',
    analyzing:      '◎  Extracting UI context with AI...',
    done:           `✓  ${card.elementCount ?? 0} translation strings mapped`,
    error:          `✕  ${card.error ?? 'Failed'}`,
  }
  const statusColor: Record<RouteStatus, string> = {
    waiting:        'var(--text-3)',
    screenshotting: 'var(--amber)',
    analyzing:      'var(--primary)',
    done:           'var(--green)',
    error:          'var(--red)',
  }

  return (
    <div 
      className="fade-up" 
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isActive ? borderColor[card.status] : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        transition: 'all 400ms ease',
        transform: isActive && card.status !== 'waiting' ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isActive && card.status === 'analyzing' ? '0 0 30px rgba(99,102,241,0.15)' : 'none',
        cursor: card.file ? 'pointer' : 'default',
      }}>
      {/* Big screenshot area */}
      <div style={{ height: '200px', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
        {/* Shimmer while capturing */}
        {!card.file && card.status === 'screenshotting' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s infinite',
          }} />
        )}
        {/* Waiting state — subtle placeholder */}
        {card.status === 'waiting' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '22px', color: 'var(--border)' }}>○</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.06em' }}>
              {card.route}
            </div>
          </div>
        )}
        {/* Screenshot */}
        {card.file && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/screenshot?file=${encodeURIComponent(card.file)}`}
            alt={card.route}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'opacity 600ms ease' }}
            onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
          />
        )}
        {/* AI Analysis overlay */}
        {card.status === 'analyzing' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(6,6,14,0.55)',
            backdropFilter: 'blur(2px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '14px',
          }}>
            {/* Scanning line */}
            <div style={{
              width: '80%', height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
              animation: 'scan-line 1.8s ease-in-out infinite',
            }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                ◎ VISION ANALYSIS
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                Reading UI elements & extracting context
              </div>
            </div>
            {/* Floating AI tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, justifyContent: 'center', maxWidth: '80%' }}>
              {['button', 'form label', 'heading', 'cta'].map((tag, i) => (
                <span key={tag} style={{
                  fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--primary)',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '4px', padding: '2px 7px',
                  animation: `fadeIn 300ms ${i * 200}ms ease forwards`,
                  opacity: 0,
                }}>{tag}</span>
              ))}
            </div>
          </div>
        )}
        {/* Done badge */}
        {card.status === 'done' && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(6,6,14,0.85)', border: '1px solid rgba(34,211,238,0.4)',
            borderRadius: '999px', padding: '4px 12px',
            fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--cyan)',
            backdropFilter: 'blur(6px)',
          }}>✓ {card.elementCount ?? 0} strings</div>
        )}
        {/* Progress bar at bottom */}
        {(card.status === 'screenshotting' || card.status === 'analyzing') && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{
              height: '100%',
              background: card.status === 'screenshotting'
                ? 'linear-gradient(90deg, var(--amber), rgba(251,191,36,0.4))'
                : 'linear-gradient(90deg, var(--primary), var(--cyan))',
              animation: 'progress-bar 1.6s ease-in-out infinite',
            }} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${card.status === 'done' ? 'rgba(34,211,238,0.15)' : 'var(--border)'}`,
        background: card.status === 'analyzing' ? 'rgba(99,102,241,0.04)' : 'transparent',
        transition: 'all 400ms',
      }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)',
          marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {card.route || '...'}
        </div>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: '12px', color: statusColor[card.status],
          transition: 'color 400ms', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {card.status === 'analyzing' && (
            <span style={{ animation: 'pulse-dot 1s infinite', display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
          )}
          {statusText[card.status]}
        </div>
      </div>
    </div>
  )
}

// ── Live Log ────────────────────────────────────────────────────────────────
interface LogEntry { time: string; text: string; type: 'info' | 'success' | 'ai' | 'error' }

function LiveLog({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [entries])

  const colors = { info: 'var(--text-3)', success: 'var(--green)', ai: 'var(--primary)', error: 'var(--red)' }
  const prefixes = { info: '○', success: '✓', ai: '◎', error: '✗' }

  return (
    <div ref={ref} style={{
      maxHeight: '130px', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: '3px',
      padding: '12px 16px',
    }}>
      {entries.map((e, i) => (
        <div key={i} className="fade-up" style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', flexShrink: 0, opacity: 0.6 }}>{e.time}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: colors[e.type], flexShrink: 0 }}>{prefixes[e.type]}</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: e.type === 'info' ? 'var(--text-2)' : colors[e.type] }}>{e.text}</span>
        </div>
      ))}
      {entries.length === 0 && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', padding: '4px 0' }}>Waiting for scan to start...</div>
      )}
    </div>
  )
}

// ── History types ─────────────────────────────────────────────────────────
interface HistoryEntry {
  id: string; url: string; scannedAt: string; routes: number; keys: number; avgImprovement: number
}
const HISTORY_KEY = 'glos_project_history'
function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
}
function saveHistory(entries: HistoryEntry[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 20))) } catch {}
}
function addToHistory(entry: Omit<HistoryEntry, 'id'>) {
  const entries = loadHistory()
  saveHistory([{ ...entry, id: `${Date.now()}` }, ...entries.filter(e => e.url !== entry.url)])
}

// ── History Panel ───────────────────────────────────────────────────────────
function HistoryPanel({ history, onReload, onClear }: {
  history: HistoryEntry[]; onReload: (url: string) => void; onClear: () => void
}) {
  if (history.length === 0) return null
  return (
    <div className="fade-up" style={{ marginBottom: '32px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.015)',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-2)' }}>◷ Previous scans</span>
          <button onClick={onClear} style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>clear</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {history.map((h, i) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 20px',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 120ms',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{h.url}</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', flexShrink: 0 }}>{h.routes} routes · {h.keys} keys</span>
              {h.avgImprovement > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--cyan)', flexShrink: 0 }}>+{h.avgImprovement}%</span>}
              <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>{new Date(h.scannedAt).toLocaleDateString()}</span>
              <button onClick={() => onReload(h.url)} style={{
                fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--primary)',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 'var(--r)', padding: '4px 12px', cursor: 'pointer', flexShrink: 0, transition: 'all 150ms',
              }}>↺ Re-scan</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const router = useRouter()
  const [ctx, setCtx]             = useState<CtxData | null>(null)
  const [quality, setQuality]     = useState<QualityData | null>(null)
  const [loading, setLoading]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [scan, setScan]           = useState<ScanState | null>(null)
  const [history, setHistory]     = useState<HistoryEntry[]>([])
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [activeCardIndex, setActiveCardIndex] = useState<number>(-1)
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)

  useEffect(() => { setHistory(loadHistory()) }, [])

  function refreshHistory() { setHistory(loadHistory()) }

  function addLog(text: string, type: LogEntry['type'] = 'info') {
    const now = new Date()
    const time = `${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    setLogEntries(p => [...p.slice(-30), { time, text, type }])
  }

  async function startScan(url: string) {
    setScan({ status: 'scanning', url, total: 0, routes: [] })
    setCtx(null); setQuality(null); setLoading(false)
    setLogEntries([])
    setActiveCardIndex(-1)
    addLog(`Starting scan for ${url}`, 'info')
    addLog('Launching Playwright browser...', 'info')

    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }), // No routes - automatic discovery
      })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      readerRef.current = reader
      const dec = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try { handleEvent(JSON.parse(line.slice(6))) } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        addLog('Scan stopped by user', 'error')
      } else {
        setScan(p => p ? { ...p, status: 'error' } : null)
        addLog('Scan failed — is your app running?', 'error')
      }
    }
  }

  function stopScan() {
    if (readerRef.current) {
      readerRef.current.cancel(new Error('User cancelled'))
      readerRef.current = null
    }
    setScan(p => {
      if (!p) return p
      return { ...p, status: 'error' }
    })
    addLog('Stopping scan...', 'error')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEvent(ev: any) {
    setScan(prev => {
      if (!prev) return prev
      switch (ev.type) {
        case 'stage':
          if (ev.stage === 'screenshots' && ev.message?.includes('Browser ready')) {
            addLog('Browser ready — navigating routes', 'info')
            return prev
          }
          return prev
        case 'screenshot':
          setActiveCardIndex(ev.index)
          addLog(`Capturing screenshot: ${ev.route}`, 'info')
          return {
            ...prev, total: ev.total,
            routes: prev.routes.length === 0
              ? Array.from({ length: ev.total }, (_, i) => ({
                  route: i === ev.index ? ev.route : '...',
                  index: i,
                  status: (i === ev.index ? 'screenshotting' : 'waiting') as RouteStatus,
                  file: i === ev.index ? ev.file : undefined,
                }))
              : prev.routes.map(r => r.index === ev.index
                  ? { ...r, route: ev.route, file: ev.file, status: r.status === 'waiting' ? 'screenshotting' : r.status }
                  : r),
          }
        case 'vision_start':
          addLog(`AI analyzing: ${prev.routes[ev.index]?.route ?? ev.route}`, 'ai')
          return { ...prev, routes: prev.routes.map(r => r.index === ev.index ? { ...r, status: 'analyzing' as RouteStatus } : r) }
        case 'vision_done':
          addLog(`Extracted ${ev.elements} translation strings`, 'success')
          return { ...prev, routes: prev.routes.map(r => r.index === ev.index ? { ...r, status: 'done' as RouteStatus, elementCount: ev.elements } : r) }
        case 'complete':
          addLog(`Scan complete — ${ev.keys_mapped ?? '?'} keys mapped across ${ev.routes_analyzed ?? '?'} routes`, 'success')
          addLog('Unlocking Quality & Context Map tabs', 'success')
          // Unlock sidebar
          localStorage.setItem(SCAN_DONE_KEY, '1')
          Promise.all([
            fetch('/api/context').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/quality?locales=ja,de,ar,fr,es,zh,hi,pt,ko,it').then(r => r.ok ? r.json() : null).catch(() => null),
          ]).then(([c, q]) => {
            setCtx(c); setQuality(q)
            if (c) {
              addToHistory({
                url: c.app_url ?? prev.url, scannedAt: new Date().toISOString(),
                routes: c.routes_analyzed ?? ev.routes_analyzed ?? 0,
                keys: c.keys_mapped ?? ev.keys_mapped ?? 0,
                avgImprovement: q?.average_improvement ?? 0,
              })
              setHistory(loadHistory())
            }
          })
          return { ...prev, status: 'done' as const, routesAnalyzed: ev.routes_analyzed, keysMapped: ev.keys_mapped }
        case 'error':
          addLog(`Error: ${ev.message}`, 'error')
          return { ...prev, status: 'error' as const }
        default: return prev
      }
    })
  }

  const chartData = quality?.by_locale
    ? Object.entries(quality.by_locale).map(([locale, improvement]) => ({ locale, improvement }))
    : []
  const topScores  = quality?.scores?.slice(0, 8) ?? []
  const hasData    = !!ctx
  const isScanning = scan?.status === 'scanning'

  return (
    <div style={{ maxWidth: '1100px' }}>
      {showModal && <AddModal onClose={() => setShowModal(false)} onScan={startScan} />}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '26px', letterSpacing: '-0.02em' }}>Overview</h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '5px' }}>
            {ctx?.app_url
              ? `${ctx.app_url} · ${ctx.keys_mapped} keys · ${new Date(ctx.generated).toLocaleDateString()}`
              : 'Add your app to extract translation context'}
          </p>
        </div>
        <button
          onClick={() => !isScanning && setShowModal(true)}
          style={{
            fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500,
            padding: '10px 22px', borderRadius: 'var(--r)', border: 'none',
            background: isScanning ? 'var(--surface-3)' : 'var(--primary)',
            color: isScanning ? 'var(--text-3)' : '#fff',
            cursor: isScanning ? 'not-allowed' : 'pointer',
            boxShadow: isScanning ? 'none' : 'var(--primary-glow)',
            transition: 'all 200ms',
          }}
        >
          {isScanning ? '◌ Scanning...' : hasData ? '↺ Re-scan' : '+ Add App'}
        </button>
      </div>

      {/* ── DRAMATIC Live Scan Panel ──────────────────────────────────── */}
      {scan && (
        <div className="fade-up" style={{ marginBottom: '36px' }}>
          <div style={{
            background: 'var(--surface)',
            border: `1px solid ${scan.status === 'done' ? 'rgba(34,211,238,0.35)' : 'rgba(99,102,241,0.35)'}`,
            borderRadius: 'var(--r-lg)', overflow: 'hidden', transition: 'border-color 600ms',
            boxShadow: scan.status === 'scanning' ? '0 0 60px rgba(99,102,241,0.08)' : '0 0 40px rgba(34,211,238,0.06)',
          }}>

            {/* Panel header */}
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: scan.status === 'done' ? 'rgba(34,211,238,0.03)' : 'rgba(99,102,241,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: scan.status === 'done' ? 'var(--cyan)' : 'var(--primary)',
                  animation: scan.status === 'scanning' ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
                  flexShrink: 0, display: 'inline-block',
                }} />
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', letterSpacing: '-0.01em' }}>
                    {scan.status === 'done'
                      ? `✓ Scan complete — ${scan.keysMapped ?? 0} keys extracted`
                      : `Scanning ${scan.url}`}
                  </div>
                  {scan.status === 'scanning' && (
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
                      Playwright browser · Gemini Vision AI · Context extraction
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)' }}>
                  {scan.routes.filter(r => r.status === 'done').length} / {scan.total} routes
                </span>
                {scan.status === 'scanning' && (
                  <button
                    onClick={stopScan}
                    style={{
                      fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
                      padding: '6px 14px', borderRadius: 'var(--r)', border: '1px solid rgba(248,113,113,0.3)',
                      background: 'rgba(248,113,113,0.15)', color: '#f87171', cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    ⏹ Stop Scan
                  </button>
                )}
                {scan.status === 'done' && (
                  <button
                    onClick={() => router.push('/dashboard/quality')}
                    style={{
                      fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 500,
                      padding: '6px 16px', borderRadius: 'var(--r)', border: 'none',
                      background: 'var(--cyan)', color: '#000', cursor: 'pointer',
                    }}
                  >
                    → View Quality
                  </button>
                )}
              </div>
            </div>

            {/* Big screenshot grid */}
            {scan.routes.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px' }}>
                {scan.routes.map((card, i) => (
                  <BigLiveCard 
                    key={i} 
                    card={card} 
                    isActive={i === activeCardIndex} 
                    onClick={() => card.file && setViewScreenshot(card.file)}
                  />
                ))}
              </div>
            )}

            {/* Live Log */}
            <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{
                padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.08em' }}>LIVE LOG</span>
                {isScanning && (
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 1s infinite' }} />
                )}
              </div>
              <LiveLog entries={logEntries} />
            </div>

            {/* Done — next steps prompt */}
            {scan.status === 'done' && (
              <div style={{
                padding: '16px 24px', borderTop: '1px solid var(--border)',
                background: 'rgba(34,211,238,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)' }}>
                  ✓ Context extracted — Quality &amp; Context Map are now unlocked in the sidebar
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => router.push('/dashboard/context')} style={{
                    fontFamily: 'var(--mono)', fontSize: '12px', padding: '7px 16px',
                    borderRadius: 'var(--r)', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-2)', cursor: 'pointer',
                  }}>◎ Context Map</button>
                  <button onClick={() => router.push('/dashboard/quality')} style={{
                    fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 500,
                    padding: '7px 16px', borderRadius: 'var(--r)', border: 'none',
                    background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                    boxShadow: 'var(--primary-glow)',
                  }}>⚡ Fix All Translations</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state + History ───────────────────────────────────── */}
      {!hasData && !scan && !loading && (
        <>
          <Card style={{ padding: '64px 48px', textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', color: 'var(--text-3)', marginBottom: '16px', letterSpacing: '-0.04em' }}>glos</div>
            <h2 style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '18px', marginBottom: '10px', letterSpacing: '-0.02em' }}>No app scanned yet</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', maxWidth: '400px', margin: '0 auto 28px', lineHeight: 1.7 }}>
              Screenshot your running app, extract UI context from every route, and get dramatically better translations.
            </p>
            <code style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)', marginBottom: '24px' }}>
              glos capture --url http://localhost:3001
            </code>
            <button onClick={() => setShowModal(true)} style={{
              fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500,
              padding: '12px 28px', borderRadius: 'var(--r)', border: 'none',
              background: 'var(--primary)', color: '#fff', cursor: 'pointer', boxShadow: 'var(--primary-glow)',
            }}>+ Add App</button>
          </Card>
          <HistoryPanel
            history={history}
            onReload={url => { setShowModal(false); startScan(url) }}
            onClear={() => { localStorage.removeItem(HISTORY_KEY); refreshHistory() }}
          />
        </>
      )}

      {/* ── Stats + chart + table ────────────────────────────────────── */}
      {(hasData || loading) && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {loading ? <><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
              : ([
                  { label: 'ROUTES ANALYZED', value: ctx?.routes_analyzed ?? 0,               sub: 'pages captured',      color: 'var(--text)' },
                  { label: 'KEYS MAPPED',     value: ctx?.keys_mapped ?? 0,                   sub: 'with visual context', color: 'var(--text)' },
                  { label: 'AVG IMPROVEMENT', value: `+${quality?.average_improvement ?? 0}%`, sub: 'vs blind translation', color: 'var(--cyan)' },
                ] as const).map((s, i) => (
                  <Card key={i} className="fade-up" style={{ padding: '24px', animationDelay: `${i * 60}ms` }}>
                    <Label>{s.label}</Label>
                    <BigNum color={s.color}>{s.value}</BigNum>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>{s.sub}</p>
                  </Card>
                ))}
          </div>

          {/* Quick-action row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => router.push('/dashboard/quality')} style={{
              fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500,
              padding: '10px 22px', borderRadius: 'var(--r)', border: 'none',
              background: 'var(--primary)', color: '#fff', cursor: 'pointer', boxShadow: 'var(--primary-glow)',
            }}>⚡ Fix All Translations</button>
            <button onClick={() => router.push('/dashboard/context')} style={{
              fontFamily: 'var(--mono)', fontSize: '13px',
              padding: '10px 22px', borderRadius: 'var(--r)', border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-2)', cursor: 'pointer',
            }}>◎ Context Map</button>
          </div>

          <Card style={{ padding: '24px', marginBottom: '24px' }} className="fade-up">
            <Label>QUALITY IMPROVEMENT BY LOCALE</Label>
            {loading ? <div style={{ marginTop: '16px' }}><Skeleton className="h-[180px] w-full" /></div>
              : chartData.length === 0 ? (
                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)' }}>Quality tab → ⚡ Fix All to generate data</p>
                </div>
              ) : (
                <div style={{ marginTop: '20px', height: '200px' }}>
                  <ResponsiveContainer width="100%" height={220} minHeight={220}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <XAxis dataKey="locale" tick={{ fontFamily: 'var(--mono)', fontSize: 12, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: 'var(--mono)', fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `+${v}%`} />
                      <Tooltip
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)' }}
                        formatter={(v: unknown) => [`+${v}%`, 'improvement']}
                        cursor={{ fill: 'var(--surface-3)' }}
                      />
                      <Bar dataKey="improvement" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? 'var(--primary)' : 'var(--cyan)'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
          </Card>

          <Card style={{ padding: 0, overflow: 'hidden' }} className="fade-up">
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label>TOP IMPROVED KEYS</Label>
              {quality && quality.average_improvement > 0 && <Badge variant="primary">+{quality.average_improvement}% avg</Badge>}
            </div>
            {loading ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : topScores.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-3)' }}>No before/after data yet</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' }}>Quality tab → ⚡ Fix All</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['KEY', 'LOCALE', 'BEFORE', 'AFTER', 'Δ'].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topScores.map((s, i) => (
                    <tr key={i} className="row-hover fade-up" style={{ borderBottom: '1px solid var(--border)', animationDelay: `${i * 40}ms` }}>
                      <td style={{ padding: '13px 24px', fontFamily: 'var(--mono)', fontSize: '13px' }}>{s.key}</td>
                      <td style={{ padding: '13px 24px' }}><Badge variant="muted">{s.locale}</Badge></td>
                      <td style={{ padding: '13px 24px' }}><Badge variant="red">{s.before}</Badge></td>
                      <td style={{ padding: '13px 24px' }}><Badge variant="cyan">{s.after}</Badge></td>
                      <td style={{ padding: '13px 24px' }}><Badge variant="primary">+{s.improvement_percent}%</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {history.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <HistoryPanel history={history} onReload={url => startScan(url)} onClear={() => { localStorage.removeItem(HISTORY_KEY); refreshHistory() }} />
            </div>
          )}
        </>
      )}

      {/* Screenshot Viewer Modal */}
      {viewScreenshot && (
        <div
          className="fade-up"
          onClick={() => setViewScreenshot(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/screenshot?file=${encodeURIComponent(viewScreenshot)}`}
              alt="Full size screenshot"
              style={{
                maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain',
                border: '2px solid var(--border)', borderRadius: 'var(--r-lg)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
              }}
            />
            <div style={{
              position: 'absolute', top: '-40px', right: '0',
              fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-2)',
              background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: 'var(--r)',
            }}>
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
