import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { ensureTenantCitySupport } from '@/lib/db-compat';
import AdminSidebar from '@/components/AdminSidebar';
import SellerImageField from '@/components/SellerImageField';
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton';
import PendingButton from '@/components/PendingButton';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { updateSeller } from '../actions';
import { formatRecifeDateTime } from '@/lib/recife-time';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string; sellerId: string }> };

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default async function EditSellerPage(props: PageProps) {
  await ensureTenantCitySupport();

  const params = await props.params;
  const { slug, sellerId } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const [tenant, seller] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        cityGroupingEnabled: true,
        cities: {
          where: { active: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        },
      },
    }),
    prisma.seller.findFirst({
      where: { id: sellerId, tenantId },
      include: { city: { select: { name: true } } },
    }),
  ]);

  if (!seller) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
        <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />
        <main className="main-content kl-page-enter">
          <div style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 32, border: '1px solid var(--border)', maxWidth: 480 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>Vendedor não encontrado</h1>
            <p style={{ margin: '0 0 20px', color: 'var(--text-soft)', fontSize: 13 }}>
              Este cadastro não existe ou não pertence a esta empresa.
            </p>
            <Link href={`/${slug}/admin/vendedores`} style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-accent)', textDecoration: 'none' }}>
              ← Voltar para vendedores
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Activity: last 50 events for this seller
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentEvents, periodEvents, allTimeEvents] = await Promise.all([
    prisma.sellerClickEvent.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, source: true, campaign: true, createdAt: true },
    }),
    prisma.sellerClickEvent.findMany({
      where: { sellerId: seller.id, createdAt: { gte: thirtyDaysAgo } },
      select: { source: true },
    }),
    prisma.sellerClickEvent.count({ where: { sellerId: seller.id } }),
  ]);

  const period30Total = periodEvents.length;
  const period30Qr = periodEvents.filter((e) => e.source === 'qr').length;
  const period30Bio = periodEvents.filter((e) => e.source === 'bio').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content kl-page-enter">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link
            href={`/${slug}/admin/vendedores`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--card-bg)',
              color: 'var(--text-soft)', textDecoration: 'none', flexShrink: 0,
            }}
          >
            <Icon name="arrowLeft" size={15} />
          </Link>

          {/* Seller avatar */}
          {seller.image ? (
            <img
              src={seller.image}
              alt={seller.name}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'var(--brand-accent-soft)', color: 'var(--brand-accent-strong)',
              border: '2px solid rgba(22,163,74,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700,
            }}>
              {getInitials(seller.name)}
            </div>
          )}

          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
              {seller.name}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-soft)' }}>
              {seller.phone}
              {tenant?.cityGroupingEnabled && seller.city && (
                <span style={{ marginLeft: 8, padding: '1px 6px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                  {seller.city.name}
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* KPI cards */}
          <div className="kl-kpi-grid">
            {[
              { label: 'Total de escolhas', value: String(allTimeEvents), icon: 'mouse' as const, color: '#16a34a', bg: '#f0fdf4', sub: 'desde o início' },
              { label: 'Últimos 30 dias', value: String(period30Total), icon: 'trending' as const, color: '#3b82f6', bg: '#eff6ff', sub: 'escolhas recentes' },
              { label: 'Via QR Code', value: String(period30Qr), icon: 'qrcode' as const, color: '#8b5cf6', bg: '#f5f3ff', sub: '30 dias' },
              { label: 'Via Bio Link', value: String(period30Bio), icon: 'link' as const, color: '#f59e0b', bg: '#fffbeb', sub: '30 dias' },
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
                <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Activity + Edit form */}
          <div className="kl-ranking-feed">

            {/* Activity feed */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Atividade Recente
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>últimas {recentEvents.length} escolhas</span>
              </div>

              {recentEvents.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                  }}>
                    <Icon name="clock" size={20} color="#16a34a" />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>
                    Nenhuma atividade registrada ainda.
                  </p>
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {recentEvents.map((event, i) => (
                    <div
                      key={event.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '11px 20px',
                        borderBottom: i < recentEvents.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: event.source === 'qr' ? '#f0fdf4' : '#eff6ff',
                        border: `1px solid ${event.source === 'qr' ? '#bbf7d0' : '#bfdbfe'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon
                          name={event.source === 'qr' ? 'qrcode' : 'link'}
                          size={13}
                          color={event.source === 'qr' ? '#16a34a' : '#3b82f6'}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
                          {event.source === 'qr' ? 'via QR Code' : 'via Bio Link'}
                        </div>
                        {event.campaign && (
                          <div style={{ fontSize: 11, color: 'var(--text-soft)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            campanha: {event.campaign}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-soft)', flexShrink: 0 }}>
                        {formatRecifeDateTime(event.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit form */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Editar Dados
              </h3>
              <form action={updateSeller} style={{ display: 'grid', gap: 14 }}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={seller.id} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Nome do vendedor *</label>
                  <input
                    name="name"
                    defaultValue={seller.name}
                    required
                    className="kl-soft-field"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>WhatsApp *</label>
                  <input
                    name="phone"
                    defaultValue={seller.phone}
                    required
                    className="kl-soft-field"
                  />
                </div>

                {tenant?.cityGroupingEnabled ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Cidade *</label>
                    <select name="cityId" required defaultValue={seller.cityId ?? ''} className="kl-soft-field">
                      <option value="" disabled>Selecione a cidade</option>
                      {tenant.cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                    {tenant.cities.length === 0 && (
                      <span style={{ fontSize: 11, color: '#be123c', fontWeight: 700 }}>
                        Peça ao super admin para cadastrar uma cidade ativa.
                      </span>
                    )}
                  </div>
                ) : null}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                    Horários de atendimento
                    <span style={{ fontWeight: 400, color: 'var(--text-soft)', marginLeft: 4 }}>(opcional)</span>
                  </label>
                  <textarea
                    name="schedule"
                    defaultValue={seller.schedule ?? ''}
                    placeholder={'Ex: Segunda a Sexta: 8h às 18h\nSábado: 8h às 12h'}
                    rows={3}
                    className="kl-soft-field"
                    style={{ resize: 'vertical', fontSize: 12, lineHeight: 1.5 }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                    Uma linha por turno. Quando preenchido, o cliente verá os horários antes de entrar em contato.
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Foto do vendedor</div>
                  {seller.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={seller.image}
                        alt={seller.name}
                        style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-soft)', cursor: 'pointer' }}>
                        <input type="checkbox" name="removeImage" />
                        Remover foto atual
                      </label>
                    </div>
                  )}
                  <SellerImageField label="Nova foto (opcional)" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <Link
                    href={`/${slug}/admin/vendedores`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minHeight: 40, borderRadius: 8, border: '1px solid var(--border)',
                      background: 'var(--card-bg)', color: 'var(--text-soft)',
                      fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    Cancelar
                  </Link>
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
                    <Icon name="check" size={14} color="#fff" />
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
