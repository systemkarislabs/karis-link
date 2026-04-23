import { requireSuperAuth } from '@/lib/auth';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { handleSuperLogout } from './actions';

export default async function SettingsPage() {
  await requireSuperAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ marginBottom: 40, padding: '0 16px' }}>
          <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ width: '120px' }} />
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <Link href="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="home" size={20} color="#64748b" /> Empresas
           </Link>
           <Link href="/super-admin/relatorios" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="chart" size={20} color="#64748b" /> Relatórios
           </Link>
           <Link href="/super-admin/configuracoes" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#fff1f2', color: '#e11d48', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon name="settings" size={20} color="#e11d48" /> Configurações
           </Link>
        </nav>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          <form action={handleSuperLogout}>
            <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="logout" size={20} color="#64748b" /> Sair do Painel
            </button>
          </form>
        </div>
      </aside>

      <main style={{ marginLeft: 280, flex: 1, padding: '40px 60px' }}>
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Configurações do Painel</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Personalize a sua experiência de uso.</p>
        </header>

        <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #e2e8f0', maxWidth: 600 }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700 }}>Aparência</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Tema Dark (Escuro)</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Ativa o modo noturno em todo o painel.</div>
            </div>
            <div style={{ position: 'relative', width: 50, height: 26, background: '#e2e8f0', borderRadius: 13, cursor: 'pointer' }}>
               <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
            </div>
          </div>
          
          <p style={{ marginTop: 24, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>* O Dark Mode será ativado automaticamente através de variáveis CSS na próxima atualização.</p>
        </div>
      </main>
    </div>
  );
}
