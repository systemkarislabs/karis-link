import prisma from '@/lib/prisma';
import { requireSuperAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import AutoSubmitSelect from '@/components/AutoSubmitSelect';
import { getRecifePeriodStartDate } from '@/lib/recife-time';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ tenantId?: string; period?: string }>;
};

export default async function ReportsPage(props: PageProps) {
  await requireSuperAuth();
  const searchParams = await props.searchParams;
  const tenantId = searchParams?.tenantId || 'all';
  const period   = searchParams?.period   || '30';

  const tenants = await prisma.tenant.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
    },
  });
  const startDate = getRecifePeriodStartDate(period);
  const whereTenant = tenantId === 'all' ? {} : { tenantId };

  const [totalVisits, totalClicks] = await Promise.all([
    prisma.pageClickEvent.count({ where: { ...whereTenant, createdAt: { gte: startDate } } }),
    prisma.sellerClickEvent.count({ where: { seller: { ...whereTenant }, createdAt: { gte: startDate } } })
  ]);

  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar isSuper={true} />
      <main className="main-content">
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Relatórios Consolidados</h1>
          <p style={{ color: 'var(--sidebar-text)', marginTop: 4 }}>Analise a performance global ou individual.</p>
        </header>

        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 20, border: '1px solid var(--border)', marginBottom: 32 }}>
          <form style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Empresa</label>
              <AutoSubmitSelect
                name="tenantId"
                defaultValue={tenantId}
                ariaLabel="Filtrar por empresa"
                style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--bg-main)' }}
                options={[
                  { value: 'all', label: 'Todas' },
                  ...tenants.map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Período</label>
              <AutoSubmitSelect
                name="period"
                defaultValue={period}
                ariaLabel="Filtrar por período"
                style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--bg-main)' }}
                options={[
                  { value: '7', label: 'Últimos 7 dias' },
                  { value: '30', label: 'Últimos 30 dias' },
                  { value: '90', label: 'Últimos 3 meses' },
                ]}
              />
            </div>
            <noscript>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: 12, background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Filtrar</button>
              </div>
            </noscript>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {[
            { label: 'Total Visitas', value: totalVisits, color: 'var(--text-main)' },
            { label: 'Cliques WhatsApp', value: totalClicks, color: '#17DB4E' },
            { label: 'Conversão Média', value: `${conversion}%`, color: 'var(--sidebar-active-text)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--sidebar-text)', fontSize: 13, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
