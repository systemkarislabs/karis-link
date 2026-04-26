'use client';

import React from 'react';

type Props = {
  message: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  ariaLabel?: string;
};

/**
 * Botão de submit que pede confirmação antes de enviar o formulário.
 * Usado em ações destrutivas (excluir vendedor, QR Code, empresa).
 */
export default function ConfirmSubmitButton({
  message,
  children,
  style,
  className,
  ariaLabel,
}: Props) {
  return (
    <button
      type="submit"
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
