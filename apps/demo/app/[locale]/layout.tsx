import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Sidebar from '@/components/Sidebar';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px', color: '#f4f4f5' }}>
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
