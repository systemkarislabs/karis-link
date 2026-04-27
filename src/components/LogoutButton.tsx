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
    <button
      type="button"
      onClick={handle}
      className="sidebar-link kl-press"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 14,
        color: 'var(--sidebar-text)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        width: '100%',
        border: 'none',
        background: 'transparent',
        textAlign: 'left',
      }}
    >
      <Icon name="logout" size={20} color="var(--sidebar-text)" />
      <span>Sair do Painel</span>
    </button>
  );
}
