import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@/components/Icon';

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
          <p style={{ color: 'var(--sidebar-text)' }}>Acompanhe o desempenho dos seus links e vendedores.</p>
        </header>

        {/* Stats Cards com Ícones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
          {[
            { label: 'Visitas Totais', value: totalVisits, icon: 'chart', color: '#6366f1' },
            { label: 'Cliques no Whats', value: totalClicks, icon: 'users', color: '#17DB4E' },
            { label: 'Conversão', value: `${conversion}%`, icon: 'link', color: '#e11d48' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon as any} size={24} color={s.color} />
              </div>
              <div>
                <div style={{ color: 'var(--sidebar-text)', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Ranking de Vendedores com Cliques Detalhados */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Icon name="users" size={20} color="var(--sidebar-active-text)" />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Performance por Vendedor</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sellers.map((s, idx) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx < 3 ? '#fbbf24' : '#94a3b8', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}º
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <div style={{ background: '#17DB4E15', color: '#17DB4E', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="chart" size={14} color="#17DB4E" />
                      {s.clicks} Cliques
                   </div>
                </div>
              </div>
            ))}
            {sellers.length === 0 && <p style={{ color: 'var(--sidebar-text)', textAlign: 'center' }}>Nenhum vendedor cadastrado.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
