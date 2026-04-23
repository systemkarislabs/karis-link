import { requireSuperAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { findStoredSuperAdminAccount } from '@/lib/super-admin';
import { updateSuperAdminCredentials } from '../actions';
import ThemeToggle from '@/components/ThemeToggle';

export default async function SettingsPage() {
  await requireSuperAuth();

  const storedAccount = await findStoredSuperAdminAccount();
  const defaultUser = storedAccount?.username || process.env.SUPER_ADMIN_USER || process.env.ADMIN_USERNAME || 'superadmin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar isSuper={true} />

      <main className="main-content">
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Configuracoes do Painel</h1>
          <p style={{ color: 'var(--sidebar-text)', marginTop: 4 }}>Gerencie acesso e personalize sua experiencia de uso.</p>
        </header>

        <div style={{ display: 'grid', gap: 24, maxWidth: 720 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: 32, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Seguranca do Super Admin</h3>

            <form action={updateSuperAdminCredentials} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                  Usuario
                </label>
                <input
                  name="username"
                  defaultValue={defaultUser}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                    outline: 'none',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                  Nova senha
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                    outline: 'none',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                  Confirmar nova senha
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                    outline: 'none',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: 'fit-content',
                  padding: '12px 18px',
                  borderRadius: 10,
                  background: 'var(--sidebar-active-text)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Atualizar credenciais
              </button>
            </form>
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: 32, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Aparencia</h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: 16,
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Tema Dark (Escuro)</div>
                <div style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>Ativa o modo noturno em todo o painel.</div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
