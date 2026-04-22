"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { handleLogout } from './auth-actions';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: 'chart', label: 'Painel do Gestor', href: '/admin' },
    { id: 'sellers',   icon: 'users', label: 'Vendedores', href: '/admin/vendedores' },
    { id: 'qrcodes',  icon: 'link',  label: 'QR Codes', href: '/admin/qrcodes' },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center">
          <img src="/karis-link-logo.png" alt="Karis Link" className="h-8 object-contain" />
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-zinc-600 bg-transparent border-none">
          <Icon name={sidebarOpen ? "x" : "menu"} size={24} />
        </button>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-56 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        {/* Logo */}
        <div className="py-4 lg:py-6 flex items-center justify-center border-b border-zinc-200 flex-shrink-0">
          <img src="/karis-link-logo.png" alt="Karis Link" className="h-12 lg:h-[100px] object-contain" />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.id} href={item.href} className="no-underline" onClick={() => setSidebarOpen(false)}>
                <div className={`
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border-none cursor-pointer text-sm font-semibold transition-colors
                  ${active ? 'bg-emerald-500/10 text-emerald-700' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'}
                `}>
                  <Icon name={item.icon} size={18} color="currentColor" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-zinc-200">
          <button onClick={() => handleLogout()} className="
            flex items-center gap-3 w-full px-3 py-2 rounded-lg border-none bg-transparent text-zinc-500 font-medium text-sm cursor-pointer transition-colors hover:bg-red-50 hover:text-red-500
          ">
            <Icon name="logout" size={16} color="currentColor" /> Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-0 bg-zinc-50 min-h-screen p-4 pt-20 lg:pt-8 lg:p-10 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
