import prisma from '@/lib/prisma';
import { requireSuperAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';
import { getRecifePeriodStartDate } from '@/lib/recife-time';
import { ensureTenantCitySupport } from '@/lib/db-compat';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ tenantId?: string; period?: string }>;
};

export default async function ReportsPage(props: PageProps) {
  await requireSuperAuth();
  await ensureTenantCitySupport();
  const searchParams = await props.searchParams;
  const tenantId = searchParams?.tenantId || 'all';
  const period = searchParams?.period || '30';

  const tenants = await prisma.tenant.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, active: true, _count: { select: { sellers: true } } },
  });

  const startDate = getRecifePeriodStartDate(period);
  const whereTenant = tenantId === 'all' ? {} : { tenantId };

  const [totalVisits, totalClicks] = await Promise.all([
    prisma.pageClickEvent.count({
      where: { ...whereTenant, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
    }),
    prisma.sellerClickEvent.count({
      where: { seller: { ...whereTenant }, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
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
      const conv = visits > 0 ? ((clicks / visits) * 100) : 0;
      return { ...t, visits, clicks, conv };
    }),
  );

  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';

  const periodLabels: Record<string, string> = { '7': '7 dias', '30': '30 dias', '90': '3 meses' };

  const periodActions = (
    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
      {[{ v: '7', l: '7 dias' }, { v: '30', l: '30 dias' }, { v: '90', l: '3 meses' }].map(({ v, l }) => (
        <Link
          key={v}
          href={`/super-admin/relatorios?period=${v}${tenantId !== 'all' ? `&tenantId=${tenantId}` : ''}`}
          style={{
            padding: '5px 12px', borderRadius: 6,
            fontSize: 12, fontWeight: 700, textDecoration: 'none',
            background: period === v ? '#0f1c3f' : 'transparent',
            color: period === v ? '#fff' : 'var(--text-soft)',
            transition: 'all .15s',
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
        pageTitle="Relatórios Consolidados"
        pageSubtitle={`Últimos ${periodLabels[period] || '30 dias'} · ${tenantId === 'all' ? 'todas as empresas' : tenants.find((t) => t.id === tenantId)?.name || ''}`}
        actions={periodActions}
      />

      <main className="main-content kl-page-enter skin-page">

        {/* KPI cards */}
        <div className="kl-dash-row-mid" style={{ gap: 12 }}>
          {[
            { label: 'Visitas totais', value: totalVisits.toLocaleString('pt-BR'), color: '#0f172a' },
            { label: 'Escolhas totais', value: totalClicks.toLocaleString('pt-BR'), color: '#16a34a' },
            { label: 'Conversão média', value: `${conversion}%`, color: '#3b82f6' },
          ].map((item) => (
            <div key={item.label} className="kl-card" style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase' as const, marginBottom: 10 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, color: item.color, letterSpacing: '-0.06em', lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 8 }}>
                Período selecionado: {periodLabels[period] || period + ' dias'}
              </div>
            </div>
          ))}
        </div>

        {/* Filter + table */}
        <div className="kl-card" style={{ overflow: 'hidden' }}>
          {/* Filters */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <form method="GET" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <input type="hidden" name="period" value={period} />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>Empresa</span>
                <select
                  name="tenantId"
                  defaultValue={tenantId}
                  onChange={(e) => {
                    /* auto-submit via button */
                    void e;
                  }}
                  style={{
                    height: 36, padding: '0 10px', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13, background: 'var(--card-bg)', color: 'var(--text-main)',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="all">Todas as empresas</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                style={{
                  marginTop: 18, height: 36, padding: '0 14px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--card-bg)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)',
                }}
              >
                Filtrar
              </button>
            </form>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                  {['Empresa', 'Vendedores', 'Visitas', 'Escolhas', 'Conversão', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
                        textAlign: h === 'Empresa' ? 'left' : 'center',
                        fontWeight: 700, fontSize: 11, color: 'var(--text-soft)',
                        letterSpacing: '.03em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenantStats
                  .filter((t) => tenantId === 'all' || t.id === tenantId)
                  .map((t) => (
                    <tr key={t.id} className="super-table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: '#0f1c3f18', border: '1px solid #0f1c3f22',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color: '#0f1c3f',
                          }}>
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
                        <span style={{
                          fontWeight: 800,
                          color: t.conv > 50 ? '#16a34a' : t.conv > 30 ? '#f59e0b' : t.conv > 0 ? 'var(--text-soft)' : 'var(--text-soft)',
                        }}>
                          {t.visits > 0 ? t.conv.toFixed(1) + '%' : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px',
                          borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: t.active ? '#f0fdf4' : '#f4f4f5',
                          color: t.active ? '#16a34a' : '#71717a',
                        }}>
                          {t.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}
