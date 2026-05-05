import { requireSuperAuth } from '@/lib/auth';
import { ensureTenantCitySupport } from '@/lib/db-compat';
import prisma from '@/lib/prisma';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@/components/Icon';
import { reorderSellerAsSuper } from '@/app/super-admin/actions';
import { buildTenantPublicUrl } from '@/lib/public-url';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ tenantSlug: string }> };

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default async function SuperAdminVendedoresPage(props: PageProps) {
  await requireSuperAuth();
  await ensureTenantCitySupport();

  const { tenantSlug } = await props.params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      cityGroupingEnabled: true,
    },
  });

  if (!tenant) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
        <AdminSidebar isSuper />
        <main className="main-content kl-page-enter">
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Empresa não encontrada.</p>
        </main>
      </div>
    );
  }

  const sellers = await prisma.seller.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { city: { select: { name: true } } },
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar isSuper />

      <main className="main-content kl-page-enter">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link
            href="/super-admin"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--card-bg)',
              color: 'var(--text-soft)', textDecoration: 'none', flexShrink: 0,
            }}
          >
            <Icon name="arrowLeft" size={15} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
              Vendedores — {tenant.name}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-soft)' }}>
              Arraste a ordem de exibição na página pública.{' '}
              <a
                href={buildTenantPublicUrl(tenant.slug)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--brand-accent)', textDecoration: 'none', fontWeight: 600 }}
              >
                Ver página pública ↗
              </a>
            </p>
          </div>
        </div>

        {/* Seller list */}
        <div className="kl-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
              {sellers.length} {sellers.length === 1 ? 'vendedor' : 'vendedores'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>
              Use ↑↓ para reordenar
            </span>
          </div>

          {sellers.length === 0 ? (
            <div style={{ padding: '52px 24px', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Icon name="users" size={22} color="#16a34a" />
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>
                Nenhum vendedor cadastrado nesta empresa.
              </p>
            </div>
          ) : (
            sellers.map((seller, i) => (
              <div
                key={seller.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < sellers.length - 1 ? '1px solid var(--border)' : 'none',
                  background: 'var(--card-bg)',
                }}
              >
                {/* Position badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: 'var(--bg-main)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: 'var(--text-soft)',
                }}>
                  {i + 1}
                </div>

                {/* Avatar */}
                {seller.image ? (
                  <img
                    src={seller.image}
                    alt={seller.name}
                    loading="lazy"
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--brand-accent-soft)', color: 'var(--brand-accent-strong)',
                    border: '1.5px solid rgba(22,163,74,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {getInitials(seller.name)}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 14, letterSpacing: '-0.02em' }}>
                    {seller.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 1 }}>
                    {seller.phone}
                    {tenant.cityGroupingEnabled && seller.city && (
                      <span style={{
                        marginLeft: 8, padding: '1px 6px', borderRadius: 5,
                        fontSize: 10, fontWeight: 600,
                        background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
                      }}>
                        {seller.city.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reorder buttons */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <form action={reorderSellerAsSuper}>
                    <input type="hidden" name="tenantSlug" value={tenant.slug} />
                    <input type="hidden" name="sellerId" value={seller.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      aria-label={`Mover ${seller.name} para cima`}
                      disabled={i === 0}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: '1px solid var(--border)', background: 'var(--card-bg)',
                        cursor: i === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, opacity: i === 0 ? 0.3 : 1,
                        color: 'var(--text-soft)',
                      }}
                    >
                      <Icon name="chevron-up" size={15} />
                    </button>
                  </form>
                  <form action={reorderSellerAsSuper}>
                    <input type="hidden" name="tenantSlug" value={tenant.slug} />
                    <input type="hidden" name="sellerId" value={seller.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      aria-label={`Mover ${seller.name} para baixo`}
                      disabled={i === sellers.length - 1}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: '1px solid var(--border)', background: 'var(--card-bg)',
                        cursor: i === sellers.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, opacity: i === sellers.length - 1 ? 0.3 : 1,
                        color: 'var(--text-soft)',
                      }}
                    >
                      <Icon name="chevron-down" size={15} />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
