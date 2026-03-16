'use client';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations();
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#f4f4f5' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {['Active Projects: 12', 'Tasks Done: 89', 'Team Members: 6'].map(s => (
          <div key={s} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <p style={{ color: '#71717a', fontSize: 12 }}>{s}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16, color: '#f4f4f5' }}>Recent Projects</h2>
        {['Alpha', 'Beta', 'Gamma'].map(p => (
          <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#f4f4f5' }}>{p}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: '#a3e635', color: '#09090b', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>{t('continue')}</button>
              <button style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>{t('archive')}</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ background: '#a3e635', color: '#09090b', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>{t('new_project')}</button>
        <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>{t('export')}</button>
        <button style={{ background: '#34d399', color: '#09090b', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>{t('mark_as_done')}</button>
        <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>{t('done')}</button>
      </div>
    </div>
  );
}
