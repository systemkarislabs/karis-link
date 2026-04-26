'use client';

import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        // Click no backdrop fecha (Esc também).
        if (event.target === dialogRef.current) {
          onCancel();
        }
      }}
      style={{
        padding: 0,
        border: 'none',
        borderRadius: 18,
        background: 'var(--card-bg)',
        color: 'var(--text-main)',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 32px 80px rgba(15, 23, 42, 0.28)',
      }}
    >
      <div style={{ padding: '24px 24px 8px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: destructive ? 'rgba(225, 29, 72, 0.10)' : 'rgba(23, 219, 78, 0.12)',
            color: destructive ? '#e11d48' : '#16a34a',
            flexShrink: 0,
          }}
        >
          <Icon
            name={destructive ? 'trash' : 'info'}
            size={20}
            color={destructive ? '#e11d48' : '#16a34a'}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-main)' }}>
            {title}
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '20px 24px 24px',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 40,
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: destructive ? '#e11d48' : '#17DB4E',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 40,
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
