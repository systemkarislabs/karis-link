import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function TenantAdminPage(props: any) {
  const params = await props.params;
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const [tenant, sellers, totalVisits, totalClicks] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.seller.findMany({ where: { tenantId }, orderBy: { clicks: 'desc' } }),
    prisma.pageClickEvent.count({ where: { tenantId } }),
    prisma.sellerClickEvent.count({ where: { seller: { tenantId } } }),
  ]);

  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Bem-vindo, {tenant?.name}</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>Acompanhe o desempenho dos seus links em tempo real.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
          {[
            { label: 'Visitas na Página', value: totalVisits },
            { label: 'Cliques WhatsApp', value: totalClicks },
            { label: 'Conversão', value: `${conversion}%` },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--sidebar-text)', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Ranking de Vendedores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sellers.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, background: 'var(--bg-main)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                <span style={{ fontWeight: 700, color: 'var(--sidebar-active-text)' }}>{s.clicks} cliques</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
