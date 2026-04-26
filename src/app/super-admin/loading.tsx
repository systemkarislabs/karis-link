import Skeleton from '@/components/Skeleton';

export default function SuperAdminLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
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
        <Skeleton width={128} height={36} radius={8} />
        <div style={{ height: 24 }} />
        <Skeleton height={40} radius={12} />
        <Skeleton height={40} radius={12} />
        <Skeleton height={40} radius={12} />
      </aside>

      <main className="main-content">
        <Skeleton width={176} height={32} radius={8} />
        <div style={{ height: 16 }} />
        <Skeleton width={300} height={28} />
        <div style={{ height: 8 }} />
        <Skeleton width={420} height={16} />
        <div style={{ height: 32 }} />

        <div style={{ display: 'grid', gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 18,
                padding: '20px 24px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Skeleton width={48} height={48} radius={14} />
              <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                <Skeleton width={180} height={16} />
                <Skeleton width={120} height={12} />
              </div>
              <Skeleton width={80} height={32} radius={10} />
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
