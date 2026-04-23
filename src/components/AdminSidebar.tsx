'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import LogoutButton from './LogoutButton';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ 
  tenantName = "Karis Labs", 
  isSuper = false, 
  slug = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = isSuper ? [
    { label: 'Empresas', href: '/super-admin', icon: 'home' },
    { label: 'Relatórios', href: '/super-admin/relatorios', icon: 'chart' },
    { label: 'Configurações', href: '/super-admin/configuracoes', icon: 'settings' },
  ] : [
    { label: 'Dashboard', href: `/${slug}/admin`, icon: 'home' },
    { label: 'Vendedores', href: `/${slug}/admin/vendedores`, icon: 'users' },
    { label: 'Campanhas', href: `/${slug}/admin/qrcodes`, icon: 'link' },
  ];

  const activeStyle = { background: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-text)', fontWeight: 600 };

  return (
    <>
      {/* Botão Mobile */}
      <div style={{ 
        display: 'none', 
        position: 'fixed', 
        top: 0, left: 0, right: 0, 
        height: 60, 
        background: 'var(--sidebar-bg)', 
        borderBottom: '1px solid var(--border)', 
        zIndex: 99, 
        alignItems: 'center', 
        padding: '0 20px',
        justifyContent: 'space-between'
      } as any} className="mobile-header">
        <img src="/karis-labs-logo.png" alt="Logo" style={{ width: 90 }} />
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <Icon name="home" size={24} color="var(--text-main)" />
        </button>
      </div>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
      )}

      <aside style={{ 
        width: 280, 
        background: 'var(--sidebar-bg)', 
        borderRight: '1px solid var(--border)', 
        padding: '32px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 101,
        transition: 'transform 0.3s ease'
      } as any} className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        
        <div style={{ marginBottom: 40, padding: '0 16px' }}>
          <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ width: '120px' }} />
          {!isSuper && <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>{tenantName}</div>}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, padding: '0 16px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Principal</div>
           
           {menuItems.map((item) => (
             <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsOpen(false)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, 
                  textDecoration: 'none', fontSize: 14, color: 'var(--sidebar-text)',
                  ...(pathname === item.href ? activeStyle : {})
                }}
             >
                <Icon name={item.icon as any} size={20} color={pathname === item.href ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)'} />
                {item.label}
             </Link>
           ))}

           <LogoutButton />
        </nav>
      </aside>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .mobile-header { display: flex !important; }
          .sidebar-container { transform: translateX(-100%); }
          .sidebar-container.open { transform: translateX(0); }
        }
        @media (min-width: 1025px) {
          .sidebar-container { transform: translateX(0) !important; }
        }
      `}</style>
    </>
  );
}
