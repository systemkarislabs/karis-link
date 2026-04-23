import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { createQrCode, deleteQrCode } from './actions';
import QrCodesClient from './QrCodesClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TenantQrCodesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { tenantId } = await requireTenantAuth(slug);
  const qrCodes = await prisma.qrCode.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: 'Poppins, sans-serif' }}>
       <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px 16px' }}>
        <Link href={`/${slug}/admin`} style={{ fontWeight: 800, color: '#17DB4E', textDecoration: 'none' }}>← Voltar</Link>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
           <Link href={`/${slug}/admin/vendedores`} style={{ color: '#6b7280', textDecoration: 'none' }}>Vendedores</Link>
           <Link href={`/${slug}/admin/qrcodes`} style={{ color: '#111', fontWeight: 700, textDecoration: 'none' }}>QR Codes</Link>
        </div>
      </aside>

      <main style={{ marginLeft: 220, padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Campanhas QR Code</h1>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Novo QR Code</h2>
          <form action={createQrCode.bind(null, slug)} style={{ display: 'flex', gap: 12 }}>
            <input name="name" placeholder="Nome (ex: Instagram Bio)" required style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <input name="slug" placeholder="Slug (ex: insta-bio)" required style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: '#17DB4E', color: '#fff', border: 'none', fontWeight: 700 }}>Gerar</button>
          </form>
        </div>

        <QrCodesClient qrCodes={qrCodes} slug={slug} deleteAction={deleteQrCode} />
      </main>
    </div>
  );
}
