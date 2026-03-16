'use client';

export default function TeamPage() {
  const members = ['Alex Chen', 'Sara Kim', 'James Wu', 'Priya Patel', 'Tom Berg'];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f4f4f5' }}>Team</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: '#a3e635', color: '#09090b', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Invite Member</button>
          <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>Send Invite</button>
        </div>
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        {members.map((m, i) => (
          <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < members.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090b', fontWeight: 700, fontSize: 14 }}>
                {m[0]}
              </div>
              <span style={{ color: '#f4f4f5' }}>{m}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Assign</button>
              <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Unassign</button>
              <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Edit</button>
              <button style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
