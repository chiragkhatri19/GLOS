import type { Metadata } from 'next'
import { IBM_Plex_Mono, Geist } from 'next/font/google'
import { Sidebar } from '@/components/layout/Sidebar'
import './globals.css'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'glos — Translation Quality Dashboard',
  description: 'Give your translations context.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} ${geist.variable}`}>
      <body style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
