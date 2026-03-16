import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}>
        <Sidebar />
        <main className="mobile-p-4" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '44px 48px',
          scrollbarWidth: 'thin',
          position: 'relative',
        } as React.CSSProperties}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  )
}
