'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  inputName?: string;
  label?: string;
  helperText?: string;
};

const PREVIEW_SIZE = 220;
const EXPORT_SIZE = 480;

export default function SellerImageField({
  inputName = 'imageDataUrl',
  label = 'Foto (Opcional)',
  helperText = 'Ajuste o enquadramento antes de salvar.',
}: Props) {
  const [source, setSource] = useState('');
  const [preview, setPreview] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!source) {
      setPreview('');
      return;
    }

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) return;

      const canvas = document.createElement('canvas');
      canvas.width = EXPORT_SIZE;
      canvas.height = EXPORT_SIZE;
      const context = canvas.getContext('2d');
      if (!context) return;

      const baseScale = Math.max(EXPORT_SIZE / image.width, EXPORT_SIZE / image.height);
      const scale = baseScale * zoom;
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const x = (EXPORT_SIZE - drawWidth) / 2 + offsetX;
      const y = (EXPORT_SIZE - drawHeight) / 2 + offsetY;

      context.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      context.drawImage(image, x, y, drawWidth, drawHeight);

      setPreview(canvas.toDataURL('image/jpeg', 0.92));
    };
    image.src = source;

    return () => {
      active = false;
    };
  }, [offsetX, offsetY, source, zoom]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use uma imagem JPG, PNG ou WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2 MB.');
      event.target.value = '';
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const result = typeof fileReader.result === 'string' ? fileReader.result : '';
      setError('');
      setSource(result);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    fileReader.readAsDataURL(file);
  }

  function clearImageSelection() {
    setError('');
    setSource('');
    setPreview('');
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  return (
    <div className="seller-image-field" style={{ display: 'grid', gap: 12 }}>
      <input type="hidden" name={inputName} value={preview} />

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{label}</div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ width: '100%', maxWidth: '100%', fontSize: 13, color: 'var(--sidebar-text)' }}
      />
      {error ? <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</div> : null}

      {source ? (
        <div
          style={{
            display: 'grid',
            gap: 16,
            padding: 16,
            borderRadius: 16,
            border: '1px solid var(--border)',
            background: 'var(--bg-main)',
          }}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <div
              style={{
                width: '100%',
                maxWidth: PREVIEW_SIZE,
                aspectRatio: '1 / 1',
                margin: '0 auto',
                borderRadius: 18,
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid var(--border)',
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview recortado" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
            </div>

            <div style={{ fontSize: 12, color: 'var(--sidebar-text)', textAlign: 'center' }}>{helperText}</div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: 'var(--sidebar-text)' }}>
              Zoom
              <input type="range" min="1" max="2.6" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            </label>

            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: 'var(--sidebar-text)' }}>
              Ajuste horizontal
              <input type="range" min="-180" max="180" step="1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} />
            </label>

            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: 'var(--sidebar-text)' }}>
              Ajuste vertical
              <input type="range" min="-180" max="180" step="1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} />
            </label>

            <button
              type="button"
              onClick={clearImageSelection}
              style={{
                justifySelf: 'start',
                marginTop: 4,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: '#fff',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Remover seleção
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
