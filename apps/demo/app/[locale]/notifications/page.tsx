'use client';

export default function NotificationsPage() {
  const notifications = [
    { title: 'New comment on "Website Redesign"', time: '2 minutes ago', unread: true },
    { title: 'Task completed: "Design homepage mockup"', time: '1 hour ago', unread: true },
    { title: 'Project "Mobile App" status changed to In Progress', time: '3 hours ago', unread: false },
    { title: 'Alex Chen mentioned you in a comment', time: 'Yesterday', unread: false },
    { title: 'New file uploaded: "requirements.pdf"', time: '2 days ago', unread: false },
  ];
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f4f4f5', marginBottom: 24 }}>Notifications</h1>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        {notifications.map((n, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: n.unread ? 'rgba(163,230,53,0.05)' : 'transparent' }}>
            <div>
              <p style={{ color: n.unread ? '#a3e635' : '#f4f4f5', fontWeight: n.unread ? 600 : 400, marginBottom: 4 }}>{n.title}</p>
              <span style={{ fontSize: 12, color: '#71717a' }}>{n.time}</span>
            </div>
            {n.unread && (
              <button style={{ background: '#a3e635', color: '#09090b', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Mark as Read</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
