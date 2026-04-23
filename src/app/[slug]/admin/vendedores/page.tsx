import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { createSeller, deleteSeller } from './actions';

export const dynamic = 'force-dynamic';

export default async function VendedoresPage(props: any) {
  const params = await props.params;
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  
  // Busca vendedores de forma segura
  let sellers = [];
  try {
    sellers = await prisma.seller.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  } catch (e) {
    console.error('Erro ao buscar vendedores:', e);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Gestão de Vendedores</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>Cadastre e gerencie sua equipe de vendas.</p>
        </header>

        <section style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', marginBottom: 40 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Novo Vendedor</h3>
          <form action={(fd) => createSeller(fd, slug)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <input name="name" placeholder="Nome do Vendedor" required style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
            <input name="phone" placeholder="WhatsApp (ex: 5511999999999)" required style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--sidebar-text)', marginLeft: 4 }}>Foto (Opcional)</label>
              <input type="file" name="image" accept="image/*" style={{ fontSize: 12 }} />
            </div>
            <button type="submit" style={{ background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Salvar Vendedor</button>
          </form>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {sellers.map((s) => (
            <div key={s.id} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {s.image ? (
                  <img src={s.image} alt={s.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                )}
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>{s.phone}</div>
                </div>
              </div>
              <form action={() => deleteSeller(s.id, slug)}>
                <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Excluir</button>
              </form>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
