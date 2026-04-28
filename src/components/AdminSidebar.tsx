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
        { label: 'Dashboard', href: '/super-admin', icon: 'home' },
        { label: 'Relatórios', href: '/super-admin/relatorios', icon: 'chart' },
        { label: 'Segurança', href: '/super-admin/configuracoes', icon: 'shield' },
      ]
    : [
        { label: 'Dashboard', href: `/${slug}/admin`, icon: 'home' },
        { label: 'Vendedores', href: `/${slug}/admin/vendedores`, icon: 'users' },
        { label: 'Campanhas', href: `/${slug}/admin/qrcodes`, icon: 'megaphone' },
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
          height: 70,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
          zIndex: 99,
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between',
        } as CSSProperties}
      >
        <Image
          src="/karis-link-logo.png"
          alt="Karis Link"
          width={132}
          height={46}
          priority
          style={{ width: 92, height: 'auto', objectFit: 'contain' }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="kl-press"
          style={{
            width: 44,
            height: 44,
            padding: 10,
            borderRadius: 13,
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
            background: 'rgba(9, 9, 11, 0.48)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
          }}
        />
      ) : null}

      <div
        className="desktop-topbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 272,
          right: 0,
          height: 72,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
        }}
      >
        <label className="kl-topbar-search" aria-label="Pesquisar">
          <Icon name="search" size={15} />
          <input placeholder="Pesquisar..." />
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="kl-topbar-meta">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--brand-accent)',
                boxShadow: '0 0 0 4px rgba(16,185,129,.12)',
              }}
            />
            <Icon name="clock" size={14} color="#a1a1aa" />
            Última atualização: 1m atrás
          </div>
          <button
            type="button"
            aria-label="Notificações"
            className="kl-press"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="bell" size={16} color="#71717a" />
          </button>
        </div>
      </div>

      <aside
        className={`sidebar-container ${isOpen ? 'open' : ''}`}
        style={{
          width: 272,
          background: 'rgba(255, 255, 255, 0.98)',
          borderRight: '1px solid var(--border)',
          padding: '24px 20px 22px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100dvh',
          boxSizing: 'border-box',
          zIndex: 101,
          transition: 'transform 0.24s ease',
        } as CSSProperties}
      >
        <div style={{ marginBottom: 30, paddingBottom: 24, borderBottom: '1px solid #f0f1f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="kl-brand-mark">K</span>
            <div>
              <div className="kl-brand-name">
                Karis<span>Link</span>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 10,
              marginLeft: 50,
              color: 'var(--text-main)',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              opacity: 0.48,
            }}
          >
            Powered by
          </div>
          <Image
            src="/karis-labs-logo.png"
            alt="Karis Negocios"
            width={132}
            height={64}
            style={{
              width: 58,
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
              marginTop: 3,
              marginLeft: 50,
              display: 'block',
              opacity: 0.76,
            }}
          />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`sidebar-link kl-press ${isActive ? 'is-active' : ''}`}
                style={{
                  minHeight: 46,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 16px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 850 : 750,
                  letterSpacing: '-0.02em',
                  color: isActive ? 'var(--brand-accent-strong)' : 'var(--sidebar-text)',
                  background: isActive ? 'rgba(18, 185, 129, 0.105)' : 'transparent',
                  border: isActive ? '1px solid rgba(18,185,129,.28)' : '1px solid transparent',
                }}
              >
                <Icon name={item.icon} size={18} color="currentColor" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ paddingTop: 16, borderTop: '1px solid #f0f1f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                color: 'var(--text-soft)',
              }}
            >
              <Icon name="user" size={16} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-main)' }}>
                {isSuper ? 'Super Admin' : tenantName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>karisnegocios.com.br</div>
            </div>
          </div>
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
            padding-top: 92px !important;
            box-shadow: 26px 0 68px rgba(9, 9, 11, 0.18) !important;
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
