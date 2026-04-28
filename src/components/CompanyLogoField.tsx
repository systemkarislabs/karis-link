'use client';

import React, { useId, useState } from 'react';
import { Icon } from './Icon';

type Props = {
  inputName?: string;
  currentLogo?: string | null;
  label?: string;
  compact?: boolean;
};

export default function CompanyLogoField({
  inputName = 'logoDataUrl',
  currentLogo,
  label = 'Logo da empresa (opcional)',
  compact = false,
}: Props) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputId = useId();
  const activePreview = preview || currentLogo || '';

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use JPG, PNG ou WEBP.');
      setFileName('');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2 MB.');
      setFileName('');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError('');
      setFileName(file.name);
      setPreview(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: 'grid', gap: compact ? 8 : 10 }}>
      <input type="hidden" name={inputName} value={preview} />
      <label htmlFor={inputId} style={{ fontSize: 12, fontWeight: 800, color: '#18181b' }}>
        {label}
      </label>

      {activePreview ? (
        <div
          style={{
            width: compact ? 96 : 132,
            height: compact ? 96 : 132,
            display: 'grid',
            placeItems: 'center',
          borderRadius: '50%',
            border: '1px solid var(--border)',
            background: '#ffffff',
            overflow: 'hidden',
          boxShadow: '0 10px 24px rgba(15, 28, 63, 0.08)',
          }}
        >
          <img
            src={activePreview}
            alt="Logo da empresa"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : null}

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <label
        htmlFor={inputId}
        className="kl-press"
        style={{
          minHeight: compact ? 38 : 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: compact ? '9px 11px' : '10px 13px',
          borderRadius: 10,
          border: '2px dashed var(--border)',
          background: 'var(--bg-main)',
          color: '#52525b',
          fontSize: 12,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: 'none',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span
            style={{
              width: 24,
              height: 24,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
              background: 'rgba(16,185,129,.1)',
              color: 'var(--brand-accent-strong)',
              flexShrink: 0,
            }}
          >
            <Icon name="photo" size={14} />
          </span>
          <span style={{ whiteSpace: 'nowrap' }}>Escolher logo</span>
        </span>
        <span
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#a1a1aa',
            fontWeight: 700,
          }}
        >
          {fileName || (activePreview ? 'Logo atual' : 'PNG, JPG ou WEBP')}
        </span>
      </label>
      {error ? <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 700 }}>{error}</div> : null}
    </div>
  );
}
