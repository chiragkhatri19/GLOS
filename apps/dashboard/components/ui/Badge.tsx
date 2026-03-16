type Variant = 'primary' | 'cyan' | 'red' | 'amber' | 'green' | 'muted'

const STYLES: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--primary-dim)', color: 'var(--primary)',  border: '1px solid rgba(99,102,241,0.2)'  },
  cyan:    { background: 'var(--cyan-dim)',    color: 'var(--cyan)',     border: '1px solid rgba(34,211,238,0.2)'  },
  red:     { background: 'var(--red-dim)',     color: 'var(--red)',      border: '1px solid rgba(248,113,113,0.2)' },
  amber:   { background: 'var(--amber-dim)',   color: 'var(--amber)',    border: '1px solid rgba(251,191,36,0.2)'  },
  green:   { background: 'var(--green-dim)',   color: 'var(--green)',    border: '1px solid rgba(52,211,153,0.2)'  },
  muted:   { background: 'var(--surface-3)',   color: 'var(--text-2)',   border: '1px solid var(--border)'         },
}

export function Badge({
  children,
  variant = 'muted',
  size = 'sm',
}: {
  children: React.ReactNode
  variant?: Variant
  size?: 'xs' | 'sm'
}) {
  return (
    <span style={{
      ...STYLES[variant],
      fontFamily: 'var(--mono)',
      fontSize: size === 'xs' ? '10px' : '12px',
      fontWeight: 500,
      padding: size === 'xs' ? '1px 6px' : '2px 9px',
      borderRadius: '5px',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {children}
    </span>
  )
}
