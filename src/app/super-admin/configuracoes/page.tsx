import { requireSuperAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { findStoredSuperAdminAccount } from '@/lib/super-admin';
import { updateSuperAdminCredentials } from '../actions';
import ThemeToggle from '@/components/ThemeToggle';
import { Icon } from '@/components/Icon';

export default async function SettingsPage() {
  await requireSuperAuth();

  const storedAccount = await findStoredSuperAdminAccount();
  const defaultUser = storedAccount?.username || process.env.SUPER_ADMIN_USER || process.env.ADMIN_USERNAME || 'superadmin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar isSuper />

      <main className="main-content kl-page-enter">
        <div className="kl-admin-page">
          <header style={{ marginBottom: 34 }}>
            <h1 className="kl-panel-title">Segurança</h1>
            <p className="kl-panel-subtitle">Gerencie credenciais e preferências do painel gerencial.</p>
          </header>

          <section className="kl-card" style={{ padding: 32 }}>
            <div className="kl-card-header">
              <span className="kl-card-icon"><Icon name="shield" size={20} /></span>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '-0.04em' }}>
                  Credenciais do Super Admin
                </h2>
                <p style={{ margin: '2px 0 0', color: '#71717a', fontSize: 12 }}>
                  Atualize o usuário e a senha principal.
                </p>
              </div>
            </div>

            <form action={updateSuperAdminCredentials} style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#18181b' }}>Usuário</span>
                <input name="username" defaultValue={defaultUser} required className="kl-soft-field" />
              </label>

              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#18181b' }}>Nova senha</span>
                <input name="password" type="password" required className="kl-soft-field" />
              </label>

              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#18181b' }}>Confirmar nova senha</span>
                <input name="confirmPassword" type="password" required className="kl-soft-field" />
              </label>

              <button type="submit" className="kl-green-button kl-press" style={{ width: 'fit-content' }}>
                Atualizar credenciais
              </button>
            </form>

            <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid #f1f1f2' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 900 }}>Aparência</h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 18,
                  padding: 18,
                  borderRadius: 16,
                  background: '#fafafa',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="kl-card-icon" style={{ width: 40, height: 40 }}>
                    <Icon name="settings" size={18} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#18181b' }}>Tema Dark (Escuro)</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>Ativa o modo noturno em todo o painel.</div>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
