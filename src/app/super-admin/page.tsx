import { requireSuperAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleSuperLogout, createTenant, toggleTenant } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  try {
    await requireSuperAuth();
    const tenants = await prisma.tenant.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      include: { _count: { select: { sellers: true } } } 
    });
    // ... restante do código
  } catch (e) {
    console.error("Erro no SuperAdmin:", e);
    // Se for erro de redirect do próprio Next, ele deve seguir
    if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e;
    return <div style={{ padding: 20 }}>Erro ao carregar banco de dados. Verifique as variáveis DATABASE_URL no Netlify.</div>;
  }


  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: 'Poppins, sans-serif' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: '#111', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#17DB4E', marginBottom: 4 }}>Karis Link</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 32 }}>Super Admin</div>
        <div style={{ flex: 1 }} />
        <form action={handleSuperLogout}>
          <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #374151', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}>Sair</button>
        </form>
      </aside>

      <main style={{ marginLeft: 220, padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Empresas</h1>
        <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>{tenants.length} empresa(s) cadastrada(s)</p>

        {/* Form criar tenant */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Nova Empresa</h2>
          <form action={createTenant} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { name: 'name',      label: 'Nome da empresa',  placeholder: 'Ex: Texpar Malhas' },
              { name: 'slug',      label: 'Slug (URL)',        placeholder: 'Ex: texpar' },
              { name: 'adminUser', label: 'Usuário admin',     placeholder: 'admin' },
              { name: 'adminPass', label: 'Senha admin',       placeholder: '••••••' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input name={f.name} placeholder={f.placeholder} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, background: '#17DB4E', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Criar Empresa</button>
            </div>
          </form>
        </div>

        {/* Lista de tenants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tenants.map(t => (
            <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                  /{t.slug} · {t._count.sellers} vendedores · login: {t.adminUser}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: t.active ? '#dcfce7' : '#f3f4f6', color: t.active ? '#16a34a' : '#9ca3af' }}>
                  {t.active ? 'Ativo' : 'Inativo'}
                </span>
                <Link href={`/${t.slug}/admin`} style={{ fontSize: 12, color: '#17DB4E', textDecoration: 'none' }}>Ver admin</Link>
                <Link href={`/${t.slug}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>Ver site</Link>
                <form action={toggleTenant.bind(null, t.id, t.active)}>
                  <button style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#374151' }}>
                    {t.active ? 'Pausar' : 'Ativar'}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
