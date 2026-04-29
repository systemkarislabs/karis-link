import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@/components/Icon';
import { formatRecifeDateTime, getRecifePeriodStartDate } from '@/lib/recife-time';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ period?: string }>;
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

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
    prisma.pageClickEvent.findMany({
      where: { tenantId, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
      select: { source: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 3000,
    }),
    prisma.sellerClickEvent.findMany({
      where: { seller: { tenantId }, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
      take: 3000,
    }),
    prisma.sellerClickEvent.groupBy({
      by: ['sellerId'],
      where: { seller: { tenantId }, source: { in: ['qr', 'bio'] }, createdAt: { gte: startDate } },
      _count: { id: true },
    }),
  ]);

  const totalVisits = pageVisitsAll.length;
  const qrPageVisits = pageVisitsAll.filter((e) => e.source === 'qr').length;
  const bioPageVisits = pageVisitsAll.filter((e) => e.source === 'bio').length;
  const totalClicksInPeriod = sellerClicksAll.length;
  const conversion = totalVisits > 0 ? ((totalClicksInPeriod / totalVisits) * 100).toFixed(1) : '0.0';
  const qrPct = totalVisits > 0 ? Math.round((qrPageVisits / totalVisits) * 100) : 0;
  const bioPct = totalVisits > 0 ? Math.round((bioPageVisits / totalVisits) * 100) : 0;

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
    return { dayQr, dayBio, dayClicks };
  });

  const maxDayValue = Math.max(...dailyData.map((d) => Math.max(d.dayQr, d.dayBio)), 1);
  const grandTotal = sellers.reduce((acc, s) => acc + s.periodClicks, 0);
  const maxSeller = Math.max(...sellers.map((s) => s.periodClicks), 1);
  const recentClicks = sellerClicksAll.slice(0, 8);

  // SVG chart geometry
  const svgW = 600;
  const svgH = 160;
  const padL = 10;
  const padR = 10;
  const padT = 8;
  const padB = 8;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;
  const n = dailyData.length;

  function ptX(i: number) {
    return n > 1 ? padL + (i / (n - 1)) * innerW : padL + innerW / 2;
  }
  function ptY(val: number) {
    return padT + (1 - val / maxDayValue) * innerH;
  }

  const qrPolyline = dailyData.map((d, i) => `${ptX(i).toFixed(1)},${ptY(d.dayQr).toFixed(1)}`).join(' ');
  const bioPolyline = dailyData.map((d, i) => `${ptX(i).toFixed(1)},${ptY(d.dayBio).toFixed(1)}`).join(' ');

  const firstX = ptX(0).toFixed(1);
  const lastX = ptX(n - 1).toFixed(1);
  const bottomY = (padT + innerH).toFixed(1);
  const qrAreaPath =
    n > 0
      ? `M${firstX},${bottomY} ` +
        dailyData.map((d, i) => `L${ptX(i).toFixed(1)},${ptY(d.dayQr).toFixed(1)}`).join(' ') +
        ` L${lastX},${bottomY} Z`
      : '';
  const bioAreaPath =
    n > 0
      ? `M${firstX},${bottomY} ` +
        dailyData.map((d, i) => `L${ptX(i).toFixed(1)},${ptY(d.dayBio).toFixed(1)}`).join(' ') +
        ` L${lastX},${bottomY} Z`
      : '';

  // Conversion line
  const convSvgH = 80;
  const convPts = dailyData.map((d) => {
    const total = d.dayQr + d.dayBio;
    return total > 0 ? (d.dayClicks / total) * 100 : 0;
  });
  const maxConv = Math.max(...convPts, 1);
  function convY(v: number) {
    return 8 + (1 - v / maxConv) * (convSvgH - 16);
  }
  const convPolyline = convPts.map((v, i) => `${ptX(i).toFixed(1)},${convY(v).toFixed(1)}`).join(' ');

  const periodOptions = [
    { v: '1', l: 'Hoje' },
    { v: '7', l: '7 dias' },
    { v: '30', l: '30 dias' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
            Painel de Performance
          </h1>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
            {periodOptions.map((opt) => (
              <a
                key={opt.v}
                href={`?period=${opt.v}`}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-block',
                  background: period === opt.v ? '#0f1c3f' : 'transparent',
                  color: period === opt.v ? '#fff' : 'var(--text-soft)',
                  transition: 'all .15s',
                }}
              >
                {opt.l}
              </a>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Visitas', value: totalVisits.toLocaleString('pt-BR'), icon: 'eye' as const, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Escolhas', value: totalClicksInPeriod.toLocaleString('pt-BR'), icon: 'mouse' as const, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Conversão', value: `${conversion}%`, icon: 'trending' as const, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Vendedores', value: String(allSellers.length), icon: 'users' as const, color: '#f59e0b', bg: '#fffbeb' },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '18px 20px',
                  boxShadow: 'var(--shadow-soft)',
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
              </div>
            ))}
          </div>

          {/* Chart + Top Sellers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    Visitas por Canal
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-soft)' }}>QR Code vs. Bio Link por dia</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 2, background: '#16a34a', borderRadius: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 600 }}>QR Code</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 20,
                        height: 2,
                        borderRadius: 1,
                        backgroundImage: 'repeating-linear-gradient(90deg,#3b82f6 0,#3b82f6 4px,transparent 4px,transparent 7px)',
                      }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 600 }}>Bio Link</span>
                  </div>
                </div>
              </div>
              {totalVisits === 0 ? (
                <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chart" size={22} color="#16a34a" />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)', textAlign: 'center' }}>
                    Nenhum acesso registrado neste período.
                  </p>
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  width="100%"
                  height={svgH}
                  role="img"
                  aria-label="Visitas por canal por dia"
                  style={{ overflow: 'visible' }}
                >
                  {qrAreaPath && <path d={qrAreaPath} fill="rgba(22,163,74,0.08)" />}
                  {bioAreaPath && <path d={bioAreaPath} fill="rgba(59,130,246,0.08)" />}
                  {n > 1 && (
                    <>
                      <polyline
                        points={qrPolyline}
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points={bioPolyline}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="5 3"
                      />
                    </>
                  )}
                </svg>
              )}
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Top Vendedores
              </h3>
              {sellers.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>Sem dados no período.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sellers.slice(0, 5).map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-soft)', width: 14, flexShrink: 0 }}>{i + 1}</span>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: '#16a34a22',
                          color: '#16a34a',
                          border: '1.5px solid #16a34a44',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {initials(s.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.name}
                        </div>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${(s.periodClicks / maxSeller) * 100}%`,
                              background: '#16a34a',
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)', flexShrink: 0 }}>
                        {s.periodClicks}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <a
                href={`/${slug}/admin/vendedores`}
                style={{
                  display: 'block',
                  marginTop: 16,
                  padding: 8,
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-soft)',
                  fontWeight: 600,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Ver todos →
              </a>
            </div>
          </div>

          {/* Origin + Conversion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Origem das Visitas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>QR Code</span>
                    <span style={{ fontWeight: 800, color: '#16a34a' }}>
                      {qrPageVisits.toLocaleString('pt-BR')} ({qrPct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${qrPct}%`, height: '100%', background: '#16a34a', borderRadius: 99 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Bio Link</span>
                    <span style={{ fontWeight: 800, color: '#3b82f6' }}>
                      {bioPageVisits.toLocaleString('pt-BR')} ({bioPct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${bioPct}%`, height: '100%', background: '#3b82f6', borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Taxa de Conversão
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-soft)' }}>Visitas → Escolha de vendedor</p>
              {convPts.some((v) => v > 0) ? (
                <svg
                  viewBox={`0 0 ${svgW} ${convSvgH}`}
                  width="100%"
                  height={convSvgH}
                  role="img"
                  aria-label="Taxa de conversão por dia"
                >
                  <polyline
                    points={convPolyline}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div style={{ height: convSvgH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>Sem dados suficientes</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{conversion}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Média do período</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.04em' }}>
                    {totalClicksInPeriod.toLocaleString('pt-BR')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Escolhas totais</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking Table + Activity Feed */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Ranking de Vendedores
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['#', 'Vendedor', 'QR', 'Bio', 'Total', '% do total'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 16px',
                            textAlign: h === 'Vendedor' ? 'left' : 'right',
                            fontWeight: 700,
                            fontSize: 11,
                            color: 'var(--text-soft)',
                            letterSpacing: '.03em',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)', fontSize: 13 }}>
                          Nenhum lead no período.
                        </td>
                      </tr>
                    ) : (
                      sellers.map((s, i) => {
                        const pct = grandTotal > 0 ? ((s.periodClicks / grandTotal) * 100).toFixed(1) : '0.0';
                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--text-soft)', fontSize: 12 }}>
                              {i + 1}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: '#16a34a22',
                                    color: '#16a34a',
                                    border: '1.5px solid #16a34a44',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {initials(s.name)}
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>{s.qrClicks}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>{s.bioClicks}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>{s.periodClicks}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 12 }}>{pct}%</span>
                                <div style={{ height: 4, width: 60, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${maxSeller > 0 ? (s.periodClicks / maxSeller) * 100 : 0}%`,
                                      background: '#16a34a',
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Atividade Recente
                </h3>
              </div>
              <div style={{ padding: '8px 0' }}>
                {recentClicks.length === 0 ? (
                  <div style={{ padding: '32px 22px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>Nenhuma atividade no período.</p>
                  </div>
                ) : (
                  recentClicks.map((log, i) => (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 18px',
                        borderBottom: i < recentClicks.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: log.source === 'qr' ? '#f0fdf4' : '#eff6ff',
                          border: `1px solid ${log.source === 'qr' ? '#bbf7d0' : '#bfdbfe'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        <Icon
                          name={log.source === 'qr' ? 'qrcode' : 'link'}
                          size={12}
                          color={log.source === 'qr' ? '#16a34a' : '#3b82f6'}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.seller.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                          {log.source === 'qr' ? 'via QR Code' : 'via Bio Link'}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-soft)', flexShrink: 0, marginTop: 2 }}>
                        {formatRecifeDateTime(log.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
