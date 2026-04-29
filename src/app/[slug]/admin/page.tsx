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

  const [tenant, allSellers, pageVisitsAll, sellerClicksAll, clickCounts] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    }),
    prisma.seller.findMany({ where: { tenantId } }),
    // Todas as visitas de página (QR e Bio) no período — para gráficos diários e totais por origem
    prisma.pageClickEvent.findMany({
      where: { tenantId, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
      select: { source: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 3000,
    }),
    // Todas as escolhas de vendedor (QR e Bio) no período — para ranking, origem e histórico
    prisma.sellerClickEvent.findMany({
      where: { seller: { tenantId }, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
      take: 3000,
    }),
    // Contagem agrupada por vendedor — para o ranking
    prisma.sellerClickEvent.groupBy({
      by: ['sellerId'],
      where: { seller: { tenantId }, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
      _count: { id: true },
    }),
  ]);

  // ── Totais por origem ──────────────────────────────────────────────────────
  const totalVisits = pageVisitsAll.length;
  const qrPageVisits = pageVisitsAll.filter((e) => e.source === 'qr').length;
  const bioPageVisits = pageVisitsAll.filter((e) => e.source === 'bio').length;

  const totalClicksInPeriod = sellerClicksAll.length;
  const qrSellerClicks = sellerClicksAll.filter((e) => e.source === 'qr').length;
  const bioSellerClicks = sellerClicksAll.filter((e) => e.source === 'bio').length;

  const conversion = totalVisits > 0 ? ((totalClicksInPeriod / totalVisits) * 100).toFixed(1) : '0';

  // ── Ranking por vendedor com breakdown de origem ───────────────────────────
  const sellers = allSellers
    .map((seller) => {
      const countData = clickCounts.find((c) => c.sellerId === seller.id);
      const events = sellerClicksAll.filter((e) => e.sellerId === seller.id);
      return {
        ...seller,
        periodClicks: countData?._count.id ?? 0,
        qrClicks: events.filter((e) => e.source === 'qr').length,
        bioClicks: events.filter((e) => e.source === 'bio').length,
      };
    })
    .sort((a, b) => b.periodClicks - a.periodClicks);

  // ── Dados diários para gráficos ────────────────────────────────────────────
  const numDays = Math.min(parseInt(period) || 7, 30);
  const now = new Date();

  const dailyData = Array.from({ length: numDays }, (_, i) => {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - (numDays - 1 - i));
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayQr = pageVisitsAll.filter((e) => e.createdAt >= dayStart && e.createdAt < dayEnd && e.source === 'qr').length;
    const dayBio = pageVisitsAll.filter((e) => e.createdAt >= dayStart && e.createdAt < dayEnd && e.source === 'bio').length;
    const dayClicks = sellerClicksAll.filter((e) => e.createdAt >= dayStart && e.createdAt < dayEnd).length;

    const label =
      numDays <= 7
        ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][dayStart.getDay()]
        : `${String(dayStart.getDate()).padStart(2, '0')}/${String(dayStart.getMonth() + 1).padStart(2, '0')}`;

    return { label, qr: dayQr, bio: dayBio, clicks: dayClicks };
  });

  const maxDayValue = Math.max(...dailyData.map((d) => d.qr + d.bio), 1);

  // Pontos da linha de conversão (% por dia)
  const conversionPts = dailyData.map((d) => {
    const total = d.qr + d.bio;
    return total > 0 ? (d.clicks / total) * 100 : 0;
  });
  const maxConv = Math.max(...conversionPts, 1);
  const svgW = 240;
  const svgH = 160;
  const svgPad = 20;
  const xStep = conversionPts.length > 1 ? (svgW - svgPad * 2) / (conversionPts.length - 1) : 0;
  const svgCoords = conversionPts.map((v, i) => ({
    x: svgPad + i * xStep,
    y: svgPad + (1 - v / maxConv) * (svgH - svgPad * 2),
  }));
  const svgPoints = svgCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  const recentClicks = sellerClicksAll.slice(0, 8);

  const cards: MetricCard[] = [
    { label: 'Visitas no Link', value: totalVisits, icon: 'eye', color: 'var(--brand-accent)', bg: 'var(--brand-accent-soft)' },
    { label: 'Cliques por Vendedor', value: totalClicksInPeriod, icon: 'mouse', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Conversao Real', value: `${conversion}%`, icon: 'trending', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Vendedores Ativos', value: allSellers.length, icon: 'users', color: '#a855f7', bg: '#faf5ff' },
    { label: 'Leads via QR Code', value: qrSellerClicks, icon: 'target', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Leads via Bio Instagram', value: bioSellerClicks, icon: 'megaphone', color: '#2563eb', bg: '#eff6ff' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter skin-page">
        <header className="skin-header">
          <div>
            <h1 className="kl-panel-title">Painel de Performance</h1>
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

        {/* Cards de métricas */}
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

        {/* Origem das visitas e das escolhas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <section className="kl-card" style={{ padding: 28 }}>
            <h3 className="skin-card-title" style={{ marginBottom: 20 }}>Origem das Visitas</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>📷 QR Code</span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>{qrPageVisits}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${totalVisits > 0 ? (qrPageVisits / totalVisits) * 100 : 0}%`,
                      height: '100%',
                      background: '#16a34a',
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>🔗 Link da Bio</span>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{bioPageVisits}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${totalVisits > 0 ? (bioPageVisits / totalVisits) * 100 : 0}%`,
                      height: '100%',
                      background: '#2563eb',
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--sidebar-text)',
                }}
              >
                <span>Total de visitas</span>
                <strong style={{ color: 'var(--text-main)' }}>{totalVisits}</strong>
              </div>
            </div>
          </section>

          <section className="kl-card" style={{ padding: 28 }}>
            <h3 className="skin-card-title" style={{ marginBottom: 20 }}>Origem das Escolhas de Vendedor</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>📷 QR Code</span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>{qrSellerClicks}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${totalClicksInPeriod > 0 ? (qrSellerClicks / totalClicksInPeriod) * 100 : 0}%`,
                      height: '100%',
                      background: '#16a34a',
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>🔗 Link da Bio</span>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{bioSellerClicks}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${totalClicksInPeriod > 0 ? (bioSellerClicks / totalClicksInPeriod) * 100 : 0}%`,
                      height: '100%',
                      background: '#2563eb',
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--sidebar-text)',
                }}
              >
                <span>Total de escolhas</span>
                <strong style={{ color: 'var(--text-main)' }}>{totalClicksInPeriod}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <section className="kl-card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <h3 className="skin-card-title" style={{ margin: 0 }}>QR Code vs Bio por Dia</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>■ QR</span>
                <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>■ Bio</span>
              </div>
            </div>
            <div
              className="kl-chart-bars"
              style={{
                height: 200,
                gap: numDays > 14 ? 3 : 8,
                padding: 0,
                overflowX: numDays > 14 ? 'auto' : 'visible',
              }}
            >
              {dailyData.map((day, i) => (
                <div
                  key={i}
                  style={{ display: 'grid', gap: 6, alignItems: 'end', minWidth: numDays > 14 ? 22 : undefined }}
                >
                  <div className="kl-chart-bar-group">
                    <span
                      className="kl-chart-bar"
                      title={`QR: ${day.qr}`}
                      style={{
                        height: `${(day.qr / maxDayValue) * 100}%`,
                        background: '#16a34a',
                        minHeight: day.qr > 0 ? 4 : 0,
                      }}
                    />
                    <span
                      className="kl-chart-bar"
                      title={`Bio: ${day.bio}`}
                      style={{
                        height: `${(day.bio / maxDayValue) * 100}%`,
                        background: '#2563eb',
                        minHeight: day.bio > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: '#a1a1aa',
                      fontSize: numDays > 14 ? 9 : 11,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="kl-card" style={{ padding: 32 }}>
            <h3 className="skin-card-title">Taxa de Conversão por Dia</h3>
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                width="100%"
                height={svgH}
                role="img"
                aria-label="Taxa de conversao por dia"
              >
                <line x1={svgPad} y1={svgH - svgPad} x2={svgW - svgPad} y2={svgH - svgPad} stroke="#e4e4e7" strokeWidth="1" />
                <line x1={svgPad} y1={svgPad + (svgH - svgPad * 2) / 2} x2={svgW - svgPad} y2={svgPad + (svgH - svgPad * 2) / 2} stroke="#e4e4e7" strokeDasharray="4 4" strokeWidth="1" />
                {conversionPts.some((v) => v > 0) ? (
                  <>
                    <polyline
                      points={svgPoints}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {svgCoords.map((c, i) => (
                      <circle key={i} cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r="4" fill="#f59e0b" />
                    ))}
                  </>
                ) : (
                  <text x={svgW / 2} y={svgH / 2} textAnchor="middle" fill="#a1a1aa" fontSize="12">
                    Sem dados no período
                  </text>
                )}
              </svg>
            </div>
          </section>

          <section className="kl-card" style={{ padding: 32 }}>
            <h3 className="skin-card-title">Cliques por Vendedor</h3>
            <div style={{ display: 'grid', justifyItems: 'center', gap: 20 }}>
              <div className="kl-donut" />
              <div style={{ width: '100%', display: 'grid', gap: 10 }}>
                {sellers.slice(0, 3).map((seller, index) => (
                  <div key={seller.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                    <span style={{ color: '#52525b' }}>
                      <b style={{ color: [undefined, '#3b82f6', '#f59e0b'][index] ?? 'var(--brand-accent)' }}>●</b> {seller.name}
                    </span>
                    <strong>{seller.periodClicks}</strong>
                  </div>
                ))}
                {sellers.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--sidebar-text)', fontSize: 13 }}>
                    Sem dados no período
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Ranking e histórico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div className="kl-card" style={{ padding: 32 }}>
            <h3 className="skin-card-title">Performance por Vendedor</h3>
            {sellers.length === 0 ? (
              <p style={{ color: 'var(--sidebar-text)', fontSize: 13 }}>Nenhum lead registrado no período.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {sellers.map((seller, index) => (
                  <div key={seller.id}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--sidebar-text)', width: 20 }}>
                          {index + 1}º
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{seller.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#16a34a',
                            fontWeight: 700,
                            background: '#f0fdf4',
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          QR {seller.qrClicks}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#2563eb',
                            fontWeight: 700,
                            background: '#eff6ff',
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          Bio {seller.bioClicks}
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--brand-accent)', fontSize: 15 }}>
                          {seller.periodClicks}
                        </span>
                      </div>
                    </div>
                    {/* Barra segmentada QR (verde) + Bio (azul) */}
                    <div
                      style={{
                        width: '100%',
                        height: 7,
                        background: 'var(--border)',
                        borderRadius: 99,
                        overflow: 'hidden',
                        display: 'flex',
                      }}
                    >
                      <div
                        style={{
                          width: `${totalClicksInPeriod > 0 ? (seller.qrClicks / totalClicksInPeriod) * 100 : 0}%`,
                          height: '100%',
                          background: '#16a34a',
                        }}
                      />
                      <div
                        style={{
                          width: `${totalClicksInPeriod > 0 ? (seller.bioClicks / totalClicksInPeriod) * 100 : 0}%`,
                          height: '100%',
                          background: '#2563eb',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="kl-card" style={{ padding: 32 }}>
            <h3 className="skin-card-title">Histórico Recente</h3>
            {recentClicks.length === 0 ? (
              <p style={{ color: 'var(--sidebar-text)', fontSize: 13 }}>Nenhum lead registrado no período.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {recentClicks.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      paddingBottom: 14,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: log.source === 'qr' ? '#16a34a' : '#2563eb',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                        {log.seller.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--sidebar-text)', marginTop: 2 }}>
                        {log.source === 'qr' ? '📷 QR Code' : '🔗 Link da Bio'} ·{' '}
                        {formatRecifeDateTime(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
