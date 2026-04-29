import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { createQrCode, deleteQrCode } from './actions';
import QrCodesClient from './QrCodesClient';
import { buildCampaignUrl } from '@/lib/public-url';
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
    const canonicalUrl = buildCampaignUrl(slug, channel, qr.slug);
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
      url: canonicalUrl,
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
            Campanhas
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-soft)' }}>
            Gere QR Codes e links de bio com códigos únicos rastreáveis.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stat cards */}
          <div className="kl-kpi-grid">
            {[
              { label: 'Campanhas', value: String(qrMetrics.length), icon: 'qrcode' as const, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Scans QR', value: String(qrScans), icon: 'target' as const, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Acessos Bio', value: String(bioVisits), icon: 'link' as const, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Escolhas', value: String(totalChoices), icon: 'mouse' as const, color: '#f59e0b', bg: '#fffbeb' },
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
                {card.label === 'Escolhas' && (
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>Conv. média {averageConversion}%</div>
                )}
              </div>
            ))}
          </div>

          {/* Create campaign forms */}
          <div className="kl-two-col">
            {[
              {
                title: 'QR Code rastreável',
                description: 'Ideal para mesas, panfletos, vitrine, fachada e eventos.',
                channel: 'qr' as const,
                namePlaceholder: 'Ex: Mesa 01',
                buttonLabel: 'Gerar QR Code',
                color: '#16a34a',
                bg: '#f0fdf4',
                border: '#bbf7d0',
                icon: 'qrcode' as const,
              },
              {
                title: 'Link da bio do Instagram',
                description: 'Cria um link rastreável para medir acessos vindos da bio.',
                channel: 'bio' as const,
                namePlaceholder: 'Ex: Bio Instagram',
                buttonLabel: 'Gerar link da bio',
                color: '#3b82f6',
                bg: '#eff6ff',
                border: '#bfdbfe',
                icon: 'link' as const,
              },
            ].map((campaign) => (
              <div
                key={campaign.channel}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '20px 22px',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: campaign.bg,
                      border: `1px solid ${campaign.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={campaign.icon} size={18} color={campaign.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                      {campaign.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 1 }}>
                      {campaign.description}
                    </div>
                  </div>
                </div>
                <form action={createQrCode} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input type="hidden" name="tenantSlug" value={slug} />
                  <input type="hidden" name="channel" value={campaign.channel} />
                  <input
                    name="name"
                    placeholder={campaign.namePlaceholder}
                    required
                    className="kl-soft-field"
                    style={{ fontSize: 13 }}
                  />
                  <button
                    type="submit"
                    style={{
                      height: 40,
                      background: campaign.color,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon name="plus" size={14} color="#fff" />
                    {campaign.buttonLabel}
                  </button>
                </form>
              </div>
            ))}
          </div>

          {/* Campaign list */}
          <QrCodesClient qrCodes={qrMetrics} slug={slug} deleteAction={deleteQrCode} />
        </div>
      </main>
    </div>
  );
}
