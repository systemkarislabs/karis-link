'use client';
import { execLogout } from '@/app/super-admin/actions';
import { handleTenantLogout } from '@/app/[slug]/admin/auth-actions';
import { Icon } from './Icon';

type Props = {
  isSuper?: boolean;
  slug?: string;
};

export default function LogoutButton({ isSuper = true, slug = '' }: Props) {
  const handle = async () => {
    try {
      if (isSuper) {
        await execLogout();
        window.location.href = '/super-admin/login';
      } else {
        await handleTenantLogout(slug);
        window.location.href = `/${slug}`;
      }
    } catch {
      window.location.href = isSuper ? '/super-admin/login' : `/${slug}`;
    }
  };

  return (
    <div
      onClick={handle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handle()}
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
        width: '100%',
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--sidebar-active-bg)')}
      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Icon name="logout" size={20} color="var(--sidebar-text)" />
      <span>Sair do Painel</span>
    </div>
  );
}
