'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import LogoutButton from './LogoutButton';

type AdminSidebarProps = {
  tenantName?: string;
  isSuper?: boolean;
  slug?: string;
};

export default function AdminSidebar({
  tenantName = 'Karis Labs',
  isSuper = false,
  slug = '',
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = isSuper
    ? [
        { label: 'Empresas', href: '/super-admin', icon: 'home' },
        { label: 'Relatorios', href: '/super-admin/relatorios', icon: 'chart' },
        { label: 'Configuracoes', href: '/super-admin/configuracoes', icon: 'settings' },
      ]
    : [
        { label: 'Dashboard', href: `/${slug}/admin`, icon: 'home' },
        { label: 'Vendedores', href: `/${slug}/admin/vendedores`, icon: 'users' },
        { label: 'Campanhas', href: `/${slug}/admin/qrcodes`, icon: 'link' },
      ];

  return (
    <>
      <div
        className="mobile-header"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border)',
          zIndex: 99,
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between',
        } as CSSProperties}
      >
        <Image
          src={isSuper ? '/karis-labs-logo.png' : '/karis-link-logo.png'}
          alt={isSuper ? 'Karis Labs' : 'Karis Link'}
          width={112}
          height={32}
          priority
          style={{ width: 112, height: 'auto', objectFit: 'contain' }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="kl-press"
          style={{
            width: 44,
            height: 44,
            padding: 10,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: '#ffffff',
            cursor: 'pointer',
          }}
          aria-label="Abrir menu"
          aria-expanded={isOpen}
        >
          <Icon name="menu" size={22} color="var(--text-main)" />
        </button>
      </div>

      {isOpen ? (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
          }}
        />
      ) : null}

      <div
        className="desktop-topbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 220,
          right: 0,
          height: 64,
          background: '#ffffff',
          borderBottom: '1px solid var(--border)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
        }}
      >
        <div
          style={{
            height: 34,
            width: 240,
            borderRadius: 8,
            background: '#f4f4f5',
            border: '1px solid #eeeeef',
          }}
          aria-hidden="true"
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-soft)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--brand-accent)',
              boxShadow: '0 0 0 4px rgba(16,185,129,.12)',
            }}
          />
          Karis Link ativo
        </div>
      </div>

      <aside
        className={`sidebar-container ${isOpen ? 'open' : ''}`}
        style={{
          width: 220,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          padding: '28px 16px 18px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100dvh',
          boxSizing: 'border-box',
          zIndex: 101,
          transition: 'transform 0.24s ease',
        } as CSSProperties}
      >
        <div style={{ marginBottom: 30, padding: '0 12px' }}>
          <Image
            src={isSuper ? '/karis-labs-logo.png' : '/karis-link-logo.png'}
            alt={isSuper ? 'Karis Labs' : 'Karis Link'}
            width={isSuper ? 136 : 146}
            height={isSuper ? 38 : 42}
            priority
            style={{ width: isSuper ? 136 : 146, height: 'auto', objectFit: 'contain' }}
          />
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-soft)',
              fontWeight: 800,
              marginTop: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
            }}
          >
            {isSuper ? 'Ecossistema KarisLabs' : tenantName}
          </div>
          {!isSuper ? (
            <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 6 }}>
              Operacao da empresa no Karis Link
            </div>
          ) : null}
        </div>

        <nav
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minHeight: 0,
            overflowY: 'auto',
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              color: 'var(--text-soft)',
              fontSize: 10,
              fontWeight: 800,
              padding: '0 12px 10px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}
          >
            Menu Principal
          </div>

          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`sidebar-link kl-press ${isActive ? 'is-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: '-0.01em',
                  color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                  background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                }}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  color={isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)'}
                />
                {item.label}
              </Link>
            );
          })}
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

          .desktop-topbar {
            display: none !important;
          }

          .sidebar-container {
            transform: translateX(-100%);
            padding-top: 84px !important;
            padding-bottom: 0 !important;
            box-shadow: 26px 0 68px rgba(9, 9, 11, 0.16) !important;
          }

          .sidebar-container.open {
            transform: translateX(0);
          }
        }

        @media (min-width: 1025px) {
          .sidebar-container {
            transform: translateX(0) !important;
          }

          .desktop-topbar {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
