'use client';
import { execLogout } from '@/app/super-admin/actions';
import { Icon } from './Icon';

export default function LogoutButton() {
  const handle = async () => {
    try {
      await execLogout();
      window.location.href = '/super-admin/login';
    } catch (e) {
      window.location.href = '/super-admin/login';
    }
  };

  return (
    <div 
      onClick={handle}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        padding: '12px 16px', 
        borderRadius: 12, 
        color: 'var(--sidebar-text)', 
        cursor: 'pointer', 
        fontSize: 14, 
        fontWeight: 500,
        transition: 'all 0.2s',
        width: '100%'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'var(--sidebar-active-bg)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <Icon name="logout" size={20} color="var(--sidebar-text)" />
      <span>Sair do Painel</span>
    </div>
  );
}
