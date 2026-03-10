'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',         label: 'Overview',    icon: '◈' },
  { href: '/context',  label: 'Context Map', icon: '◎' },
  { href: '/quality',  label: 'Quality',     icon: '◐' },
  { href: '/settings', label: 'Settings',    icon: '◇' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width: '220px',
      minWidth: '220px',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontWeight: 600,
          fontSize: '20px',
          color: 'var(--primary)',
          letterSpacing: '-0.02em',
        }}>
          glos
        </span>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
          translation context
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV.map(item => {
          const active = item.href === '/' ? path === '/' : path.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '7px',
              marginBottom: '2px',
              textDecoration: 'none',
              fontFamily: 'var(--mono)',
              fontSize: '13px',
              background: active ? 'var(--primary-dim)' : 'transparent',
              color: active ? 'var(--primary)' : 'var(--text-2)',
              borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 150ms',
            }}>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-3)' }}>v1.0.0</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>@chiragbuilds</div>
      </div>
    </aside>
  )
}
