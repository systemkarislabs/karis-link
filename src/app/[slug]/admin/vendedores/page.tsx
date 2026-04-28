import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import SellerImageField from '@/components/SellerImageField';
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton';
import PendingButton from '@/components/PendingButton';
import { createSeller, deleteSeller } from './actions';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';

type SellerMetric = {
  id: string;
  name: string;
  phone: string;
  image: string | null;
  totalClicks: number;
  qrClicks: number;
  bioClicks: number;
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
    select: { id: true, name: true },
  });

  const analyticsStart = new Date();
  analyticsStart.setDate(analyticsStart.getDate() - 90);

  const [sellers, sellerEvents] = await Promise.all([
    prisma.seller.findMany({ where: { tenantId }, orderBy: { name: 'asc' } }),
    prisma.sellerClickEvent.findMany({
      where: { seller: { tenantId }, source: { in: ['qr', 'bio'] }, createdAt: { gte: analyticsStart } },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    }),
  ]);

  const sellerMetrics: SellerMetric[] = sellers.map((seller) => {
    const events = sellerEvents.filter((event) => event.sellerId === seller.id);
    return {
      id: seller.id,
      name: seller.name,
      phone: seller.phone,
      image: seller.image,
      totalClicks: events.length,
      qrClicks: events.filter((event) => event.source === 'qr').length,
      bioClicks: events.filter((event) => event.source === 'bio').length,
    };
  });

  const totalClicks = sellerMetrics.reduce((sum, seller) => sum + seller.totalClicks, 0);
  const totalQrClicks = sellerMetrics.reduce((sum, seller) => sum + seller.qrClicks, 0);
  const totalBioClicks = sellerMetrics.reduce((sum, seller) => sum + seller.bioClicks, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter">
        <div className="kl-admin-wide">
          <header style={{ marginBottom: 32 }}>
            <h1 className="kl-panel-title">Vendedores</h1>
            <p className="kl-panel-subtitle">
              Cadastre sua equipe e acompanhe quantos leads cada vendedor recebeu por QR Code e bio.
            </p>
          </header>

          <div className="skin-stat-grid" style={{ marginBottom: 28 }}>
            {[
              { label: 'Vendedores ativos', value: sellerMetrics.length, color: '#a855f7', bg: '#faf5ff', icon: 'users' },
              { label: 'Leads via QR', value: totalQrClicks, color: '#10b981', bg: '#ecfdf5', icon: 'target' },
              { label: 'Leads via Bio', value: totalBioClicks, color: '#3b82f6', bg: '#eff6ff', icon: 'megaphone' },
              { label: 'Total de escolhas', value: totalClicks, color: '#050505', bg: '#f4f4f5', icon: 'mouse' },
            ].map((item) => (
              <article key={item.label} className="kl-card kl-card-hover skin-stat-card">
                <div className="skin-stat-top">
                  <span className="skin-stat-title">{item.label}</span>
                  <span className="skin-stat-icon" style={{ color: item.color, background: item.bg }}>
                    <Icon name={item.icon} size={15} color="currentColor" />
                  </span>
                </div>
                <p className="skin-stat-value" style={{ color: item.color }}>{item.value}</p>
                <div className="skin-stat-foot">Últimos 90 dias</div>
              </article>
            ))}
          </div>

          <div className="seller-admin-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) 340px', gap: 20, alignItems: 'start' }}>
            <section className="kl-card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 18, marginBottom: 20, borderBottom: '1px solid #f1f1f2' }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '-0.035em' }}>Vendedores Cadastrados</h2>
                <span style={{ color: '#71717a', fontSize: 12 }}>Tempo real</span>
              </div>

              <div className="kl-stagger" style={{ display: 'grid', gap: 12 }}>
                {sellerMetrics.map((seller) => (
                  <article
                    key={seller.id}
                    className="kl-card-hover"
                    style={{
                      background: '#fafafa',
                      border: '1px solid #f1f1f2',
                      borderRadius: 16,
                      padding: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                      {seller.image ? (
                        <img
                          src={seller.image}
                          alt={seller.name}
                          loading="lazy"
                          decoding="async"
                          style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: '#dff8ee',
                            border: '1px solid #b7efd8',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 14,
                            fontWeight: 900,
                            color: '#10b981',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(seller.name)}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, color: '#09090b', fontSize: 15 }}>{seller.name}</div>
                        <div style={{ fontSize: 13, color: '#71717a' }}>{seller.phone}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                          <span className="skin-badge">{seller.qrClicks} leads QR</span>
                          <span className="skin-badge" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                            {seller.bioClicks} leads Bio
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <Link
                        href={`/${slug}/admin/vendedores/${seller.id}`}
                        aria-label={`Editar vendedor ${seller.name}`}
                        className="kl-press"
                        style={{
                          width: 36,
                          height: 36,
                          display: 'grid',
                          placeItems: 'center',
                          color: '#71717a',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          background: '#ffffff',
                        }}
                      >
                        <Icon name="edit" size={16} />
                      </Link>

                      <form action={deleteSeller}>
                        <input type="hidden" name="id" value={seller.id} />
                        <input type="hidden" name="slug" value={slug} />
                        <ConfirmSubmitButton
                          message={`Excluir o vendedor "${seller.name}"? Os cliques históricos também serão removidos.`}
                          ariaLabel={`Excluir vendedor ${seller.name}`}
                          style={{
                            width: 36,
                            height: 36,
                            display: 'grid',
                            placeItems: 'center',
                            background: '#ffffff',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            color: '#71717a',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <Icon name="trash" size={16} />
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="kl-card" style={{ padding: 32 }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 900, letterSpacing: '-0.035em' }}>Novo Vendedor</h2>
              <form action={createSeller} style={{ display: 'grid', gap: 16 }}>
                <input type="hidden" name="slug" value={slug} />
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>Nome do vendedor *</span>
                  <input name="name" placeholder="Ex: Carlos Silva" required className="kl-soft-field" />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>WhatsApp *</span>
                  <input name="phone" placeholder="55 (11) 99999-9999" required className="kl-soft-field" />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>Foto (Opcional)</span>
                  <SellerImageField />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button type="reset" className="kl-ghost-button kl-press" style={{ minHeight: 54 }}>Cancelar</button>
                  <PendingButton pendingLabel="Salvando..." className="kl-green-button kl-press" style={{ minHeight: 54, border: 'none' }}>
                    <Icon name="plus" size={16} />
                    Salvar
                  </PendingButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
