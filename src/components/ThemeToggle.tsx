'use client';

import { useEffect, useSyncExternalStore } from 'react';

function subscribeToThemeChange(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('kl-theme-change', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('kl-theme-change', callback);
  };
}

function getThemeSnapshot() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('theme') === 'dark';
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeToThemeChange, getThemeSnapshot, getServerSnapshot);

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [dark]);

  function toggle() {
    const nextTheme = dark ? 'light' : 'dark';

    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new Event('kl-theme-change'));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-pressed={dark}
      style={{
        position: 'relative',
        width: 50,
        height: 26,
        background: dark ? '#17DB4E' : '#e2e8f0',
        borderRadius: 13,
        cursor: 'pointer',
        transition: '0.3s',
        border: 'none',
        padding: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 3,
          left: dark ? 27 : 3,
          width: 20,
          height: 20,
          background: '#fff',
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: '0.3s',
        }}
      />
    </button>
  );
}
