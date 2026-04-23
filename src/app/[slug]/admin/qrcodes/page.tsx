import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { createQrCode, deleteQrCode } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QrCodesPage(props: any) {
  const params = await props.params;
  const { slug } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  const qrcodes = await prisma.qrCode.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Campanhas de QR Code</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>Crie links curtos para rastrear scans de mesas, folhetos ou anúncios.</p>
        </header>

        <section style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', marginBottom: 40 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Novo QR Code</h3>
          <form action={(fd) => createQrCode(fd, slug)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <input name="name" placeholder="Nome (ex: Mesa 01)" required style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
            <input name="slug" placeholder="Identificador (ex: mesa-01)" required style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
            <button type="submit" style={{ background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Gerar QR Code</button>
          </form>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {qrcodes.map((qr) => (
            <div key={qr.id} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{qr.name}</h4>
                  <code style={{ fontSize: 12, color: 'var(--sidebar-text)' }}>/go/{qr.slug}</code>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/${slug}/go/${qr.slug}`} target="_blank" style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: 13, textDecoration: 'none' }}>Testar</Link>
                  <form action={deleteQrCode}>
                    <input type="hidden" name="id" value={qr.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button type="submit" style={{ padding: '6px 12px', borderRadius: 8, background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>Excluir</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
