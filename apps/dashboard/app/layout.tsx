import type { Metadata } from 'next'
import { DM_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'glos — Translation Quality Dashboard',
  description: 'Give your translations context.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
