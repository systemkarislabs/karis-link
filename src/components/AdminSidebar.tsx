'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import LogoutButton from './LogoutButton';
import AuthCacheGuard from './AuthCacheGuard';

type AdminSidebarProps = {
  tenantName?: string;
  isSuper?: boolean;
  slug?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  actions?: React.ReactNode;
};

export default function AdminSidebar({
  tenantName = 'Karis Labs',
  isSuper = false,
  slug = '',
  pageTitle,
  pageSubtitle,
  actions,
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = isSuper
    ? [
        { label: 'Dashboard', href: '/super-admin', icon: 'home' },
        { label: 'Relatórios', href: '/super-admin/relatorios', icon: 'chart' },
        { label: 'Segurança', href: '/super-admin/configuracoes', icon: 'shield' },
      ]
    : [
        { label: 'Dashboard', href: `/${slug}/admin`, icon: 'home' },
        { label: 'Vendedores', href: `/${slug}/admin/vendedores`, icon: 'users' },
        { label: 'Campanhas', href: `/${slug}/admin/qrcodes`, icon: 'megaphone' },
      ];

  const renderSidebar = () => (
    <aside
      style={{
        width: 240,
        background: '#0f1c3f',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '0 12px 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100dvh',
        boxSizing: 'border-box',
        zIndex: 101,
        top: 0,
        left: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 8px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <Image
          src="/karis-link-logo.png"
          alt="Karis Link"
          width={132}
          height={46}
          priority
          style={{
            width: 120,
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>

      {/* Tenant label */}
      {!isSuper && (
        <div style={{ padding: '0 8px', marginBottom: 16, flexShrink: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              marginBottom: 3,
            }}
          >
            Empresa
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {tenantName}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: 0,
        }}
      >
        {menuItems.map((item) => {
          const isActive =
            item.href === `/${slug}/admin` || item.href === '/super-admin'
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`kl-sidebar-link${isActive ? ' is-active' : ''}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
                background: isActive ? 'rgba(22,163,74,0.2)' : 'transparent',
                color: isActive ? '#4ade80' : 'rgba(255,255,255,0.55)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: '0 2px 2px 0',
                    background: '#4ade80',
                  }}
                />
              )}
              <Icon name={item.icon} size={16} color="currentColor" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="user" size={14} color="rgba(255,255,255,0.6)" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isSuper ? 'Super Admin' : tenantName}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
              link.karisnegocios.com.br
            </div>
          </div>
        </div>
        <LogoutButton isSuper={isSuper} slug={slug} />
      </div>
    </aside>
  );

  return (
    <>
      <AuthCacheGuard />

      {/* Mobile header */}
      <div
        className="kl-mobile-bar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: '#0f1c3f',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: 99,
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: 'space-between',
        }}
      >
        <Image
          src="/karis-link-logo.png"
          alt="Karis Link"
          width={110}
          height={38}
          priority
          style={{
            width: 90,
            height: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          aria-label="Abrir menu"
          aria-expanded={isOpen}
        >
          <Icon name="menu" size={20} color="#fff" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,11,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
          }}
        />
      )}

      {/* Desktop sidebar */}
      <div className="kl-sidebar-wrap">
        {renderSidebar()}
      </div>

      {/* Mobile sidebar (when open) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100dvh',
            zIndex: 102,
            width: 240,
          }}
        >
          {renderSidebar()}
        </div>
      )}

      {/* Topbar */}
      <div
        className="kl-topbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 240,
          right: 0,
          height: 56,
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--border)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <div>
          {pageTitle && (
            <h1
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
              }}
            >
              {pageTitle}
            </h1>
          )}
          {pageSubtitle && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft)' }}>
              {pageSubtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {actions}
          </div>
        )}
      </div>

      <style jsx global>{`
        .kl-sidebar-link:hover:not(.is-active) {
          background: rgba(255, 255, 255, 0.06) !important;
          color: rgba(255, 255, 255, 0.85) !important;
        }
        @media (max-width: 1024px) {
          .kl-mobile-bar {
            display: flex !important;
          }
          .kl-sidebar-wrap {
            display: none !important;
          }
          .kl-topbar {
            left: 0 !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding-top: 68px !important;
          }
        }
        @media (min-width: 1025px) {
          .kl-sidebar-wrap {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
