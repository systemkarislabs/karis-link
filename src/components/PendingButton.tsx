'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  style?: React.CSSProperties;
  className?: string;
  type?: 'submit' | 'button';
  ariaLabel?: string;
};

/**
 * Botão de submit que mostra estado pending automaticamente
 * usando useFormStatus. Funciona dentro de <form action={serverAction}>.
 */
export default function PendingButton({
  children,
  pendingLabel,
  style,
  className,
  type = 'submit',
  ariaLabel,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type={type}
      disabled={pending}
      aria-label={ariaLabel}
      aria-busy={pending}
      className={className}
      style={{
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.72 : 1,
        ...style,
      }}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
