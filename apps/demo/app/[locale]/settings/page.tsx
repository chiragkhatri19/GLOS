'use client';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations();
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f4f4f5', marginBottom: 24 }}>Settings</h1>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <h2 style={{ color: '#f4f4f5', marginBottom: 16 }}>Profile</h2>
        <input placeholder="Name" defaultValue="Alex Chen" style={{ display: 'block', width: '100%', marginBottom: 12, background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f4f4f5' }} />
        <input placeholder="Email" defaultValue="alex@orbit.io" style={{ display: 'block', width: '100%', marginBottom: 16, background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f4f4f5' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: '#a3e635', color: '#09090b', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>{t('save_changes')}</button>
          <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>{t('cancel')}</button>
        </div>
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
        <h2 style={{ color: '#f4f4f5', marginBottom: 16 }}>Preferences</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#71717a' }}>Email notifications</span>
          <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#71717a' }}>Dark mode</span>
          <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#71717a' }}>Two-factor auth</span>
          <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>Enable</button>
        </div>
      </div>
    </div>
  );
}
