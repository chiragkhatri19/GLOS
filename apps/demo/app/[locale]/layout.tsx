import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Acme' }

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-60 bg-gray-950 text-white flex flex-col py-6 px-4 shrink-0">
              <div className="text-white font-bold text-xl mb-8 px-2">Acme</div>
              <nav className="flex flex-col gap-1">
                {[
                  { href: `/${locale}/dashboard`, label: 'Dashboard' },
                  { href: `/${locale}/settings`, label: 'Settings' },
                  { href: `/${locale}/checkout`, label: 'Billing' },
                  { href: `/${locale}/account`, label: 'Account' },
                ].map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>
            {/* Main */}
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
