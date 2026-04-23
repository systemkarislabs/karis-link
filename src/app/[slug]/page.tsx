import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PublicTenantPage(props: any) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const source = searchParams?.source;
  const campaign = searchParams?.campaign;

  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!tenant) notFound();

  const sellers = await prisma.seller.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  // Tracking silent
  try {
    await prisma.pageClickEvent.create({
      data: {
        tenantId: tenant.id,
        source: source || 'direct',
        campaign: campaign || null
      }
    });
  } catch (e) {}

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#f8fafc' }}>{tenant.name}</h1>
        <p style={{ color: '#94a3b8', marginBottom: 40 }}>Selecione um vendedor:</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sellers.map((seller) => (
            <Link 
              key={seller.id}
              href={`/api/redirect?sellerId=${seller.id}${source ? `&source=${source}` : ''}${campaign ? `&campaign=${encodeURIComponent(campaign)}` : ''}`}
              style={{
                background: '#1e293b',
                padding: '20px',
                borderRadius: 16,
                textDecoration: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                border: '1px solid #334155'
              }}
            >
              {seller.image ? (
                <img src={seller.image} alt={seller.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>{seller.name}</div>
                <div style={{ fontSize: 12, color: '#10b981' }}>Disponível</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
