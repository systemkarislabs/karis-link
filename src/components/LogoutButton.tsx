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
        gap: 8,
        padding: '8px 4px',
        borderRadius: 10,
        color: '#ef4444',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 900,
        width: 'fit-content',
        border: 'none',
        background: 'transparent',
        textAlign: 'left',
      }}
    >
      <Icon name="logout" size={16} color="currentColor" />
      <span>Sair</span>
    </button>
  );
}
