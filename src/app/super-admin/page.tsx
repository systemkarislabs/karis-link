import { requireSuperAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createTenant, toggleTenant } from './actions';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  try {
    await requireSuperAuth();
    const tenants = await prisma.tenant.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      include: { _count: { select: { sellers: true } } } 
    });

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
        
        <AdminSidebar isSuper={true} />

        <main className="main-content">
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <header style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Dashboard Gerencial</h1>
              <p style={{ color: 'var(--sidebar-text)', marginTop: 4 }}>Visão geral de todas as empresas integradas.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              
              {/* Lista de Empresas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tenants.map(t => (
                  <div key={t.id} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: t.active ? '#f0fdf4' : '#f8fafc', color: t.active ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--sidebar-text)' }}>/{t.slug} · {t._count.sellers} vendedores</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/${t.slug}`} target="_blank" style={{ fontSize: 12, color: 'var(--sidebar-text)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: 'var(--bg-main)' }}>Site</Link>
                      <Link href={`/${t.slug}/admin`} target="_blank" style={{ fontSize: 12, color: 'var(--sidebar-active-text)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: 'var(--sidebar-active-bg)', fontWeight: 600 }}>Painel</Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Lateral */}
              <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Nova Empresa</h3>
                <form action={createTenant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['name', 'slug', 'adminUser', 'adminPass'].map(field => (
                    <div key={field}>
                      <input name={field} placeholder={field === 'name' ? 'Nome da Empresa' : field} required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                    </div>
                  ))}
                  <button type="submit" style={{ padding: '14px', borderRadius: 10, background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Criar Tenant</button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (e) {
    if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e;
    return <div style={{ padding: 40 }}>Erro no banco de dados.</div>;
  }
}
