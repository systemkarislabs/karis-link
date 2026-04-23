import { requireSuperAuth } from '@/lib/auth';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { execLogout } from '../actions';
import ThemeToggle from '@/components/ThemeToggle';

export default async function SettingsPage() {
  await requireSuperAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <aside style={{ width: 280, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ marginBottom: 40, padding: '0 16px' }}>
          <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ width: '120px' }} />
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <Link href="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: 'var(--sidebar-text)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="home" size={20} color="var(--sidebar-text)" /> Empresas
           </Link>
           <Link href="/super-admin/relatorios" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: 'var(--sidebar-text)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <Icon name="chart" size={20} color="var(--sidebar-text)" /> Relatórios
           </Link>
           <Link href="/super-admin/configuracoes" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-text)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon name="settings" size={20} color="var(--sidebar-active-text)" /> Configurações
           </Link>
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <form action={execLogout}>
            <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'var(--bg-main)', color: 'var(--sidebar-text)', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="logout" size={20} color="var(--sidebar-text)" /> Sair do Painel
            </button>
          </form>
        </div>
      </aside>

      <main style={{ marginLeft: 280, flex: 1, padding: '40px 60px' }}>
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Configurações do Painel</h1>
          <p style={{ color: 'var(--sidebar-text)', marginTop: 4 }}>Personalize a sua experiência de uso.</p>
        </header>

        <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', maxWidth: 600 }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Aparência</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: 16, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Tema Dark (Escuro)</div>
              <div style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>Ativa o modo noturno em todo o painel.</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </main>
    </div>
  );
}
