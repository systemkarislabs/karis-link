import { requireSuperAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import { findStoredSuperAdminAccount } from '@/lib/super-admin';
import { updateSuperAdminCredentials } from '../actions';
import ThemeToggle from '@/components/ThemeToggle';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  await requireSuperAuth();

  const storedAccount = await findStoredSuperAdminAccount();
  const defaultUser =
    storedAccount?.username ||
    process.env.SUPER_ADMIN_USER ||
    process.env.ADMIN_USERNAME ||
    'superadmin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar
        isSuper
        pageTitle="Segurança"
        pageSubtitle="Credenciais e preferências do painel gerencial"
      />

      <main className="main-content kl-page-enter">
        <div className="kl-admin-page">
          <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Credentials card */}
            <div className="kl-card" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0f1c3f18', border: '1px solid #0f1c3f22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="shield" size={18} color="#0f1c3f" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    Credenciais de acesso
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Atualize o usuário e a senha principal.</div>
                </div>
              </div>

              <form action={updateSuperAdminCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>Usuário</span>
                  <input name="username" defaultValue={defaultUser} required className="kl-soft-field" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>Nova senha</span>
                  <input name="password" type="password" placeholder="Mínimo 8 caracteres" required className="kl-soft-field" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>Confirmar senha</span>
                  <input name="confirmPassword" type="password" placeholder="Repita a senha" required className="kl-soft-field" />
                </label>
                <button
                  type="submit"
                  className="kl-green-button"
                  style={{ alignSelf: 'flex-start', border: 'none', paddingLeft: 20, paddingRight: 20 }}
                >
                  <Icon name="check" size={14} color="#fff" />
                  Salvar alterações
                </button>
              </form>
            </div>

            {/* Appearance card */}
            <div className="kl-card" style={{ padding: '24px 28px' }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 2 }}>
                  Aparência
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Preferências de exibição do painel.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="settings" size={15} color="var(--text-soft)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Tema escuro</div>
                      <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Alterna entre tema claro e escuro em todo o painel</div>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
