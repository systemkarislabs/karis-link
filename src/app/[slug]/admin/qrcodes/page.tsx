import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { createQrCode, deleteQrCode } from './actions';
import { Icon } from '@/components/Icon';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QrCodesPage(props: any) {
  const params = await props.params;
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const [tenant, qrCodes] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.qrCode.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Campanhas QR Code</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>Crie links curtos que redirecionam para o seu rodízio de vendedores.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          
          {/* Lista de QRs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {qrCodes.map(qr => (
              <div key={qr.id} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="link" size={24} color="var(--sidebar-active-text)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{qr.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sidebar-text)' }}>slug: <strong>{qr.slug}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                   <Link href={`/${slug}/go/${qr.slug}`} target="_blank" style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-main)', color: 'var(--text-main)', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Testar</Link>
                   <form action={deleteQrCode}>
                      <input type="hidden" name="id" value={qr.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button type="submit" style={{ padding: '8px 12px', borderRadius: 8, background: '#fff1f2', color: '#e11d48', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Excluir</button>
                   </form>
                </div>
              </div>
            ))}
            {qrCodes.length === 0 && <p style={{ color: 'var(--sidebar-text)', textAlign: 'center', padding: 40 }}>Nenhuma campanha criada ainda.</p>}
          </div>

          {/* Criar Novo QR */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Nova Campanha</h3>
            <form action={createQrCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="hidden" name="slug" value={slug} />
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Nome da Campanha</label>
                <input name="name" placeholder="Ex: Campanha Instagram" required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>URL Curta (Slug)</label>
                <input name="qrSlug" placeholder="Ex: instagram" required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>
              <button type="submit" style={{ padding: '14px', borderRadius: 10, background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Gerar Link / QR Code</button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
