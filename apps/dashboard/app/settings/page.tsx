'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'

function Label({ children }: { children: string }) {
  return (
    <label style={{
      fontFamily: 'var(--sans)',
      fontSize: '12px',
      fontWeight: 500,
      color: 'var(--text-2)',
      display: 'block',
      marginBottom: '6px',
    }}>
      {children}
    </label>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
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
  )
}

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('')
  const [lingoKey, setLingoKey] = useState('')

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '26px', letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Settings
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>
          API keys are stored in your .env.local file only
        </p>
      </div>

      {/* API Keys */}
      <Card style={{ padding: '28px', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text)', marginBottom: '20px' }}>
          API Keys
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <Label>GEMINI API KEY</Label>
            <Input
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              type="password"
            />
            <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' }}>
              Free at aistudio.google.com/apikey — used for Playwright + Vision
            </p>
          </div>
          <div>
            <Label>LINGO.DEV API KEY</Label>
            <Input
              value={lingoKey}
              onChange={e => setLingoKey(e.target.value)}
              placeholder="lingo_..."
              type="password"
            />
            <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' }}>
              From lingo.dev dashboard — used for context-aware translation
            </p>
          </div>
        </div>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--text-3)',
          marginTop: '20px',
          padding: '12px',
          background: 'var(--surface-3)',
          borderRadius: '6px',
        }}>
          Add these to your .env.local file — never commit API keys to git
        </p>
      </Card>

      {/* GitHub Action snippet */}
      <Card accent style={{ padding: '28px' }}>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text)', marginBottom: '16px' }}>
          GitHub Action
        </h2>
        <pre style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--text-2)',
          background: 'var(--surface-3)',
          padding: '16px',
          borderRadius: '7px',
          overflowX: 'auto',
          lineHeight: 1.7,
        }}>
{`- uses: actions/checkout@v4
- name: Run glos
  run: |
    npx @chiragbuilds/glos capture \\
      --url \${{ vars.DEMO_APP_URL }}
    npx @chiragbuilds/glos translate \\
      --locales ja,de,ar
  env:
    GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
    LINGODOTDEV_API_KEY: \${{ secrets.LINGODOTDEV_API_KEY }}`}
        </pre>
      </Card>
    </div>
  )
}
