'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const inputId = useId();
  const fieldRef = useRef<HTMLDivElement>(null);
  const activePreview = preview || currentLogo || '';

  useEffect(() => {
    const form = fieldRef.current?.closest('form');
    if (!form) return;

    function handleSubmit(event: SubmitEvent) {
      if (isProcessing) {
        event.preventDefault();
        event.stopPropagation();
        setError('Aguarde a logo terminar de processar antes de salvar.');
      }
    }

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, [isProcessing]);

  function resizeLogo(dataUrl: string) {
    return new Promise<string>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const size = 640;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Nao foi possivel processar a imagem.'));
          return;
        }

        const scale = Math.min(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        const x = (size - width) / 2;
        const y = (size - height) / 2;

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, size, size);
        context.drawImage(image, x, y, width, height);

        const webp = canvas.toDataURL('image/webp', 0.9);
        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.9));
      };
      image.onerror = () => reject(new Error('Nao foi possivel processar essa logo. Tente outro arquivo.'));
      image.src = dataUrl;
    });
  }

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
    setIsProcessing(true);
    setPreview('');
    reader.onload = async () => {
      try {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const resizedLogo = await resizeLogo(result);
        setError('');
        setFileName(file.name);
        setPreview(resizedLogo);
      } catch (resizeError) {
        setError(resizeError instanceof Error ? resizeError.message : 'Nao foi possivel processar essa logo.');
        setFileName('');
        setPreview('');
        event.target.value = '';
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setFileName('');
      setPreview('');
      setError('Nao foi possivel ler esse arquivo. Tente outra imagem.');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div ref={fieldRef} style={{ display: 'grid', gap: compact ? 8 : 10 }}>
      <input type="hidden" name={inputName} value={activePreview} />
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
          {isProcessing ? 'Processando...' : fileName || (activePreview ? 'Logo atual' : 'PNG, JPG ou WEBP')}
        </span>
      </label>
      {error ? <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 700 }}>{error}</div> : null}
    </div>
  );
}
