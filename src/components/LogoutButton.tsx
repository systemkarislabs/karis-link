'use client';
import { execLogout } from '@/app/super-admin/actions';
import { Icon } from './Icon';

export default function LogoutButton() {
  const handle = async () => {
    try {
      await execLogout();
      // Força o navegador a ir para o login mesmo se o redirect falhar
      window.location.href = '/super-admin/login';
    } catch (e) {
      window.location.href = '/super-admin/login';
    }
  };

  return (
    <button 
      onClick={handle}
      style={{ 
        width: '100%', padding: '12px', borderRadius: 12, border: 'none', 
        background: 'var(--bg-main)', color: 'var(--sidebar-text)', 
        cursor: 'pointer', fontSize: 14, fontWeight: 600, 
        display: 'flex', alignItems: 'center', gap: 12 
      }}
    >
      <Icon name="logout" size={20} color="var(--sidebar-text)" />
      Sair do Painel
    </button>
  );
}
