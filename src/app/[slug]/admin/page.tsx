import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import AutoSubmitSelect from '@/components/AutoSubmitSelect';
import { Icon } from '@/components/Icon';
import { formatRecifeDateTime, getRecifePeriodStartDate } from '@/lib/recife-time';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ period?: string }>;
};

type MetricCard = {
  label: string;
  value: number | string;
  icon: string;
  color: string;
};

export default async function TenantAdminPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const period = searchParams?.period || '7';
  const { tenantId } = await requireTenantAuth(slug);

  const startDate = getRecifePeriodStartDate(period);

  // Buscamos os dados separadamente para evitar erros de tipagem do Prisma
  const [tenant, allSellers, totalVisits, recentClicks, clickCounts] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.seller.findMany({ where: { tenantId } }),
    prisma.pageClickEvent.count({ where: { tenantId, createdAt: { gte: startDate } } }),
    prisma.sellerClickEvent.findMany({ 
      where: { seller: { tenantId }, createdAt: { gte: startDate } },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { seller: true }
    }),
    prisma.sellerClickEvent.groupBy({
      by: ['sellerId'],
      where: { seller: { tenantId }, createdAt: { gte: startDate } },
      _count: { id: true }
    })
  ]);

  // Cruzamos os dados dos vendedores com os cliques contados no período
  const sellers = allSellers.map(s => {
    const countData = clickCounts.find(c => c.sellerId === s.id);
    return {
      ...s,
      periodClicks: countData?._count.id || 0
    };
  }).sort((a, b) => b.periodClicks - a.periodClicks);

  const totalClicksInPeriod = sellers.reduce((acc, s) => acc + s.periodClicks, 0);
  const conversion = totalVisits > 0 ? ((totalClicksInPeriod / totalVisits) * 100).toFixed(1) : '0';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter">
        <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Painel de Performance</h1>
            <p style={{ color: 'var(--text-soft)' }}>Dados filtrados dos últimos <strong>{period} dias</strong>.</p>
          </div>
          
          <form style={{ display: 'flex', gap: 8 }}>
             <AutoSubmitSelect
                name="period"
                defaultValue={period}
                ariaLabel="Período do dashboard"
                options={[
                  { value: '1', label: 'Hoje' },
                  { value: '7', label: 'Últimos 7 dias' },
                  { value: '30', label: 'Últimos 30 dias' },
                ]}
             />
             <noscript>
               <button type="submit" style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', fontWeight: 600 }}>Atualizar</button>
             </noscript>
          </form>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
          {([
            { label: 'Visitas no Link', value: totalVisits, icon: 'chart', color: '#6366f1' },
            { label: 'Cliques por Vendedor', value: totalClicksInPeriod, icon: 'users', color: '#17DB4E' },
            { label: 'Conversão Real', value: `${conversion}%`, icon: 'link', color: '#e11d48' },
          ] satisfies MetricCard[]).map(s => (
            <div key={s.label} className="kl-card kl-card-hover" style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={24} color={s.color} />
              </div>
              <div>
                <div style={{ color: 'var(--sidebar-text)', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          <div className="kl-card" style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32 }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Performance por Vendedor</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sellers.map((s, idx) => (
                <div key={s.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--sidebar-text)', width: 20 }}>{idx + 1}º</span>
                       <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#17DB4E', fontSize: 14 }}>{s.periodClicks} cliques</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-main)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${totalClicksInPeriod > 0 ? (s.periodClicks / totalClicksInPeriod) * 100 : 0}%`, 
                      height: '100%', background: '#17DB4E', borderRadius: 3
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="kl-card" style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32 }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Histórico Recente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recentClicks.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#17DB4E' }}></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{log.seller.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--sidebar-text)' }}>
                      {formatRecifeDateTime(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
