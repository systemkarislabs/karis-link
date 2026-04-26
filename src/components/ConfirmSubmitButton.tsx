'use client';

import React, { useState, useRef } from 'react';
import ConfirmDialog from './ConfirmDialog';

type Props = {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  ariaLabel?: string;
};

/**
 * Botão de submit que abre um ConfirmDialog estilizado antes de submeter.
 * Substitui o antigo window.confirm para manter consistência visual e
 * suporte a tema dark.
 */
export default function ConfirmSubmitButton({
  message,
  title = 'Confirmar ação',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = true,
  children,
  style,
  className,
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOpen(true);
  }

  function handleConfirm() {
    setOpen(false);
    // Submete o form pai programaticamente.
    buttonRef.current?.form?.requestSubmit();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="submit"
        aria-label={ariaLabel}
        className={className}
        style={style}
        onClick={handleClick}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        destructive={destructive}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
