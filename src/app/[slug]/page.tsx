import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PublicTenantPage({ params, searchParams }: any) {
  try {
    // Resolvemos params e searchParams (compatível com Next 14 e 15)
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    
    const slug = resolvedParams.slug;
    const source = resolvedSearchParams.source;
    const campaign = resolvedSearchParams.campaign;

    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (!tenant) notFound();

    const sellers = await prisma.seller.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' }
    });

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{tenant.name}</h1>
          <p style={{ color: '#94a3b8', marginBottom: 40 }}>Selecione um vendedor:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sellers.map((s) => (
              <a 
                key={s.id}
                href={`/api/redirect?sellerId=${s.id}${source ? `&source=${source}` : ''}${campaign ? `&campaign=${campaign}` : ''}`}
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
                {s.image ? (
                  <img src={s.image} alt={s.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                )}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>Disponível</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div style={{ padding: 40, color: 'red' }}>
        Erro ao carregar página: {error.message}
      </div>
    );
  }
}
