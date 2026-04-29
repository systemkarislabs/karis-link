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
  const maxClicks = Math.max(...sellerMetrics.map((s) => s.totalClicks), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
              Vendedores
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-soft)' }}>
              Cadastre sua equipe e acompanhe os leads de cada vendedor.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stat cards */}
          <div className="kl-kpi-grid">
            {[
              { label: 'Ativos', value: String(sellerMetrics.length), icon: 'users' as const, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Leads QR', value: String(totalQrClicks), icon: 'qrcode' as const, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Leads Bio', value: String(totalBioClicks), icon: 'link' as const, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Total leads', value: String(totalClicks), icon: 'trending' as const, color: '#f59e0b', bg: '#fffbeb' },
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
                <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>Últimos 90 dias</div>
              </div>
            ))}
          </div>

          {/* Sellers list + Add form */}
          <div className="kl-main-form-grid">
            {/* Sellers list */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Vendedores Cadastrados
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>Últimos 90 dias</span>
              </div>

              {sellerMetrics.length === 0 ? (
                <div style={{ padding: '48px 22px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon name="users" size={26} color="#16a34a" />
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)' }}>Nenhum vendedor cadastrado ainda.</p>
                </div>
              ) : (
                sellerMetrics.map((seller, i) => (
                  <div
                    key={seller.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 20px',
                      borderBottom: i < sellerMetrics.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {seller.image ? (
                      <img
                        src={seller.image}
                        alt={seller.name}
                        loading="lazy"
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: 'var(--brand-accent-soft)',
                          color: 'var(--brand-accent-strong)',
                          border: '1.5px solid rgba(22,163,74,0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(seller.name)}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 14, letterSpacing: '-0.02em' }}>
                        {seller.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 1 }}>{seller.phone}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          {seller.qrClicks} QR
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                          {seller.bioClicks} Bio
                        </span>
                      </div>
                    </div>

                    {/* Mini bar */}
                    <div style={{ width: 70, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', textAlign: 'right', marginBottom: 4 }}>
                        {seller.totalClicks}
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(seller.totalClicks / maxClicks) * 100}%`,
                            background: 'var(--brand-accent)',
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <Link
                        href={`/${slug}/admin/vendedores/${seller.id}`}
                        aria-label={`Editar vendedor ${seller.name}`}
                        style={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-soft)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          background: 'var(--card-bg)',
                          textDecoration: 'none',
                        }}
                      >
                        <Icon name="edit" size={14} />
                      </Link>
                      <form action={deleteSeller}>
                        <input type="hidden" name="id" value={seller.id} />
                        <input type="hidden" name="slug" value={slug} />
                        <ConfirmSubmitButton
                          message={`Excluir o vendedor "${seller.name}"? Os cliques históricos também serão removidos.`}
                          ariaLabel={`Excluir vendedor ${seller.name}`}
                          style={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            borderRadius: 8,
                            color: '#be123c',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <Icon name="trash" size={14} />
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add seller form */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Novo Vendedor
              </h3>
              <form action={createSeller} style={{ display: 'grid', gap: 14 }}>
                <input type="hidden" name="slug" value={slug} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Nome do vendedor *</label>
                  <input name="name" placeholder="Ex: Carlos Silva" required className="kl-soft-field" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>WhatsApp *</label>
                  <input name="phone" placeholder="55 (11) 99999-9999" required className="kl-soft-field" />
                </div>
                <SellerImageField />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <button type="reset" className="kl-ghost-button kl-press" style={{ minHeight: 40 }}>
                    Cancelar
                  </button>
                  <PendingButton
                    pendingLabel="Salvando..."
                    style={{
                      minHeight: 40,
                      background: '#16a34a',
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
                    Salvar
                  </PendingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
