import prisma from '@/lib/prisma';
import { requireSuperAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getRecifePeriodStartDate, formatRecifeDateKey, formatRecifeWeekday } from '@/lib/recife-time';
import { ensureTenantCitySupport } from '@/lib/db-compat';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ tenantId?: string; period?: string }>;
};

export default async function ReportsPage(props: PageProps) {
  await requireSuperAuth();
  await ensureTenantCitySupport();
  const searchParams = await props.searchParams;
  const selectedTenantId = searchParams?.tenantId || 'all';
  const period = searchParams?.period || '30';

  const tenants = await prisma.tenant.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, active: true, _count: { select: { sellers: true } } },
  });

  const startDate = getRecifePeriodStartDate(period);

  // Explicit conditional queries — no type-spreading to avoid runtime issues
  const [totalVisits, totalClicks] = await Promise.all([
    selectedTenantId === 'all'
      ? prisma.pageClickEvent.count({
          where: { source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
        })
      : prisma.pageClickEvent.count({
          where: { tenantId: selectedTenantId, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
        }),
    selectedTenantId === 'all'
      ? prisma.sellerClickEvent.count({
          where: { source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
        })
      : prisma.sellerClickEvent.count({
          where: { seller: { tenantId: selectedTenantId }, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
        }),
  ]);

  // Per-tenant stats
  const tenantStats = await Promise.all(
    tenants.map(async (t) => {
      const [visits, clicks] = await Promise.all([
        prisma.pageClickEvent.count({
          where: { tenantId: t.id, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
        }),
        prisma.sellerClickEvent.count({
          where: { seller: { tenantId: t.id }, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
        }),
      ]);
      const conv = visits > 0 ? (clicks / visits) * 100 : 0;
      return { ...t, visits, clicks, conv };
    }),
  );

  // Chart: last 7 days
  const chart7Start = new Date();
  chart7Start.setDate(chart7Start.getDate() - 6);
  chart7Start.setHours(0, 0, 0, 0);

  const [chartVisitEvents, chartClickEvents] = await Promise.all([
    selectedTenantId === 'all'
      ? prisma.pageClickEvent.findMany({
          where: { source: { in: ['qr', 'bio'] }, createdAt: { gte: chart7Start } },
          select: { createdAt: true },
        })
      : prisma.pageClickEvent.findMany({
          where: { tenantId: selectedTenantId, source: { in: ['qr', 'bio'] }, createdAt: { gte: chart7Start } },
          select: { createdAt: true },
        }),
    selectedTenantId === 'all'
      ? prisma.sellerClickEvent.findMany({
          where: { source: { in: ['qr', 'bio'] }, createdAt: { gte: chart7Start } },
          select: { createdAt: true },
        })
      : prisma.sellerClickEvent.findMany({
          where: { seller: { tenantId: selectedTenantId }, source: { in: ['qr', 'bio'] }, createdAt: { gte: chart7Start } },
          select: { createdAt: true },
        }),
  ]);

  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: formatRecifeDateKey(d), label: formatRecifeWeekday(d), visits: 0, clicks: 0 };
  });

  for (const ev of chartVisitEvents) {
    const slot = chartDays.find((d) => d.key === formatRecifeDateKey(ev.createdAt));
    if (slot) slot.visits += 1;
  }
  for (const ev of chartClickEvents) {
    const slot = chartDays.find((d) => d.key === formatRecifeDateKey(ev.createdAt));
    if (slot) slot.clicks += 1;
  }

  const maxBar = Math.max(...chartDays.map((d) => d.visits), 1);
  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';
  const periodLabels: Record<string, string> = { '7': '7 dias', '30': '30 dias', '90': '3 meses' };

  const periodActions = (
    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
      {[{ v: '7', l: '7d' }, { v: '30', l: '30d' }, { v: '90', l: '90d' }].map(({ v, l }) => (
        <Link
          key={v}
          href={`/super-admin/relatorios?period=${v}${selectedTenantId !== 'all' ? `&tenantId=${selectedTenantId}` : ''}`}
          style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none',
            background: period === v ? '#0f1c3f' : 'transparent',
            color: period === v ? '#fff' : 'var(--text-soft)',
          }}
        >
          {l}
        </Link>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar
        isSuper
        pageTitle="Relatórios"
        pageSubtitle={`Últimos ${periodLabels[period] ?? period + ' dias'} · ${selectedTenantId === 'all' ? 'todas as empresas' : (tenants.find((t) => t.id === selectedTenantId)?.name ?? '')}`}
        actions={periodActions}
      />

      <main className="main-content kl-page-enter">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
            Relatórios
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-soft)' }}>
            Performance global ou individual das operações.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters */}
          <form
            method="get"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '14px 18px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <input type="hidden" name="period" value={period} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 180px', minWidth: 140 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Empresa
              </label>
              <select name="tenantId" defaultValue={selectedTenantId} className="kl-soft-field" style={{ fontSize: 13 }}>
                <option value="all">Todas as empresas</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              style={{
                height: 40, padding: '0 18px', background: '#0f1c3f', color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}
            >
              <Icon name="target" size={14} color="#fff" />
              Filtrar
            </button>
          </form>

          {/* KPI cards */}
          <div className="kl-kpi-grid">
            {[
              { label: 'Total Visitas', value: totalVisits.toLocaleString('pt-BR'), icon: 'eye' as const, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Escolhas', value: totalClicks.toLocaleString('pt-BR'), icon: 'mouse' as const, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Conversão', value: `${conversion}%`, icon: 'trending' as const, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Empresas', value: String(tenants.length), icon: 'building' as const, color: '#f59e0b', bg: '#fffbeb' },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '18px 20px', boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    {card.label}
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={card.icon} size={14} color={card.color} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
                  {card.value}
                </div>
                {card.label === 'Conversão' && (
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>{periodLabels[period] ?? ''}</div>
                )}
              </div>
            ))}
          </div>

          {/* 7-day bar chart */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Últimos 7 dias
              </h3>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-soft)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                  Visitas
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                  Escolhas
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, alignItems: 'end', height: 120 }}>
              {chartDays.map((day) => (
                <div key={day.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', flex: 1, justifyContent: 'center' }}>
                    <div style={{ width: '42%', background: '#16a34a', borderRadius: '3px 3px 0 0', minHeight: 2, height: `${Math.max(Math.round((day.visits / maxBar) * 100), day.visits > 0 ? 4 : 0)}%`, opacity: day.visits > 0 ? 1 : 0.15 }} />
                    <div style={{ width: '42%', background: '#3b82f6', borderRadius: '3px 3px 0 0', minHeight: 2, height: `${Math.max(Math.round((day.clicks / maxBar) * 100), day.clicks > 0 ? 4 : 0)}%`, opacity: day.clicks > 0 ? 1 : 0.15 }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-soft)', textTransform: 'capitalize', letterSpacing: '.02em' }}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Per-tenant table */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Por Empresa
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                    {['Empresa', 'Vendedores', 'Visitas', 'Escolhas', 'Conversão', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Empresa' ? 'left' : 'center', fontWeight: 700, fontSize: 11, color: 'var(--text-soft)', letterSpacing: '.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenantStats
                    .filter((t) => selectedTenantId === 'all' || t.id === selectedTenantId)
                    .map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#0f1c3f18', border: '1px solid #0f1c3f22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#0f1c3f' }}>
                              {t.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-soft)', fontFamily: 'monospace' }}>/{t.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>{t._count.sellers}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>{t.visits.toLocaleString('pt-BR')}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>{t.clicks.toLocaleString('pt-BR')}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, color: t.conv > 50 ? '#16a34a' : t.conv > 30 ? '#f59e0b' : 'var(--text-soft)' }}>
                            {t.visits > 0 ? t.conv.toFixed(1) + '%' : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: t.active ? '#f0fdf4' : '#f4f4f5', color: t.active ? '#16a34a' : '#71717a' }}>
                            {t.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
