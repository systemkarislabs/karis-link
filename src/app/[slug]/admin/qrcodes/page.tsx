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

  // Buscamos os QRs e as métricas de cada um
  const [tenant, qrCodesData] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.qrCode.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
  ]);

  // Buscamos os eventos para calcular as métricas de cada QR Code
  const qrCodes = await Promise.all(qrCodesData.map(async (qr) => {
    const scans = await prisma.pageClickEvent.count({ 
      where: { tenantId, campaign: qr.slug } 
    });
    const conversions = await prisma.sellerClickEvent.count({ 
      where: { seller: { tenantId }, campaign: qr.slug } 
    });
    return { ...qr, scans, conversions };
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Métricas de Campanhas QR</h1>
          <p style={{ color: 'var(--sidebar-text)' }}>Acompanhe o funil de conversão de cada ponto de contato.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {qrCodes.map(qr => (
              <div key={qr.id} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: '24px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#f8fafc', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Icon name="link" size={20} color="var(--sidebar-active-text)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{qr.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--sidebar-text)' }}>slug: {qr.slug}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/${slug}/go/${qr.slug}`} target="_blank" style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-main)', color: 'var(--text-main)', textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>Link</Link>
                    <form action={deleteQrCode}>
                      <input type="hidden" name="id" value={qr.id} /><input type="hidden" name="slug" value={slug} />
                      <button style={{ padding: '6px 12px', borderRadius: 8, background: '#fff1f2', color: '#e11d48', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Excluir</button>
                    </form>
                  </div>
                </div>

                {/* Funil de Conversão do QR */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, background: 'var(--bg-main)', padding: '16px', borderRadius: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Scans (Leituras)</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{qr.scans}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Vendas Iniciadas</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#17DB4E' }}>{qr.conversions}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Conversão QR</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--sidebar-active-text)' }}>
                      {qr.scans > 0 ? ((qr.conversions / qr.scans) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Nova Campanha</h3>
            <form action={createQrCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="hidden" name="slug" value={slug} />
              <input name="name" placeholder="Nome (Ex: Menu Mesa 01)" required style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              <input name="qrSlug" placeholder="Slug (Ex: mesa-01)" required style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              <button type="submit" style={{ padding: '14px', borderRadius: 10, background: 'var(--sidebar-active-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Gerar Campanha</button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
