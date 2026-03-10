'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type RunStatus = 'idle' | 'running' | 'success' | 'error'

interface Result {
  ok: boolean
  message: string
}

function Input({ label, value, onChange, placeholder, hint }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  hint?: string
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '7px',
          padding: '10px 14px',
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          color: 'var(--text)',
          outline: 'none',
        }}
      />
      {hint && <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>{hint}</div>}
    </div>
  )
}

function RunButton({ status, label, onClick }: { status: RunStatus; label: string; onClick: () => void }) {
  const busy = status === 'running'
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        padding: '11px 24px',
        background: busy ? 'var(--surface-3)' : 'var(--primary)',
        color: busy ? 'var(--text-3)' : '#fff',
        border: 'none',
        borderRadius: '7px',
        fontFamily: 'var(--mono)',
        fontSize: '13px',
        cursor: busy ? 'not-allowed' : 'pointer',
        transition: 'all 150ms',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {busy && <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>}
      {busy ? 'Running…' : label}
    </button>
  )
}

function ResultBanner({ result }: { result: Result | null }) {
  if (!result) return null
  return (
    <div style={{
      marginTop: '14px',
      padding: '12px 16px',
      background: result.ok ? 'var(--green-dim)' : 'var(--red-dim)',
      border: `1px solid ${result.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
      borderRadius: '7px',
      fontFamily: 'var(--mono)',
      fontSize: '12px',
      color: result.ok ? 'var(--green)' : 'var(--red)',
    }}>
      {result.ok ? '✓' : '✗'} {result.message}
    </div>
  )
}

const LOCALE_OPTIONS = ['ja', 'de', 'ar', 'fr', 'es', 'zh']

export default function SettingsPage() {
  // Capture
  const [captureUrl, setCaptureUrl] = useState('http://localhost:3001')
  const [captureRoutes, setCaptureRoutes] = useState('/en/settings,/en/checkout,/en/account,/en/dashboard')
  const [captureStatus, setCaptureStatus] = useState<RunStatus>('idle')
  const [captureResult, setCaptureResult] = useState<Result | null>(null)

  // Translate
  const [selectedLocales, setSelectedLocales] = useState<string[]>(['ja', 'de', 'ar'])
  const [translateStatus, setTranslateStatus] = useState<RunStatus>('idle')
  const [translateResult, setTranslateResult] = useState<Result | null>(null)

  const toggleLocale = (l: string) =>
    setSelectedLocales(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])

  async function runCapture() {
    setCaptureStatus('running')
    setCaptureResult(null)
    try {
      const routes = captureRoutes.split(',').map(r => r.trim()).filter(Boolean)
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: captureUrl, routes }),
      })
      const data = await res.json()
      if (data.success) {
        setCaptureStatus('success')
        setCaptureResult({ ok: true, message: `Captured ${data.routes_analyzed} routes · ${data.keys_mapped} keys mapped` })
      } else {
        setCaptureStatus('error')
        setCaptureResult({ ok: false, message: data.error ?? 'Capture failed' })
      }
    } catch (err: any) {
      setCaptureStatus('error')
      setCaptureResult({ ok: false, message: err.message ?? 'Network error' })
    }
  }

  async function runTranslate() {
    if (!selectedLocales.length) return
    setTranslateStatus('running')
    setTranslateResult(null)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locales: selectedLocales }),
      })
      const data = await res.json()
      if (data.success) {
        setTranslateStatus('success')
        setTranslateResult({ ok: true, message: `Translated: ${data.locales_translated.join(', ')}` })
      } else {
        setTranslateStatus('error')
        setTranslateResult({ ok: false, message: data.error ?? 'Translation failed' })
      }
    } catch (err: any) {
      setTranslateStatus('error')
      setTranslateResult({ ok: false, message: err.message ?? 'Network error' })
    }
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
          Run the glos pipeline from the browser.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Capture */}
        <Card style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '18px', color: 'var(--primary)' }}>◎</span>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--text)', fontWeight: 600 }}>Capture</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>Screenshot app → Gemini Vision → context file</div>
            </div>
          </div>

          <Input
            label="App URL"
            value={captureUrl}
            onChange={setCaptureUrl}
            placeholder="http://localhost:3001"
            hint="Your running app URL"
          />
          <Input
            label="Routes (comma-separated)"
            value={captureRoutes}
            onChange={setCaptureRoutes}
            placeholder="/en/settings,/en/checkout"
            hint="Leave empty to auto-discover via sitemap.xml"
          />

          <RunButton status={captureStatus} label="◎ Run Capture" onClick={runCapture} />
          <ResultBanner result={captureResult} />
        </Card>

        {/* Translate */}
        <Card style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '18px', color: 'var(--cyan)' }}>◐</span>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--text)', fontWeight: 600 }}>Translate</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>Inject context hints → Lingo.dev → locale files</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Target Locales
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {LOCALE_OPTIONS.map(l => {
                const active = selectedLocales.includes(l)
                return (
                  <button
                    key={l}
                    onClick={() => toggleLocale(l)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                      background: active ? 'var(--primary-dim)' : 'transparent',
                      color: active ? 'var(--primary)' : 'var(--text-2)',
                      fontFamily: 'var(--mono)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
          </div>

          <RunButton status={translateStatus} label="◐ Run Translate" onClick={runTranslate} />
          <ResultBanner result={translateResult} />
        </Card>
      </div>

      {/* API key status */}
      <Card style={{ padding: '24px', marginTop: '20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Environment
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { key: 'GEMINI_API_KEY', label: 'Gemini Vision', required: true },
            { key: 'LINGODOTDEV_API_KEY', label: 'Lingo.dev', required: true },
            { key: 'SUPABASE_URL', label: 'Supabase', required: false },
          ].map(item => (
            <div key={item.key} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 16px',
            }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '8px' }}>{item.key}</div>
              <Badge variant={item.required ? 'amber' : 'muted'}>{item.required ? 'required' : 'optional'}</Badge>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '12px' }}>
          Set these in <code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>.env.local</code> in the dashboard app directory.
        </div>
      </Card>

      {/* Pipeline flow diagram */}
      <Card style={{ padding: '24px', marginTop: '20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Pipeline Flow
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Playwright', desc: 'Screenshots routes', color: 'var(--primary)' },
            { label: '→', color: 'var(--text-3)', desc: '' },
            { label: 'Gemini Vision', desc: 'Extracts UI context', color: 'var(--cyan)' },
            { label: '→', color: 'var(--text-3)', desc: '' },
            { label: 'glos.context.json', desc: 'Key → context map', color: 'var(--amber)' },
            { label: '→', color: 'var(--text-3)', desc: '' },
            { label: 'Lingo.dev', desc: 'Context-aware translation', color: 'var(--green)' },
          ].map((step, i) => step.label === '→' ? (
            <span key={i} style={{ fontFamily: 'var(--mono)', fontSize: '18px', color: step.color, opacity: 0.4 }}>→</span>
          ) : (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: step.color, fontWeight: 600 }}>{step.label}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

