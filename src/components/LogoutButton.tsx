import { execLogout } from '@/app/super-admin/actions';
import { handleTenantLogout } from '@/app/[slug]/admin/auth-actions';
import { Icon } from './Icon';

type Props = {
  isSuper?: boolean;
  slug?: string;
};

export default function LogoutButton({ isSuper = true, slug = '' }: Props) {
  const logoutAction = isSuper ? execLogout : handleTenantLogout.bind(null, slug);

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="sidebar-link kl-press"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 8,
          color: 'rgba(255,255,255,.38)',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          width: '100%',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
        }}
      >
        <Icon name="logout" size={16} color="currentColor" />
        <span>Sair</span>
      </button>
    </form>
  );
}
