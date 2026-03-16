export function Card({
  children, style, accent, onClick, className,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  accent?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={`card-hover ${className ?? ''}`}
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${accent ? 'var(--border-accent)' : 'var(--border)'}`,
        borderLeft: accent ? '2px solid var(--primary)' : undefined,
        boxShadow: accent ? 'var(--primary-glow)' : undefined,
        borderRadius: 'var(--r)',
        transition: 'border-color 200ms',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
