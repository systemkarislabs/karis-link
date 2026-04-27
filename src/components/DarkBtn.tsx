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
    padding: small ? '6px 12px' : '8px 16px',
    borderRadius: 7, border: 'none', cursor: 'pointer',
    fontSize: small ? 12 : 13, fontWeight: 500, transition: 'all 0.15s', ...s
  };
  const styles: Record<DarkBtnVariant, React.CSSProperties> = {
    dark:    { background: hov ? '#1f2937' : '#111318', color: '#fff' },
    outline: { background: hov ? '#f9fafb' : '#fff', color: '#374151', border: '1px solid #e5e7eb' },
    ghost:   { background: hov ? '#f3f4f6' : 'transparent', color: '#374151', border: '1px solid transparent' },
    accent:  { background: hov ? '#16a34a' : '#22c55e', color: '#fff' },
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
