import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { handleTenantLogout } from './auth-actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TenantAdminPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const [tenant, sellers, totalVisits, totalClicks] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.seller.findMany({ where: { tenantId }, orderBy: { clicks: 'desc' } }),
    prisma.pageClickEvent.count({ where: { tenantId } }),
    prisma.sellerClickEvent.count({ where: { seller: { tenantId } } }),
  ]);

  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';
  const nav = [
    { label: 'Dashboard', href: `/${slug}/admin` },
    { label: 'Vendedores', href: `/${slug}/admin/vendedores` },
    { label: 'QR Codes', href: `/${slug}/admin/qrcodes` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#17DB4E', marginBottom: 8 }}>Karis Link</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 24 }}>/{slug}</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {nav.map(n => (
            <Link key={n.href} href={n.href} style={{ padding: '10px 12px', borderRadius: 8, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{n.label}</Link>
          ))}
        </nav>
        <form action={handleTenantLogout.bind(null, slug)}>
          <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>Sair</button>
        </form>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{tenant?.name}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total de Visitas', value: totalVisits },
            { label: 'Cliques em Vendedores', value: totalClicks },
            { label: 'Taxa de Conversão', value: `${conversion}%` },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#17DB4E' }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Vendedores</h2>
          {sellers.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: '#17DB4E', fontWeight: 700 }}>{s.clicks} cliques</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: 16, background: '#fff', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Link público da sua empresa</div>
          <code style={{ color: '#17DB4E', fontWeight: 700 }}>{process.env.NEXT_PUBLIC_BASE_URL}/{slug}</code>
        </div>
      </main>
    </div>
  );
}
