'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

// Exported so Overview page can call it after scan completes
export const SCAN_DONE_KEY = 'glos_scan_done'

export function Sidebar() {
  const path = usePathname()
  const [scanDone, setScanDone] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Read from localStorage — updates when storage changes (e.g. after scan)
  useEffect(() => {
    const check = () => setScanDone(!!localStorage.getItem(SCAN_DONE_KEY))
    check()
    window.addEventListener('storage', check)
    // Also poll every 2s so same-tab updates are caught
    const t = setInterval(check, 2000)
    return () => { window.removeEventListener('storage', check); clearInterval(t) }
  }, [])

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const NAV = [
    { href: '/dashboard',         label: 'Overview',    icon: '◈', always: true  },
    { href: '/dashboard/quality', label: 'Quality',     icon: '⚡', always: false },
    { href: '/dashboard/results', label: 'Results',     icon: '◎', always: false },
    { href: '/dashboard/context', label: 'Context Map', icon: '⬡', always: false },
    { href: '/dashboard/settings',label: 'Settings',    icon: '⚙', always: true  },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 50,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            padding: '8px',
            borderRadius: 'var(--r-sm)',
            color: 'var(--text)',
            cursor: 'pointer'
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
              backdropFilter: 'blur(2px)'
            }}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -208) : 0,
          width: isMobile ? 208 : (isOpen ? 64 : 208),
          minWidth: isMobile ? 208 : (isOpen ? 64 : 208)
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        style={{
          height: '100vh',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          zIndex: 45,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
          overflow: 'hidden',
        }}
      >
      {/* Logo */}
      <div style={{ 
        padding: isOpen && !isMobile ? '0 16px 18px' : '0 18px 18px', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
      }}>
        <div style={{ opacity: isOpen && !isMobile ? 0 : 1, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
          <Link href="/" style={{
            fontFamily: 'var(--mono)', fontWeight: 700,
            fontSize: '20px', color: 'var(--primary)', letterSpacing: '-0.03em',
            textDecoration: 'none', display: 'inline-block',
            transition: 'all 300ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.textShadow = '0 0 20px rgba(163,230,53,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.textShadow = 'none';
          }}>
            glos.io
          </Link>
          <div style={{
            fontFamily: 'var(--sans)', fontSize: '10px',
            color: 'var(--text-3)', marginTop: '4px',
          }}>
            Translation Quality Dashboard
          </div>
        </div>
        
        {/* Mobile Close Button */}
        {isMobile && isOpen && (
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ padding: '14px 10px', flex: 1 }}>
        {NAV.map(({ href, label, icon, always }) => {
          const active = href === '/dashboard'
            ? path === '/dashboard'
            : path.startsWith(href)
          const locked = !always && !scanDone

          if (locked) {
            return (
              <div
                key={href}
                title="Scan your app first to unlock"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px',
                  borderRadius: 'var(--r-sm)',
                  marginBottom: '2px',
                  fontFamily: 'var(--mono)',
                  fontSize: '13px',
                  color: 'var(--text-3)',
                  cursor: 'not-allowed',
                  opacity: 0.4,
                  userSelect: 'none' as const,
                  borderLeft: '2px solid transparent',
                  justifyContent: (!isMobile && isOpen) ? 'center' : 'flex-start',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '11px', opacity: 0.7, flexShrink: 0 }}>{icon}</span>
                {(!isOpen || isMobile) && <span style={{ opacity: (!isMobile && isOpen) ? 0 : 1, transition: 'opacity 0.2s' }}>{label}</span>}
                {(!isOpen || isMobile) && <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.6 }}>🔒</span>}
              </div>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className="nav-link-hover"
              onClick={() => isMobile && setIsOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: active ? '8px 8px 8px 8px' : '8px 10px',
                borderRadius: 'var(--r-sm)',
                marginBottom: '2px',
                textDecoration: 'none',
                fontFamily: 'var(--mono)',
                fontSize: '13px',
                letterSpacing: '-0.01em',
                color: active ? 'var(--text)' : 'var(--text-2)',
                background: active ? 'var(--surface-3)' : 'transparent',
                borderLeft: `2px solid ${active ? 'var(--primary)' : 'transparent'}`,
                paddingLeft: active ? '8px' : '10px',
                transition: 'all 150ms ease',
                justifyContent: (!isMobile && isOpen) ? 'center' : 'flex-start',
                whiteSpace: 'nowrap',
              }}
              title={(!isMobile && isOpen) ? label : undefined}
            >
              <span style={{ fontSize: '11px', opacity: active ? 1 : 0.5, flexShrink: 0 }}>{icon}</span>
              {(!isOpen || isMobile) && <span style={{ opacity: (!isMobile && isOpen) ? 0 : 1, transition: 'opacity 0.2s' }}>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Scan status hint */}
      {(!isOpen || isMobile) && !scanDone && (
        <div style={{
          margin: '0 10px 12px',
          padding: '10px 12px',
          background: 'rgba(163,230,53,0.08)',
          border: '1px solid rgba(163,230,53,0.2)',
          borderRadius: 'var(--r)',
        }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--primary)', marginBottom: '3px', fontWeight: 600 }}>
            Getting started
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.5 }}>
            Add your app on Overview to unlock Quality &amp; Context Map
          </div>
        </div>
      )}

      {/* Footer status */}
      <div style={{ 
        padding: '14px 18px', 
        borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: (!isOpen || isMobile) ? 'flex-start' : 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: (!isOpen || isMobile) ? '6px' : '0' }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: scanDone ? 'var(--cyan)' : 'var(--green)',
            display: 'inline-block', flexShrink: 0,
            animation: 'pulse 3s ease-in-out infinite',
          }} title={scanDone ? 'scanned' : 'ready'} />
          {(!isOpen || isMobile) && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-2)' }}>
              {scanDone ? 'scanned' : 'ready'}
            </span>
          )}
        </div>
        {(!isOpen || isMobile) && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
            v1.0.0 · @chiragbuilds
          </div>
        )}
      </div>
    </motion.aside>
    </>
  )
}
