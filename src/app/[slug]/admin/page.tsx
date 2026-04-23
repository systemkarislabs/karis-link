import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { handleTenantLogout } from './auth-actions';
import Link from 'next/link';
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      
      {/* Sidebar Padrão SaaS */}
      <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ marginBottom: 40, padding: '0 16px' }}>
          <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ width: '100px' }} />
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>{tenant?.name}</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <Link href={`/${slug}/admin`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#fff1f2', color: '#e11d48', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon name="home" size={20} color="#e11d48" /> Dashboard
           </Link>
           <Link href={`/${slug}/admin/vendedores`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="users" size={20} color="#64748b" /> Vendedores
           </Link>
           <Link href={`/${slug}/admin/qrcodes`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="link" size={20} color="#64748b" /> Campanhas QR
           </Link>
        </nav>

        <form action={handleTenantLogout.bind(null, slug)}>
          <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Sair</button>
        </form>
      </aside>

      <main style={{ marginLeft: 280, flex: 1, padding: '40px 60px' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Bem-vindo, {tenant?.name}</h1>
          <p style={{ color: '#64748b' }}>Acompanhe o desempenho dos seus links em tempo real.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
          {[
            { label: 'Visitas na Página', value: totalVisits, icon: 'eye' },
            { label: 'Cliques WhatsApp', value: totalClicks, icon: 'whatsapp' },
            { label: 'Conversão', value: `${conversion}%`, icon: 'trending' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700 }}>Ranking de Vendedores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sellers.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, background: '#f8fafc' }}>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontWeight: 700, color: '#e11d48' }}>{s.clicks} cliques</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
