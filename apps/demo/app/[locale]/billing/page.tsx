'use client';

export default function BillingPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f4f4f5', marginBottom: 24 }}>Billing</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { name: 'Starter', price: '$9/mo', action: 'Downgrade', style: { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' } },
          { name: 'Enterprise', price: '$99/mo', action: 'Upgrade', style: { background: '#a3e635', color: '#09090b', border: 'none', fontWeight: 700 } },
        ].map(plan => (
          <div key={plan.name} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ color: '#f4f4f5', marginBottom: 8 }}>{plan.name}</h2>
            <p style={{ color: '#71717a', marginBottom: 16 }}>{plan.price}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...plan.style, borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>{plan.action}</button>
              <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>Subscribe</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
        <h2 style={{ color: '#f4f4f5', marginBottom: 16 }}>Payment Method</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#71717a' }}>•••• •••• •••• 4242</span>
          <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>Update</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: '#a3e635', color: '#09090b', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}>Download</button>
          <button style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>Unsubscribe</button>
        </div>
      </div>
    </div>
  );
}
