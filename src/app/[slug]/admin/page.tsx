import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function TenantAdminPage(props: any) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const period = searchParams?.period || '7'; // Dias
  const { tenantId } = await requireTenantAuth(slug);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const [tenant, sellers, totalVisits, totalClicks, recentClicks] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.seller.findMany({ where: { tenantId }, orderBy: { clicks: 'desc' } }),
    prisma.pageClickEvent.count({ where: { tenantId, createdAt: { gte: startDate } } }),
    prisma.sellerClickEvent.count({ where: { seller: { tenantId }, createdAt: { gte: startDate } } }),
    prisma.sellerClickEvent.findMany({ 
      where: { seller: { tenantId }, createdAt: { gte: startDate } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { seller: true }
    })
  ]);

  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Bem-vindo, {tenant?.name}</h1>
            <p style={{ color: 'var(--sidebar-text)' }}>Análise detalhada por período e vendedor.</p>
          </div>
          
          {/* Filtro de Período */}
          <form style={{ display: 'flex', gap: 8 }}>
             <select name="period" defaultValue={period} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                <option value="1">Hoje</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Este Mês</option>
             </select>
             <button type="submit" style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Filtrar</button>
          </form>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
          {[
            { label: 'Visitas (Período)', value: totalVisits, icon: 'chart', color: '#6366f1' },
            { label: 'Cliques (Período)', value: totalClicks, icon: 'users', color: '#17DB4E' },
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
          
          {/* Ranking de Vendedores com FOTOS */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="users" size={20} color="var(--sidebar-active-text)" /> Vendedores
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sellers.map((s, idx) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {s.image ? (
                      <img src={s.image} alt={s.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{s.name.charAt(0)}</div>
                    )}
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                  </div>
                  <div style={{ background: '#17DB4E15', color: '#17DB4E', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{s.clicks} Cliques</div>
                </div>
              ))}
            </div>
          </div>

          {/* Logs Detalhados (Data e Hora) */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Últimos Cliques</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recentClicks.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                  <div style={{ fontSize: 20 }}>🕒</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{log.seller.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--sidebar-text)' }}>
                      {new Date(log.createdAt).toLocaleDateString('pt-BR')} às {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {recentClicks.length === 0 && <p style={{ color: 'var(--sidebar-text)', fontSize: 13 }}>Nenhum clique registrado no período.</p>}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
