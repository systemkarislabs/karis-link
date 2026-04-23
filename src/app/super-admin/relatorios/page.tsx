import prisma from '@/lib/prisma';
import { requireSuperAuth } from '@/lib/auth';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { execLogout } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ReportsPage(props: any) {
  await requireSuperAuth();
  const searchParams = await props.searchParams;
  const tenantId = searchParams?.tenantId || 'all';
  const period   = searchParams?.period   || '30'; // dias

  const tenants = await prisma.tenant.findMany({ orderBy: { name: 'asc' } });
  
  // Cálculo de datas
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const whereTenant = tenantId === 'all' ? {} : { tenantId };

  const [totalVisits, totalClicks] = await Promise.all([
    prisma.pageClickEvent.count({
      where: { ...whereTenant, createdAt: { gte: startDate } }
    }),
    prisma.sellerClickEvent.count({
      where: { seller: { ...whereTenant }, createdAt: { gte: startDate } }
    })
  ]);

  const conversion = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      {/* Sidebar (Repetida para manter o padrão) */}
      <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ marginBottom: 40, padding: '0 16px' }}>
          <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ width: '120px' }} />
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <Link href="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="home" size={20} color="#64748b" /> Empresas
           </Link>
           <Link href="/super-admin/relatorios" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#fff1f2', color: '#e11d48', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon name="chart" size={20} color="#e11d48" /> Relatórios
           </Link>
           <Link href="/super-admin/configuracoes" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="settings" size={20} color="#64748b" /> Configurações
           </Link>
        </nav>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          <form action={execLogout}>
            <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="logout" size={20} color="#64748b" /> Sair do Painel
            </button>
          </form>
        </div>
      </aside>

      <main style={{ marginLeft: 280, flex: 1, padding: '40px 60px' }}>
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Relatórios Consolidados</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Analise a performance global ou individual das empresas.</p>
        </header>

        {/* Filtros */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: 20, border: '1px solid #e2e8f0', marginBottom: 32, display: 'flex', gap: 16 }}>
          <form style={{ display: 'flex', gap: 16, width: '100%' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Selecionar Empresa</label>
              <select name="tenantId" defaultValue={tenantId} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }}>
                <option value="all">Todas as Empresas</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Período</label>
              <select name="period" defaultValue={period} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }}>
                <option value="7">Últimos 7 dias</option>
                <option value="15">Últimos 15 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 3 meses</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={{ padding: '12px 24px', borderRadius: 12, background: '#e11d48', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Filtrar</button>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Total de Visitas</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#0f172a' }}>{totalVisits}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Cliques convertidos</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#17DB4E' }}>{totalClicks}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Taxa de Conversão Média</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#e11d48' }}>{conversion}%</div>
          </div>
        </div>
      </main>
    </div>
  );
}
