'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from './Icon';
import LogoutButton from './LogoutButton';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({
  tenantName = 'Karis Labs',
  isSuper = false,
  slug = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = isSuper
    ? [
        { label: 'Empresas', href: '/super-admin', icon: 'home' },
        { label: 'Relatórios', href: '/super-admin/relatorios', icon: 'chart' },
        { label: 'Configurações', href: '/super-admin/configuracoes', icon: 'settings' },
      ]
    : [
        { label: 'Dashboard', href: `/${slug}/admin`, icon: 'home' },
        { label: 'Vendedores', href: `/${slug}/admin/vendedores`, icon: 'users' },
        { label: 'Campanhas', href: `/${slug}/admin/qrcodes`, icon: 'link' },
      ];

  const activeStyle = {
    background: 'var(--sidebar-active-bg)',
    color: 'var(--sidebar-active-text)',
    fontWeight: 600,
  };

  return (
    <>
      {/* Header mobile */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border)',
          zIndex: 99,
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between',
        } as React.CSSProperties}
        className="mobile-header"
      >
        <Image
          src={isSuper ? '/karis-labs-logo.png' : '/karis-link-logo.png'}
          alt={isSuper ? 'Karis Labs' : 'Karis Link'}
          width={98}
          height={28}
          priority
          style={{ width: 98, height: 'auto', objectFit: 'contain' }}
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          aria-label="Abrir menu"
        >
          <Icon name="menu" size={24} color="var(--text-main)" />
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
        />
      )}

      <aside
        style={{
          width: 280,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          padding: '32px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100dvh',
          boxSizing: 'border-box',
          zIndex: 101,
          transition: 'transform 0.3s ease',
        } as React.CSSProperties}
        className={`sidebar-container ${isOpen ? 'open' : ''}`}
      >
        <div style={{ marginBottom: 32, padding: '0 16px' }}>
          <Image
            src={isSuper ? '/karis-labs-logo.png' : '/karis-link-logo.png'}
            alt={isSuper ? 'Karis Labs' : 'Karis Link'}
            width={isSuper ? 128 : 148}
            height={isSuper ? 36 : 42}
            priority
            style={{ width: isSuper ? 128 : 148, height: 'auto', objectFit: 'contain' }}
          />
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-soft)',
              fontWeight: 700,
              marginTop: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {isSuper ? 'Ecossistema KarisLabs' : tenantName}
          </div>
          {!isSuper && (
            <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 6 }}>
              Operação da empresa no Karis Link
            </div>
          )}
        </div>

        <nav
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minHeight: 0,
            overflowY: 'auto',
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              color: 'var(--text-soft)',
              fontSize: 10,
              fontWeight: 700,
              padding: '0 16px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}
          >
            Menu Principal
          </div>

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 14,
                textDecoration: 'none',
                fontSize: 14,
                color: 'var(--sidebar-text)',
                ...(pathname === item.href ? activeStyle : {}),
              }}
            >
              <Icon
                name={item.icon as never}
                size={20}
                color={
                  pathname === item.href
                    ? 'var(--sidebar-active-text)'
                    : 'var(--sidebar-text)'
                }
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            background: 'var(--sidebar-bg)',
            position: 'sticky',
            bottom: 0,
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          <LogoutButton isSuper={isSuper} slug={slug} />
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .mobile-header {
            display: flex !important;
          }
          .sidebar-container {
            transform: translateX(-100%);
            padding-top: 84px !important;
            padding-bottom: 0 !important;
          }
          .sidebar-container.open {
            transform: translateX(0);
          }
        }
        @media (min-width: 1025px) {
          .sidebar-container {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
