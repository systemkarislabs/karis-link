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
  bg: string;
};

export default async function TenantAdminPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const period = searchParams?.period || '7';
  const { tenantId } = await requireTenantAuth(slug);

  const startDate = getRecifePeriodStartDate(period);

  const [tenant, allSellers, totalVisits, recentClicks, clickCounts] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    }),
    prisma.seller.findMany({ where: { tenantId } }),
    prisma.pageClickEvent.count({ where: { tenantId, createdAt: { gte: startDate } } }),
    prisma.sellerClickEvent.findMany({
      where: { seller: { tenantId }, createdAt: { gte: startDate } },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { seller: true },
    }),
    prisma.sellerClickEvent.groupBy({
      by: ['sellerId'],
      where: { seller: { tenantId }, createdAt: { gte: startDate } },
      _count: { id: true },
    }),
  ]);

  const sellers = allSellers
    .map((seller) => {
      const countData = clickCounts.find((count) => count.sellerId === seller.id);
      return { ...seller, periodClicks: countData?._count.id || 0 };
    })
    .sort((a, b) => b.periodClicks - a.periodClicks);

  const totalClicksInPeriod = sellers.reduce((acc, seller) => acc + seller.periodClicks, 0);
  const conversion = totalVisits > 0 ? ((totalClicksInPeriod / totalVisits) * 100).toFixed(1) : '0';

  const cards: MetricCard[] = [
    { label: 'Visitas no Link', value: totalVisits, icon: 'eye', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Cliques por Vendedor', value: totalClicksInPeriod, icon: 'mouse', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Conversao Real', value: `${conversion}%`, icon: 'trending', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Vendedores Ativos', value: allSellers.length, icon: 'users', color: '#a855f7', bg: '#faf5ff' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter skin-page">
        <header className="skin-header">
          <div>
            <h1>Painel de Performance</h1>
            <p>
              Analise estrategica dos ultimos <strong>{period} dias</strong> da operacao.
            </p>
          </div>

          <form style={{ display: 'flex', gap: 8 }}>
            <AutoSubmitSelect
              name="period"
              defaultValue={period}
              ariaLabel="Periodo do dashboard"
              options={[
                { value: '1', label: 'Hoje' },
                { value: '7', label: 'Ultimos 7 dias' },
                { value: '30', label: 'Ultimos 30 dias' },
              ]}
            />
            <noscript>
              <button type="submit" className="skin-btn">
                Atualizar
              </button>
            </noscript>
          </form>
        </header>

        <div className="skin-stat-grid">
          {cards.map((card) => (
            <div key={card.label} className="kl-card kl-card-hover skin-stat-card">
              <div className="skin-stat-top">
                <span className="skin-stat-title">{card.label}</span>
                <div className="skin-stat-icon" style={{ background: card.bg, color: card.color }}>
                  <Icon name={card.icon} size={15} color="currentColor" />
                </div>
              </div>
              <p className="skin-stat-value" style={{ color: card.color }}>
                {card.value}
              </p>
              <div className="skin-stat-foot">Nos ultimos {period} dias</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div className="kl-card" style={{ padding: 32 }}>
            <h3 className="skin-card-title">Performance por Vendedor</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sellers.map((seller, index) => (
                <div key={seller.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--sidebar-text)', width: 20 }}>
                        {index + 1}º
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#09090b' }}>{seller.name}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: 14 }}>
                      {seller.periodClicks} cliques
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f4f4f5', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${totalClicksInPeriod > 0 ? (seller.periodClicks / totalClicksInPeriod) * 100 : 0}%`,
                        height: '100%',
                        background: '#10b981',
                        borderRadius: 99,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="kl-card" style={{ padding: 32 }}>
            <h3 className="skin-card-title">Historico Recente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recentClicks.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{log.seller.name}</div>
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
