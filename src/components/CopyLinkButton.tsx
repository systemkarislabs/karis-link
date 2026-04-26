'use client';

import React, { useState } from 'react';
import { Icon } from './Icon';

type Props = {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
};

export default function CopyLinkButton({
  value,
  label = 'Copiar link',
  copiedLabel = 'Copiado!',
  variant = 'ghost',
  fullWidth = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback para browsers sem Clipboard API.
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(true);
      setCopied(false);
      window.setTimeout(() => setError(false), 2400);
    }
  }

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: 40,
    width: fullWidth ? '100%' : undefined,
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: copied ? '#16a34a' : 'var(--brand-dark, #020515)',
          color: '#fff',
          border: 'none',
        }
      : {
          background: copied ? 'rgba(34,197,94,0.12)' : 'var(--bg-main)',
          color: copied ? '#16a34a' : 'var(--text-main)',
          border: `1px solid ${copied ? '#bbf7d0' : 'var(--border)'}`,
        };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      style={{ ...baseStyle, ...variantStyle }}
    >
      <Icon
        name={copied ? 'check' : 'link'}
        size={14}
        color={variant === 'primary' ? '#fff' : copied ? '#16a34a' : 'var(--text-main)'}
      />
      {error ? 'Falha ao copiar' : copied ? copiedLabel : label}
    </button>
  );
}
