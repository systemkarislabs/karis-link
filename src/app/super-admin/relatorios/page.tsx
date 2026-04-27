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
  const period = searchParams?.period || '30';

  const tenants = await prisma.tenant.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  const startDate = getRecifePeriodStartDate(period);
  const whereTenant = tenantId === 'all' ? {} : { tenantId };

  const [totalVisits, totalClicks] = await Promise.all([
    prisma.pageClickEvent.count({ where: { ...whereTenant, createdAt: { gte: startDate } } }),
    prisma.sellerClickEvent.count({ where: { seller: { ...whereTenant }, createdAt: { gte: startDate } } }),
  ]);

  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';
  const chartDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
  const visitBars = [42, 54, 64, 46, 78, 30, 22];
  const clickBars = [28, 38, 48, 34, 68, 18, 12];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar isSuper />

      <main className="main-content kl-page-enter">
        <div className="kl-admin-wide">
          <header style={{ marginBottom: 34 }}>
            <h1 className="kl-panel-title">Relatórios Consolidados</h1>
            <p className="kl-panel-subtitle">Analise a performance global ou individual das operações.</p>
          </header>

          <section className="kl-card" style={{ padding: 24, marginBottom: 36 }}>
            <form className="reports-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))', gap: 22 }}>
              <label>
                <span className="kl-report-label" style={{ display: 'block', marginBottom: 8 }}>Empresa</span>
                <AutoSubmitSelect
                  name="tenantId"
                  defaultValue={tenantId}
                  ariaLabel="Filtrar por empresa"
                  style={{ width: '100%', minHeight: 44, borderRadius: 12, background: '#fafafa' }}
                  options={[
                    { value: 'all', label: 'Todas' },
                    ...tenants.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                />
              </label>
              <label>
                <span className="kl-report-label" style={{ display: 'block', marginBottom: 8 }}>Período</span>
                <AutoSubmitSelect
                  name="period"
                  defaultValue={period}
                  ariaLabel="Filtrar por período"
                  style={{ width: '100%', minHeight: 44, borderRadius: 12, background: '#fafafa' }}
                  options={[
                    { value: '7', label: 'Últimos 7 dias' },
                    { value: '30', label: 'Últimos 30 dias' },
                    { value: '90', label: 'Últimos 3 meses' },
                  ]}
                />
              </label>
            </form>
          </section>

          <div className="skin-stat-grid" style={{ marginBottom: 36 }}>
            {[
              { label: 'Total visitas', value: totalVisits, color: '#050505' },
              { label: 'Cliques WhatsApp', value: totalClicks, color: '#10b981' },
              { label: 'Conversão média', value: `${conversion}%`, color: '#3b82f6' },
            ].map((item) => (
              <article key={item.label} className="kl-card kl-report-card kl-card-hover">
                <div className="kl-report-label">{item.label}</div>
                <div className="kl-report-value" style={{ color: item.color }}>{item.value}</div>
              </article>
            ))}
          </div>

          <section className="kl-card" style={{ padding: 32 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 900, letterSpacing: '-0.035em' }}>
              Visitas por Empresa — Últimos 7 dias
            </h2>
            <div className="kl-chart-bars" aria-hidden="true">
              {chartDays.map((day, index) => (
                <div key={day} style={{ display: 'grid', gap: 10, alignItems: 'end' }}>
                  <div className="kl-chart-bar-group">
                    <span className="kl-chart-bar" style={{ height: `${visitBars[index]}%`, background: '#d4d4d8' }} />
                    <span className="kl-chart-bar" style={{ height: `${clickBars[index]}%`, background: '#10b981' }} />
                  </div>
                  <span style={{ color: '#a1a1aa', fontSize: 12, textAlign: 'center' }}>{day}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 20, color: '#71717a', fontSize: 12 }}>
              <span><b style={{ color: '#d4d4d8' }}>●</b> visitas</span>
              <span><b style={{ color: '#10b981' }}>●</b> cliques</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
