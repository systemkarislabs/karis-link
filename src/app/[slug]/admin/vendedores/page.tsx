import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { createSeller, deleteSeller } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TenantVendedoresPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);
  const sellers = await prisma.seller.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: 'Poppins, sans-serif' }}>
       <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px 16px' }}>
        <Link href={`/${slug}/admin`} style={{ fontWeight: 800, color: '#17DB4E', textDecoration: 'none' }}>← Voltar</Link>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
           <Link href={`/${slug}/admin/vendedores`} style={{ color: '#111', fontWeight: 700, textDecoration: 'none' }}>Vendedores</Link>
           <Link href={`/${slug}/admin/qrcodes`} style={{ color: '#6b7280', textDecoration: 'none' }}>QR Codes</Link>
        </div>
      </aside>

      <main style={{ marginLeft: 220, padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Gerenciar Vendedores</h1>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Novo Vendedor</h2>
          <form action={createSeller.bind(null, slug)} style={{ display: 'flex', gap: 12 }}>
            <input name="name" placeholder="Nome" required style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <input name="whatsapp" placeholder="WhatsApp (ex: 5511...)" required style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: '#17DB4E', color: '#fff', border: 'none', fontWeight: 700 }}>Adicionar</button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {sellers.map(s => (
            <div key={s.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{s.whatsapp}</div>
              <form action={deleteSeller.bind(null, slug, s.id)} style={{ marginTop: 12 }}>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', padding: 0 }}>Remover</button>
              </form>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
