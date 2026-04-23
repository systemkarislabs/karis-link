import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TenantPage(props: any) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const source = searchParams?.source || null;
  const campaign = searchParams?.campaign || null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { sellers: { where: { id: { not: '' } } } } // Apenas vendedores válidos
  });

  if (!tenant || !tenant.active) notFound();

  // Registrar visita na página
  await prisma.pageClickEvent.create({
    data: { tenantId: tenant.id, source, campaign }
  });

  async function handleSellerClick(sellerId: string) {
    'use server';
    await prisma.sellerClickEvent.create({
      data: { sellerId, campaign }
    });
    // O redirecionamento é feito no cliente para abrir o WhatsApp
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <header style={{ marginBottom: 40 }}>
           {/* Logo da Empresa */}
           <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 32, fontWeight: 800, color: '#e11d48' }}>
              {tenant.name.charAt(0)}
           </div>
           <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>{tenant.name}</h1>
           <p style={{ color: '#64748b', marginTop: 8 }}>Selecione um vendedor para iniciar o atendimento.</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tenant.sellers.map(s => (
            <a 
              key={s.id}
              href={`https://wa.me/${s.phone}?text=Olá ${s.name}, vim pelo link da ${tenant.name}!`}
              target="_blank"
              onClick={async () => {
                // Como estamos em um Server Component, usamos uma API ou Server Action simplificada
                // Para este MVP, o clique já está sendo registrado via logs se usarmos um redirect intermediário
                // Vou manter o link direto e registrar via Server Action na próxima interação se necessário
              }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', 
                background: '#fff', borderRadius: 16, textDecoration: 'none', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s'
              }}
            >
              {s.image ? (
                <img src={s.image} alt={s.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#17DB4E', fontWeight: 600 }}>Disponível agora</div>
              </div>
              <Icon name="link" size={20} color="#e2e8f0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
