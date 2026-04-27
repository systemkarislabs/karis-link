import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import SellerImageField from '@/components/SellerImageField';
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton';
import PendingButton from '@/components/PendingButton';
import { createSeller, deleteSeller } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SellerMetric = {
  id: string;
  name: string;
  phone: string;
  image: string | null;
  totalClicks: number;
  qrClicks: number;
  bioClicks: number;
  directClicks: number;
  topCampaign: string | null;
  recentSourceLabel: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

type PageProps = { params: Promise<{ slug: string }> };

export default async function VendedoresPage(props: PageProps) {
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

  // Limita a janela analítica aos últimos 90 dias para não escalar
  // linearmente com o histórico do tenant.
  const ANALYTICS_WINDOW_DAYS = 90;
  const analyticsStart = new Date();
  analyticsStart.setDate(analyticsStart.getDate() - ANALYTICS_WINDOW_DAYS);

  const [sellers, sellerEvents, campaigns] = await Promise.all([
    prisma.seller.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    }),
    prisma.sellerClickEvent.findMany({
      where: {
        seller: { tenantId },
        createdAt: { gte: analyticsStart },
      },
      include: {
        seller: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    }),
    prisma.qrCode.findMany({
      where: { tenantId },
      select: {
        slug: true,
        name: true,
      },
    }),
  ]);

  const campaignNameByCode = campaigns.reduce<Record<string, string>>((acc, campaign) => {
    acc[campaign.slug] = campaign.name;
    return acc;
  }, {});

  const sellerMetrics: SellerMetric[] = sellers.map((seller) => {
    const events = sellerEvents.filter((event) => event.sellerId === seller.id);
    const qrClicks = events.filter((event) => event.source === 'qr').length;
    const bioClicks = events.filter((event) => event.source === 'bio').length;
    const directClicks = events.filter((event) => !event.source || event.source === 'direct').length;

    const campaignCounts = events.reduce<Record<string, number>>((acc, event) => {
      if (!event.campaign || event.campaign === 'none') return acc;
      acc[event.campaign] = (acc[event.campaign] || 0) + 1;
      return acc;
    }, {});

    const topCampaignEntry = Object.entries(campaignCounts).sort((a, b) => b[1] - a[1])[0];
    const topCampaignCode = topCampaignEntry?.[0] || null;
    const lastEvent = events[0];
    const recentSourceLabel =
      lastEvent?.source === 'qr'
        ? 'Último lead via QR'
        : lastEvent?.source === 'bio'
          ? 'Último lead via Bio'
          : events.length > 0
            ? 'Último lead direto'
            : 'Sem leads ainda';

    return {
      id: seller.id,
      name: seller.name,
      phone: seller.phone,
      image: seller.image,
      totalClicks: events.length,
      qrClicks,
      bioClicks,
      directClicks,
      topCampaign: topCampaignCode ? campaignNameByCode[topCampaignCode] || topCampaignCode : null,
      recentSourceLabel,
    };
  });

  const totalClicks = sellerMetrics.reduce((sum, seller) => sum + seller.totalClicks, 0);
  const totalQrClicks = sellerMetrics.reduce((sum, seller) => sum + seller.qrClicks, 0);
  const totalBioClicks = sellerMetrics.reduce((sum, seller) => sum + seller.bioClicks, 0);
  const totalDirectClicks = sellerMetrics.reduce((sum, seller) => sum + seller.directClicks, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Gestão de Vendedores</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>
            Cadastre sua equipe e acompanhe quantos leads cada vendedor recebeu por QR Code, bio e acesso direto.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
          {[
            { label: 'Vendedores ativos', value: sellerMetrics.length },
            { label: 'Leads via QR', value: totalQrClicks },
            { label: 'Leads via bio', value: totalBioClicks },
            { label: 'Leads diretos', value: totalDirectClicks },
            { label: 'Total de escolhas', value: totalClicks },
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
            marginBottom: 40,
          }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Novo Vendedor</h3>
          <form action={createSeller} className="seller-create-form">
            <input type="hidden" name="slug" value={slug} />
            <input
              name="name"
              placeholder="Nome do vendedor"
              required
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
              }}
            />
            <input
              name="phone"
              placeholder="WhatsApp (ex: 55119 9999-9999)"
              required
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
              }}
            />
            <SellerImageField />
            <PendingButton
              pendingLabel="Salvando..."
              className="seller-create-submit"
              style={{
                background: 'var(--sidebar-active-text)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                minHeight: 48,
                width: '100%',
                fontWeight: 600,
              }}
            >
              Salvar vendedor
            </PendingButton>
          </form>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {sellerMetrics.map((seller) => (
            <div
              key={seller.id}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 20,
                padding: 24,
                border: '1px solid var(--border)',
                boxShadow: '0 10px 24px rgba(148, 163, 184, 0.12)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  {seller.image ? (
                    <img
                      src={seller.image}
                      alt={seller.name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#334155',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(seller.name)}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 18 }}>{seller.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>{seller.phone}</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: '#2563eb', fontWeight: 600 }}>{seller.recentSourceLabel}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Link
                    href={`/${slug}/admin/vendedores/${seller.id}`}
                    style={{
                      color: 'var(--sidebar-active-text)',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Editar
                  </Link>

                  <form action={deleteSeller}>
                    <input type="hidden" name="id" value={seller.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <ConfirmSubmitButton
                      message={`Excluir o vendedor "${seller.name}"? Os cliques históricos também serão removidos.`}
                      ariaLabel={`Excluir vendedor ${seller.name}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 700,
                        padding: '6px 8px',
                      }}
                    >
                      Excluir
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(100px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Total', value: seller.totalClicks, accent: '#0f172a' },
                  { label: 'QR Code', value: seller.qrClicks, accent: '#16a34a' },
                  { label: 'Bio', value: seller.bioClicks, accent: '#2563eb' },
                  { label: 'Direto', value: seller.directClicks, accent: '#7c3aed' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: 'var(--bg-main)',
                      borderRadius: 14,
                      padding: '12px 14px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--sidebar-text)', textTransform: 'uppercase', marginBottom: 6 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: item.accent }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderRadius: 14,
                  padding: '14px 16px',
                  background: 'rgba(15, 23, 42, 0.04)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--sidebar-text)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Campanha com mais resultado
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                  {seller.topCampaign || 'Ainda sem campanha dominante'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
