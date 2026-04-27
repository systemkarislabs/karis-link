import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { createQrCode, deleteQrCode } from './actions';
import QrCodesClient from './QrCodesClient';
import { formatRecifeDateTime } from '@/lib/recife-time';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';

type QrCodeMetric = {
  id: string;
  name: string;
  slug: string;
  url: string;
  channel: 'qr' | 'bio';
  visits: number;
  clicks: number;
  conversion: string;
  topSellerName: string | null;
  recentChoices: Array<{
    id: string;
    sellerName: string;
    createdAtLabel: string;
  }>;
};

type PageProps = { params: Promise<{ slug: string }> };

export default async function QrCodesPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true },
  });

  const [qrcodes, pageVisits, sellerChoices] = await Promise.all([
    prisma.qrCode.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pageClickEvent.findMany({
      where: { tenantId, source: { in: ['qr', 'bio'] } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sellerClickEvent.findMany({
      where: { source: { in: ['qr', 'bio'] }, seller: { tenantId } },
      orderBy: { createdAt: 'desc' },
      include: { seller: true },
    }),
  ]);

  const qrMetrics: QrCodeMetric[] = qrcodes.map((qr) => {
    const channel = qr.url.includes('/bio/') ? 'bio' : 'qr';
    const visits = pageVisits.filter((event) => event.campaign === qr.slug && event.source === channel);
    const choices = sellerChoices.filter((event) => event.campaign === qr.slug && event.source === channel);

    const sellerCount = choices.reduce<Record<string, { name: string; total: number }>>((acc, event) => {
      if (!acc[event.sellerId]) {
        acc[event.sellerId] = { name: event.seller.name, total: 0 };
      }
      acc[event.sellerId].total += 1;
      return acc;
    }, {});

    const topSeller = Object.values(sellerCount).sort((a, b) => b.total - a.total)[0] || null;
    const conversion = visits.length > 0 ? ((choices.length / visits.length) * 100).toFixed(1) : '0';

    return {
      id: qr.id,
      name: qr.name,
      slug: qr.slug,
      url: qr.url,
      channel,
      visits: visits.length,
      clicks: choices.length,
      conversion,
      topSellerName: topSeller?.name || null,
      recentChoices: choices.slice(0, 5).map((event) => ({
        id: event.id,
        sellerName: event.seller.name,
        createdAtLabel: formatRecifeDateTime(event.createdAt),
      })),
    };
  });

  const totalAccesses = qrMetrics.reduce((sum, qr) => sum + qr.visits, 0);
  const totalChoices = qrMetrics.reduce((sum, qr) => sum + qr.clicks, 0);
  const averageConversion = totalAccesses > 0 ? ((totalChoices / totalAccesses) * 100).toFixed(1) : '0';
  const qrCampaigns = qrMetrics.filter((item) => item.channel === 'qr');
  const bioCampaigns = qrMetrics.filter((item) => item.channel === 'bio');
  const qrScans = qrCampaigns.reduce((sum, item) => sum + item.visits, 0);
  const bioVisits = bioCampaigns.reduce((sum, item) => sum + item.visits, 0);

  const stats = [
    { label: 'Campanhas ativas', value: qrMetrics.length, icon: 'qrcode', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Scans via QR', value: qrScans, icon: 'target', color: '#ef4444', bg: '#fef2f2' },
    { label: 'Acessos via bio', value: bioVisits, icon: 'link', color: '#06b6d4', bg: '#ecfeff' },
    { label: 'Escolhas de vendedor', value: totalChoices, icon: 'users', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Conversao media por link', value: `${averageConversion}%`, icon: 'trending', color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter skin-page">
        <header className="skin-header">
          <div>
            <h1>Campanhas</h1>
            <p>Gere QR Codes e links de bio com codigos unicos criados no servidor.</p>
          </div>
        </header>

        <div className="skin-stat-grid">
          {stats.map((item) => (
            <div key={item.label} className="kl-card kl-card-hover skin-stat-card">
              <div className="skin-stat-top">
                <span className="skin-stat-title">{item.label}</span>
                <div className="skin-stat-icon" style={{ background: item.bg, color: item.color }}>
                  <Icon name={item.icon} size={15} color="currentColor" />
                </div>
              </div>
              <p className="skin-stat-value" style={{ color: item.color }}>{item.value}</p>
              <div className="skin-stat-foot">Metrica por link rastreavel</div>
            </div>
          ))}
        </div>

        <section className="kl-card" style={{ padding: 32 }}>
          <h2 className="skin-card-title">Nova campanha</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[
              {
                title: 'QR Code rastreavel',
                description: 'Ideal para mesas, panfletos, vitrine, fachada e eventos.',
                channel: 'qr',
                namePlaceholder: 'Nome da campanha (ex: Mesa 01)',
                buttonLabel: 'Gerar QR Code',
                accent: '#10b981',
                background: '#ecfdf5',
              },
              {
                title: 'Link da bio do Instagram',
                description: 'Cria um link rastreavel para medir acessos vindos da bio.',
                channel: 'bio',
                namePlaceholder: 'Nome da campanha (ex: Bio Instagram)',
                buttonLabel: 'Gerar link da bio',
                accent: '#3b82f6',
                background: '#eff6ff',
              },
            ].map((campaign) => (
              <form
                key={campaign.channel}
                action={createQrCode}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  padding: 20,
                  borderRadius: 18,
                  border: '1px solid var(--border)',
                  background: campaign.background,
                }}
              >
                <input type="hidden" name="tenantSlug" value={slug} />
                <input type="hidden" name="channel" value={campaign.channel} />

                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
                    {campaign.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#52525b', lineHeight: 1.5 }}>
                    {campaign.description}
                  </div>
                </div>

                <input name="name" placeholder={campaign.namePlaceholder} required className="skin-input" />
                <button type="submit" className="skin-btn" style={{ background: campaign.accent }}>
                  {campaign.buttonLabel}
                </button>
              </form>
            ))}
          </div>
        </section>

        <QrCodesClient qrCodes={qrMetrics} slug={slug} deleteAction={deleteQrCode} />
      </main>
    </div>
  );
}
