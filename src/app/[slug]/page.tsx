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
    where: { slug },
    include: {
      sellers: {
        where: { name: { not: "" } },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!tenant) notFound();

  // Registrar o acesso de forma segura (não trava a página se der erro)
  try {
    await prisma.pageClickEvent.create({
      data: {
        tenantId: tenant.id,
        source: source || 'direct',
        campaign: campaign || null
      }
    });
  } catch (e) {
    console.error('Erro ao registrar scan:', e);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#f8fafc' }}>{tenant.name}</h1>
        <p style={{ color: '#94a3b8', marginBottom: 40, fontSize: 16 }}>Escolha um vendedor para iniciar o atendimento no WhatsApp:</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tenant.sellers.map((seller) => (
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
                border: '1px solid #334155',
                transition: 'transform 0.2s'
              }}
            >
              {seller.image ? (
                <img src={seller.image} alt={seller.name} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{seller.name}</div>
                <div style={{ fontSize: 12, color: '#10b981' }}>Disponível agora</div>
              </div>
            </Link>
          ))}
        </div>

        <footer style={{ marginTop: 60, color: '#475569', fontSize: 12 }}>
          Powered by Karis Link © 2024
        </footer>
      </div>
    </div>
  );
}
