'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setDark(true);
    }
  }, []);

  const toggle = () => {
    if (dark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setDark(true);
    }
  };

  return (
    <div onClick={toggle} style={{ position: 'relative', width: 50, height: 26, background: dark ? '#17DB4E' : '#e2e8f0', borderRadius: 13, cursor: 'pointer', transition: '0.3s' }}>
      <div style={{ position: 'absolute', top: 3, left: dark ? 27 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: '0.3s' }}></div>
    </div>
  );
}
