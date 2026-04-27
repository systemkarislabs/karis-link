"use client";
import React, { useState } from 'react';
import { Icon } from './Icon';

type DarkBtnVariant = 'dark' | 'outline' | 'ghost' | 'accent' | 'danger';

type DarkBtnProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: string;
  variant?: DarkBtnVariant;
  small?: boolean;
  danger?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
};

export const DarkBtn = ({ children, onClick, icon, variant = 'dark', small, danger, style: s = {}, type = "button" }: DarkBtnProps) => {
  const [hov, setHov] = useState(false);
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: small ? '8px 13px' : '10px 18px',
    minHeight: small ? 36 : 44,
    borderRadius: 999, border: 'none', cursor: 'pointer',
    fontSize: small ? 12 : 13, fontWeight: 700,
    letterSpacing: '-0.01em',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', ...s
  };
  const styles: Record<DarkBtnVariant, React.CSSProperties> = {
    dark:    { background: hov ? '#111827' : 'var(--brand-dark)', color: '#fff' },
    outline: { background: hov ? '#f8fafc' : '#fff', color: 'var(--text-main)', border: '1px solid var(--border)' },
    ghost:   { background: hov ? 'rgba(15, 23, 42, 0.06)' : 'transparent', color: 'var(--text-main)', border: '1px solid transparent', boxShadow: 'none' },
    accent:  { background: hov ? 'var(--brand-accent-strong)' : 'var(--brand-accent)', color: '#fff' },
    danger:  { background: hov ? '#dc2626' : '#ef4444', color: '#fff' },
  };
  const chosen = danger ? styles.danger : (styles[variant] || styles.dark);
  return (
    <button type={type} onClick={onClick} style={{ ...base, ...chosen }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {icon && <Icon name={icon} size={13} color="currentColor" />}
      {children}
    </button>
  );
};
