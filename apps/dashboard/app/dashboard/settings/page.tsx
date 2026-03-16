'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 600,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--text-3)',
      marginBottom: '16px',
    }}>{children}</div>
  )
}

function InputField({
  label, type = 'text', placeholder, hint, value, onChange,
}: {
  label: string
  type?: string
  placeholder: string
  hint?: string
  value: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 500,
        color: 'var(--text-2)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px',
      }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'var(--surface-2)',
          border: `1px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--r)', padding: '10px 14px',
          fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)',
          outline: 'none', transition: 'border-color 150ms',
          marginBottom: hint ? '8px' : '0',
        }}
      />
      {hint && (
        <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('')
  const [saved, setSaved]         = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '26px', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '5px' }}>
          API configuration and CI/CD integration
        </p>
      </div>

      {/* ── API Keys ─────────────────────────────────────────────────── */}
      <Card style={{ padding: '28px', marginBottom: '16px' }}>
        <SectionLabel>API Keys</SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <InputField
            label="Gemini API Key"
            type="password"
            placeholder="AIzaSy..."
            value={geminiKey}
            onChange={setGeminiKey}
            hint="Free at aistudio.google.com — 1,500 requests/day on free tier"
          />
        </div>

        {/* Security warning */}
        <div style={{
          background: 'var(--red-dim)', borderLeft: '2px solid var(--red)',
          borderRadius: 'var(--r-sm)', padding: '12px 14px', marginTop: '20px',
        }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--red)' }}>
            Never commit API keys to git — use .env.local only
          </p>
        </div>

        {/* Save button */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={!geminiKey.trim()}
            style={{
              fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500,
              padding: '10px 24px', borderRadius: 'var(--r)', border: 'none',
              background: geminiKey.trim() ? (saved ? 'var(--green)' : 'var(--primary)') : 'var(--surface-3)',
              color: geminiKey.trim() ? '#fff' : 'var(--text-3)',
              cursor: geminiKey.trim() ? 'pointer' : 'not-allowed',
              boxShadow: geminiKey.trim() && !saved ? 'var(--primary-glow)' : 'none',
              transition: 'all 200ms',
            }}
          >
            {saved ? '✓ Saved' : 'Save Key'}
          </button>
        </div>
      </Card>

      {/* ── Env file example ─────────────────────────────────────────── */}
      <Card style={{ padding: '28px', marginBottom: '16px' }}>
        <SectionLabel>.env.local</SectionLabel>
        <pre style={{
          fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: 1.75,
          background: 'var(--surface-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', padding: '16px', overflowX: 'auto',
          color: 'var(--text-2)',
        }}>
{`GEMINI_API_KEY=AIzaSy...your-key-here
# Optional: Lingo.dev integration
LINGODOTDEV_API_KEY=lingo_...`}
        </pre>
      </Card>

      {/* ── CI/CD Integration ─────────────────────────────────────────── */}
      <Card style={{ padding: '28px', border: '1px solid var(--border-accent)' }}>
        <SectionLabel>CI/CD Integration</SectionLabel>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '16px' }}>
          Add this GitHub Actions workflow to automatically run glos on every push to <code style={{ fontFamily: 'var(--mono)', fontSize: '12px', background: 'var(--surface-3)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text)' }}>main</code> when messages change.
        </p>
        <pre style={{
          fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: 1.75,
          background: 'var(--surface-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', padding: '16px', overflowX: 'auto',
          color: 'var(--text-2)',
        }}>
{`name: glos Translation Quality
on:
  push:
    branches: [main]
    paths: ['messages/**']

jobs:
  glos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run glos
        run: |
          npx @chiragbuilds/glos capture \\
            --url \${{ vars.DEMO_APP_URL }}
          npx @chiragbuilds/glos translate \\
            --locales ja,de,ar,fr,es
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}`}
        </pre>

        {/* Steps */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { step: '1', text: 'Add GEMINI_API_KEY to your repository secrets' },
            { step: '2', text: 'Add DEMO_APP_URL to your repository variables (e.g. https://staging.yourapp.com)' },
            { step: '3', text: 'Copy this workflow to .github/workflows/glos.yml' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--primary)',
                background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '999px', width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{step}</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
