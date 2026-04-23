import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PublicTenantPage(props: any) {
  const params = await props.params;
  const { slug } = params;

  // Busca apenas os dados essenciais para ver se o banco responde
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { sellers: true }
  });

  if (!tenant) notFound();

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>{tenant.name}</h1>
      <p style={{ color: '#94a3b8' }}>Se você está vendo esta tela, a conexão básica está funcionando!</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '40px auto' }}>
        {tenant.sellers.map((seller) => (
          <Link 
            key={seller.id}
            href={`/api/redirect?sellerId=${seller.id}`}
            style={{
              background: '#1e293b',
              padding: '20px',
              borderRadius: 16,
              textDecoration: 'none',
              color: '#fff',
              border: '1px solid #334155'
            }}
          >
            {seller.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
