'use client';

import React, { useId, useState } from 'react';

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
  const inputId = useId();
  const activePreview = preview || currentLogo || '';

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use JPG, PNG ou WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError('');
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
            height: compact ? 54 : 74,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 14,
            border: '1px solid var(--border)',
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <img
            src={activePreview}
            alt="Logo da empresa"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
          />
        </div>
      ) : null}

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        style={{ width: '100%', fontSize: 12, color: '#71717a' }}
      />
      {error ? <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 700 }}>{error}</div> : null}
    </div>
  );
}
