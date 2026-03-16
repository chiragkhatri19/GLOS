'use client'
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── types ── */
type ToastVariant = 'success' | 'error' | 'info'
interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })
export const useToast = () => useContext(ToastContext)

/* ── styles per variant ── */
const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; color: string; icon: string }> = {
  success: {
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.3)',
    color: '#34d399',
    icon: '✓',
  },
  error: {
    bg: 'rgba(248,113,113,0.12)',
    border: 'rgba(248,113,113,0.3)',
    color: '#f87171',
    icon: '✕',
  },
  info: {
    bg: 'rgba(34,211,238,0.12)',
    border: 'rgba(34,211,238,0.3)',
    color: '#22d3ee',
    icon: 'ℹ',
  },
}

/* ── single toast ── */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const s = VARIANT_STYLES[toast.variant]
  const dur = toast.duration ?? 4000

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), dur)
    return () => clearTimeout(t)
  }, [toast.id, dur, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '10px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        minWidth: '280px',
        maxWidth: '400px',
        overflow: 'hidden',
        position: 'relative' as const,
      }}
      onClick={() => onDismiss(toast.id)}
    >
      {/* icon */}
      <span style={{
        width: '24px', height: '24px', borderRadius: '50%',
        background: s.border, color: s.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700, flexShrink: 0,
      }}>
        {s.icon}
      </span>
      {/* message */}
      <span style={{
        fontFamily: 'var(--sans)', fontSize: '13px', color: '#ddddf2',
        lineHeight: 1.5, flex: 1,
      }}>
        {toast.message}
      </span>
      {/* auto-dismiss progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: dur / 1000, ease: 'linear' }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px', background: s.color, transformOrigin: 'left',
          opacity: 0.5,
        }}
      />
    </motion.div>
  )
}

/* ── provider ── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration?: number) => {
    const id = `toast-${++counterRef.current}`
    setToasts(prev => [...prev.slice(-2), { id, message, variant, duration }]) // max 3
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* toast container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: 9999, pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
