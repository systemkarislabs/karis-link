import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PublicTenantPage(props: any) {
  const params = await props.params;
  const { slug } = params;

  // 1. Busca a empresa primeiro de forma isolada
  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!tenant) notFound();

  // 2. Busca os vendedores separadamente para não sobrecarregar a consulta
  // Selecionamos apenas os campos necessários para economizar memória
  const sellers = await prisma.seller.findMany({
    where: { tenantId: tenant.id },
    select: {
      id: true,
      name: true,
      image: true,
      phone: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#f8fafc' }}>{tenant.name}</h1>
        <p style={{ color: '#94a3b8', marginBottom: 40 }}>Selecione um vendedor abaixo:</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sellers.map((seller) => (
            <Link 
              key={seller.id}
              href={`/api/redirect?sellerId=${seller.id}`}
              style={{
                background: '#1e293b',
                padding: '16px',
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
          
          {sellers.length === 0 && (
            <div style={{ padding: 40, color: '#94a3b8' }}>Nenhum vendedor disponível no momento.</div>
          )}
        </div>

        <footer style={{ marginTop: 60, color: '#475569', fontSize: 12 }}>
          Powered by Karis Link © 2024
        </footer>
      </div>
    </div>
  );
}
