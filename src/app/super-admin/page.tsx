import { requireSuperAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleSuperLogout, createTenant, toggleTenant } from './actions';
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
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins, sans-serif', display: 'flex' }}>
        
        {/* Sidebar Premium */}
        <aside style={{ width: 260, background: '#0f172a', color: '#fff', padding: '32px 24px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ width: '140px', marginBottom: 12 }} />
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Plataforma Link</div>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
             <div style={{ background: 'rgba(23, 219, 78, 0.1)', color: '#17DB4E', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}>
                <Icon name="home" size={18} color="#17DB4E" /> Empresas
             </div>
          </nav>

          <form action={handleSuperLogout}>
            <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="logout" size={16} color="#94a3b8" /> Sair do Painel
            </button>
          </form>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: 260, flex: 1, padding: '40px 60px' }}>
          
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>Gestão de Empresas</h1>
              <p style={{ color: '#64748b', marginTop: 4 }}>Controle todos os tenants da plataforma Karis Link.</p>
            </div>
            <div style={{ background: '#fff', padding: '10px 20px', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
               <span style={{ fontSize: 20, fontWeight: 800, color: '#17DB4E' }}>{tenants.length}</span>
               <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8 }}>Empresas Ativas</span>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32, alignItems: 'start' }}>
            
            {/* Lista de Empresas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tenants.map(t => (
                <div key={t.id} style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: t.active ? '#17DB4E' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: t.active ? '#fff' : '#94a3b8' }}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{t.name}</h3>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        <span style={{ color: '#17DB4E', fontWeight: 600 }}>/{t.slug}</span> · {t._count.sellers} vendedores · user: {t.adminUser}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Link href={`/${t.slug}`} target="_blank" style={{ padding: '8px 12px', borderRadius: 10, background: '#f8fafc', color: '#64748b', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Ver Site</Link>
                    <Link href={`/${t.slug}/admin`} target="_blank" style={{ padding: '8px 12px', borderRadius: 10, background: '#f8fafc', color: '#17DB4E', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Painel</Link>
                    
                    <form action={toggleTenant.bind(null, t.id, t.active)}>
                      <button style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: t.active ? '#fff1f2' : '#f0fdf4', color: t.active ? '#e11d48' : '#16a34a', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        {t.active ? 'Pausar' : 'Ativar'}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Lateral - Criar Empresa */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', position: 'sticky', top: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#17DB4E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Icon name="plus" size={20} color="#fff" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Nova Empresa</h2>
              </div>

              <form action={createTenant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { name: 'name',      label: 'Nome Comercial',  placeholder: 'Ex: Texpar Malhas' },
                  { name: 'slug',      label: 'Slug da URL (minúsculo)', placeholder: 'texpar' },
                  { name: 'adminUser', label: 'Usuário do Admin',     placeholder: 'admin' },
                  { name: 'adminPass', label: 'Senha do Admin',       placeholder: '••••••' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                    <input name={f.name} placeholder={f.placeholder} required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none', background: '#f8fafc' }} />
                  </div>
                ))}
                <button type="submit" style={{ marginTop: 8, padding: '16px', borderRadius: 14, background: '#17DB4E', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(23, 219, 78, 0.25)', fontSize: 15 }}>
                  Cadastrar Empresa
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    );
  } catch (e) {
    console.error("Erro no SuperAdmin:", e);
    if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e;
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Poppins' }}>
        <h2 style={{ color: '#e11d48' }}>Erro de Conexão</h2>
        <p>Não foi possível conectar ao banco de dados. Verifique a DATABASE_URL no Netlify.</p>
      </div>
    );
  }
}
