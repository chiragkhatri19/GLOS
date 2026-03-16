'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

const links = [
  { href: 'dashboard',     label: 'Dashboard' },
  { href: 'projects',      label: 'Projects' },
  { href: 'team',          label: 'Team' },
  { href: 'billing',       label: 'Billing' },
  { href: 'settings',      label: 'Settings' },
  { href: 'notifications', label: 'Notifications' },
];

export default function Sidebar() {
  const pathname = usePathname() ?? '';
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';

  return (
    <aside style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: '#111113',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: '#a3e635' }}>Orbit</div>
        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>Project Management</div>
      </div>
      <nav>
        {links.map(l => {
          const fullHref = `/${locale}/${l.href}`;
          const active = pathname.includes(l.href);
          return (
            <Link key={l.href} href={fullHref} style={{
              display: 'block', padding: '10px 20px',
              fontFamily: 'monospace', fontSize: 13,
              color: active ? '#a3e635' : '#71717a',
              background: active ? 'rgba(163,230,53,0.06)' : 'transparent',
              borderLeft: `2px solid ${active ? '#a3e635' : 'transparent'}`,
              textDecoration: 'none',
            }}>
              {l.label}
            </Link>
          );
        })}
      </nav>
      
      {/* Locale switcher */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto', position: 'absolute', bottom: 0, width: 220 }}>
        <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8 }}>Language</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['en','ja','de','fr','es','ar'].map(loc => (
            <Link
              key={loc}
              href={pathname.replace(`/${locale}/`, `/${loc}/`)}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                background: locale === loc ? '#a3e635' : 'rgba(255,255,255,0.06)',
                color: locale === loc ? '#09090b' : '#71717a',
                textDecoration: 'none',
                fontWeight: locale === loc ? 700 : 400,
              }}
            >
              {loc.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
