import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PublicTenantPage(props: any) {
  try {
    const params = await props.params;
    const { slug } = params;

    // Tenta buscar a empresa
    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (!tenant) {
      return (
        <div style={{ padding: 40, background: '#1e293b', color: '#fff' }}>
          <h1>Empresa não encontrada</h1>
          <p>O slug <strong>{slug}</strong> não existe no banco de dados.</p>
        </div>
      );
    }

    // Tenta buscar vendedores
    const sellers = await prisma.seller.findMany({
      where: { tenantId: tenant.id }
    });

    return (
      <div style={{ padding: 40, background: '#0f172a', color: '#fff' }}>
        <h1>Sucesso!</h1>
        <p>Empresa: {tenant.name}</p>
        <p>Vendedores encontrados: {sellers.length}</p>
      </div>
    );

  } catch (e: any) {
    return (
      <div style={{ padding: 40, background: '#450a0a', color: '#fff', fontFamily: 'monospace' }}>
        <h1 style={{ color: '#f87171' }}>Erro Técnico Detectado</h1>
        <hr />
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {e.stack || e.message || JSON.stringify(e)}
        </pre>
      </div>
    );
  }
}
