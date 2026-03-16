'use client';

export default function ProjectsPage() {
  const projects = ['Website Redesign', 'Mobile App', 'API Integration', 'Dashboard v2', 'Analytics'];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f4f4f5' }}>Projects</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: '#a3e635', color: '#09090b', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Create Project</button>
          <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>Import</button>
        </div>
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        {projects.map((p, i) => (
          <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < projects.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <span style={{ color: '#f4f4f5', fontWeight: 500 }}>{p}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Edit</button>
              <button style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Duplicate</button>
              <button style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Archive</button>
              <button style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
