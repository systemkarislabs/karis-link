import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Força o Vercel a nunca guardar cache

export default async function PublicTenantPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const slug = resolvedParams.slug;
  const source = resolvedSearchParams.source || 'direct';
  const campaign = resolvedSearchParams.campaign || 'none';

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const sellers = await prisma.seller.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#1e293b',
      fontFamily: 'sans-serif',
      padding: '60px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Título da aba para confirmar o deploy */}
      <title>DESIGN CLEAN ATIVO - {tenant.name}</title>
      
      {/* Logo Circular */}
      <div style={{
        width: '80px', height: '80px', background: '#000', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '32px', fontWeight: 800, marginBottom: '24px'
      }}>
        {tenant.name.charAt(0).toUpperCase()}
      </div>

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Fale com um Especialista
        </h1>
        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', fontSize: '15px' }}>
          Escolha um consultor disponível e inicie sua conversa agora mesmo.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '420px' }}>
        {sellers.map((seller) => (
          <a
            key={seller.id}
            href={`/api/redirect?sellerId=${seller.id}&source=${source}&campaign=${campaign}`}
            style={{
              display: 'flex', alignItems: 'center', padding: '16px 24px',
              background: '#fff', borderRadius: '16px', textDecoration: 'none',
              color: '#1e293b', border: '1px solid #e2e8f0', justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9' }}>
                {seller.image ? (
                  <img src={seller.image} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                )}
              </div>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>{seller.name}</span>
            </div>
            <div style={{ color: '#22c55e' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.9.9L22 4z"/>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
