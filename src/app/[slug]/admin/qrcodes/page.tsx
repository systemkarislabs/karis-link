import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { createQrCode, deleteQrCode } from './actions';
import QrCodesClient from './QrCodesClient';

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

export default async function QrCodesPage(props: any) {
  const params = await props.params;
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
    },
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
        createdAtLabel: new Date(event.createdAt).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
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

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Campanhas Rastreáveis</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>
            Gere QR Codes e links de bio com contagem separada para medir acessos e escolhas de vendedor por origem.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
          {[
            { label: 'Campanhas ativas', value: qrMetrics.length },
            { label: 'Scans via QR', value: qrScans },
            { label: 'Acessos via bio', value: bioVisits },
            { label: 'Escolhas de vendedor', value: totalChoices },
            { label: 'Conversão média', value: `${averageConversion}%` },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 18,
                padding: 22,
                border: '1px solid var(--border)',
                boxShadow: '0 10px 24px rgba(148, 163, 184, 0.12)',
              }}
            >
              <div style={{ color: 'var(--sidebar-text)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                {item.label}
              </div>
              <div style={{ color: 'var(--text-main)', fontSize: 30, fontWeight: 800 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <section
          style={{
            background: 'var(--card-bg)',
            borderRadius: 20,
            padding: 32,
            border: '1px solid var(--border)',
            marginBottom: 32,
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Nova campanha</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--sidebar-text)' }}>
            Crie campanhas para materiais físicos e também um link exclusivo para a bio do Instagram.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[
              {
                title: 'QR Code rastreavel',
                description: 'Ideal para mesas, panfletos, vitrine, fachada e eventos.',
                channel: 'qr',
                namePlaceholder: 'Nome da campanha (ex: Mesa 01)',
                slugPlaceholder: 'Identificador (ex: mesa-01)',
                buttonLabel: 'Gerar QR Code',
                accent: '#16a34a',
                background: 'rgba(34, 197, 94, 0.06)',
              },
              {
                title: 'Link da bio do Instagram',
                description: 'Cria um link rastreavel para medir os acessos vindos da bio.',
                channel: 'bio',
                namePlaceholder: 'Nome da campanha (ex: Bio Instagram)',
                slugPlaceholder: 'Identificador (ex: bio-instagram)',
                buttonLabel: 'Gerar link da bio',
                accent: '#2563eb',
                background: 'rgba(59, 130, 246, 0.06)',
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
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    {campaign.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--sidebar-text)', lineHeight: 1.5 }}>
                    {campaign.description}
                  </div>
                </div>

                <input
                  name="name"
                  placeholder={campaign.namePlaceholder}
                  required
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: '#fff',
                    color: 'var(--text-main)',
                  }}
                />
                <input
                  name="slug"
                  placeholder={campaign.slugPlaceholder}
                  required
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: '#fff',
                    color: 'var(--text-main)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: campaign.accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '12px 18px',
                  }}
                >
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
