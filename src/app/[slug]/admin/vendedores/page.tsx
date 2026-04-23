import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { createSeller, deleteSeller } from './actions';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function SellersPage(props: any) {
  const params = await props.params;
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const [tenant, sellers] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.seller.findMany({ where: { tenantId }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Gestão de Vendedores</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>Cadastre e gerencie a equipe que receberá os contatos.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32 }}>
          
          {/* Lista de Vendedores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sellers.map(s => (
              <div key={s.id} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {s.image ? (
                    <img src={s.image} alt={s.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{s.name.charAt(0)}</div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sidebar-text)' }}>{s.phone}</div>
                  </div>
                </div>
                <form action={deleteSeller}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <button type="submit" style={{ padding: '8px 12px', borderRadius: 8, background: '#fff1f2', color: '#e11d48', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Excluir</button>
                </form>
              </div>
            ))}
            {sellers.length === 0 && <p style={{ color: 'var(--sidebar-text)', textAlign: 'center', padding: 40 }}>Nenhum vendedor cadastrado.</p>}
          </div>

          {/* Formulário com Upload */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Novo Vendedor</h3>
            <form action={createSeller} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="hidden" name="slug" value={slug} />
              
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Foto do Vendedor</label>
                <input type="file" name="photo" accept="image/*" style={{ fontSize: 12, color: 'var(--sidebar-text)' }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Nome Completo</label>
                <input name="name" placeholder="Ex: João Silva" required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>WhatsApp (com DDD)</label>
                <input name="phone" placeholder="Ex: 11999999999" required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>

              <button type="submit" style={{ padding: '14px', borderRadius: 10, background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Cadastrar Vendedor</button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
