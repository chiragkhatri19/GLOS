type BadgeVariant = 'primary' | 'cyan' | 'red' | 'amber' | 'muted' | 'green'

const styles: Record<BadgeVariant, React.CSSProperties> = {
  primary: { background: 'var(--primary-dim)', color: 'var(--primary)' },
  cyan:    { background: 'var(--cyan-dim)',     color: 'var(--cyan)' },
  red:     { background: 'var(--red-dim)',      color: 'var(--red)' },
  amber:   { background: 'rgba(245,158,11,0.12)', color: 'var(--amber)' },
  muted:   { background: 'var(--surface-3)',    color: 'var(--text-2)' },
  green:   { background: 'var(--green-dim)',    color: 'var(--green)' },
}

export function Badge({
  children,
  variant = 'muted',
}: {
  children: React.ReactNode
  variant?: BadgeVariant
}) {
  return (
    <span style={{
      ...styles[variant],
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {children}
    </span>
  )
}
