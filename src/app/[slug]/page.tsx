import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicPageClient from '../PublicPageClient';

export const dynamic = 'force-dynamic';

export default async function PublicTenantPage({ params, searchParams }: any) {
  try {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    
    const slug = resolvedParams.slug;
    const source = resolvedSearchParams.source || 'direct';
    const campaign = resolvedSearchParams.campaign || 'none';

    // Busca o Tenant (Empresa)
    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (!tenant) notFound();

    // Busca Vendedores
    const sellers = await prisma.seller.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' }
    });

    // Se não houver vendedores, mostra estado vazio elegante
    if (sellers.length === 0) {
      return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 20 }}>
          <div style={{ textAlign: 'center', background: 'rgba(30, 41, 59, 0.5)', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{tenant.name}</h1>
            <p style={{ color: '#94a3b8' }}>Nenhum vendedor disponível no momento.</p>
          </div>
        </div>
      );
    }

    // Renderiza o Cliente (onde o design premium acontece)
    return (
      <PublicPageClient 
        tenantName={tenant.name}
        sellers={sellers}
        slug={slug}
        source={source}
        campaign={campaign}
      />
    );
  } catch (error) {
    console.error('Error loading page:', error);
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <p>Ocorreu um erro ao carregar a página. Por favor, tente novamente.</p>
      </div>
    );
  }
}
