import { requireSuperAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { execLogout, createTenant, toggleTenant } from './actions';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  try {
    await requireSuperAuth();
    const tenants = await prisma.tenant.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      include: { _count: { select: { sellers: true } } } 
    });

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
        
        {/* Sidebar Estilo Referência */}
        <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
          <div style={{ marginBottom: 40, padding: '0 16px' }}>
            <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ width: '120px' }} />
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
             <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, padding: '0 16px 8px', textTransform: 'uppercase' }}>Menu Principal</div>
             
             <Link href="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#fff1f2', color: '#e11d48', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                <Icon name="home" size={20} color="#e11d48" /> Empresas
             </Link>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', fontSize: 14, fontWeight: 500, cursor: 'not-allowed' }}>
                <Icon name="chart" size={20} color="#64748b" /> Relatórios
             </div>

             <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', fontSize: 14, fontWeight: 500, cursor: 'not-allowed' }}>
                <Icon name="settings" size={20} color="#64748b" /> Configurações
             </div>
          </nav>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
            <form action={execLogout}>
              <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="logout" size={20} color="#64748b" /> Sair do Painel
              </button>
            </form>
          </div>
        </aside>

        {/* Content */}
        <main style={{ marginLeft: 280, flex: 1, padding: '40px 60px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <header style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Dashboard Gerencial</h1>
              <p style={{ color: '#64748b', marginTop: 4 }}>Visão geral de todas as empresas integradas.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tenants.map(t => (
                  <div key={t.id} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: t.active ? '#f0fdf4' : '#f8fafc', color: t.active ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>/{t.slug} · {t._count.sellers} vendedores</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/${t.slug}`} target="_blank" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: '#f1f5f9' }}>Site</Link>
                      <Link href={`/${t.slug}/admin`} target="_blank" style={{ fontSize: 12, color: '#e11d48', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: '#fff1f2', fontWeight: 600 }}>Painel</Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Lateral Slim */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700 }}>Nova Empresa</h3>
                <form action={createTenant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['name', 'slug', 'adminUser', 'adminPass'].map(field => (
                    <div key={field}>
                      <input name={field} placeholder={field === 'name' ? 'Nome da Empresa' : field} required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc' }} />
                    </div>
                  ))}
                  <button type="submit" style={{ padding: '14px', borderRadius: 10, background: '#e11d48', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Criar Tenant</button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (e) {
    return <div style={{ padding: 40 }}>Erro no banco de dados.</div>;
  }
}
