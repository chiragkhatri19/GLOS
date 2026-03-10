interface CardProps {
  children: React.ReactNode
  className?: string
  accent?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ children, className = '', accent = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-2)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${accent ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
        borderLeft: accent ? '2px solid var(--primary)' : undefined,
        boxShadow: accent ? 'var(--primary-glow)' : undefined,
        borderRadius: '10px',
        transition: 'border-color 200ms, box-shadow 200ms',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}
