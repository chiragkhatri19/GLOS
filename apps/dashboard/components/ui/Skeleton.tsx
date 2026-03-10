export function Skeleton({ width = '100%', height = '16px' }: { width?: string; height?: string }) {
  return <div className="skeleton" style={{ width, height }} />
}

export function StatCardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '28px',
    }}>
      <Skeleton width="80px" height="11px" />
      <div style={{ marginTop: '16px' }}><Skeleton width="60px" height="52px" /></div>
      <div style={{ marginTop: '10px' }}><Skeleton width="120px" height="13px" /></div>
    </div>
  )
}
