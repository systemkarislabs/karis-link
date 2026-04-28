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
          background: 'var(--brand-navy)',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          zIndex: 99,
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between',
        } as CSSProperties}
      >
        <Image
          src="/karis-link-logo-full.png"
          alt="Karis Link"
          width={132}
          height={46}
          priority
          style={{ width: 112, height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="kl-press"
          style={{
            width: 44,
            height: 44,
            padding: 10,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,.12)',
            background: 'rgba(255,255,255,.08)',
            cursor: 'pointer',
          }}
          aria-label="Abrir menu"
          aria-expanded={isOpen}
        >
          <Icon name="menu" size={22} color="#fff" />
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
          left: 240,
          right: 0,
          height: 64,
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--border)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <label className="kl-topbar-search" aria-label="Pesquisar">
          <Icon name="search" size={14} />
          <input placeholder="Pesquisar..." />
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-soft)', fontSize: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-accent)', flexShrink: 0 }} />
            Ao vivo
          </div>
        </div>
      </div>

      <aside
        className={`sidebar-container ${isOpen ? 'open' : ''}`}
        style={{
          width: 240,
          background: 'var(--brand-navy)',
          borderRight: '1px solid rgba(255,255,255,.06)',
          padding: '20px 12px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100dvh',
          boxSizing: 'border-box',
          zIndex: 101,
          transition: 'transform 0.24s ease',
        } as CSSProperties}
      >
        <div style={{ marginBottom: 12, padding: '0 8px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <Image
            src="/karis-link-logo-full.png"
            alt="Karis Link"
            width={180}
            height={64}
            priority
            className="kl-brand-logo"
            style={{ width: 150, height: 'auto', objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {!isSuper ? (
          <div style={{ padding: '0 8px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>
              Empresa
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.82)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tenantName}
            </div>
          </div>
        ) : null}

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
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: '-0.02em',
                  color: isActive ? '#4ade80' : 'rgba(255,255,255,.56)',
                  background: isActive ? 'rgba(22,163,74,.2)' : 'transparent',
                  border: '1px solid transparent',
                  boxShadow: 'none',
                }}
              >
                <Icon name={item.icon} size={18} color="currentColor" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: 'rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.6)',
              }}
            >
              <Icon name="user" size={16} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.86)' }}>
                {isSuper ? 'Super Admin' : tenantName}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>link.karisnegocios.com.br</div>
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
