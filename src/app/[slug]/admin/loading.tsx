import Skeleton from '@/components/Skeleton';

export default function AdminDashboardLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      {/* Sidebar placeholder */}
      <aside
        aria-hidden="true"
        style={{
          width: 280,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          padding: '32px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
        className="kl-skeleton-sidebar"
      >
        <Skeleton width={148} height={36} radius={8} />
        <div style={{ height: 24 }} />
        <Skeleton height={40} radius={12} />
        <Skeleton height={40} radius={12} />
        <Skeleton height={40} radius={12} />
      </aside>

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <Skeleton width={260} height={28} radius={8} />
          <div style={{ height: 8 }} />
          <Skeleton width={360} height={16} radius={8} />
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 20,
                padding: 24,
                border: '1px solid var(--border)',
                display: 'grid',
                gap: 12,
              }}
            >
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={32} />
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
          }}
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 20,
                padding: 32,
                border: '1px solid var(--border)',
                display: 'grid',
                gap: 16,
              }}
            >
              <Skeleton width={180} height={20} />
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} height={14} />
              ))}
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .kl-skeleton-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
