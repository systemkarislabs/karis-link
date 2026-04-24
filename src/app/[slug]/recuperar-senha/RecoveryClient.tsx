'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleTenantPasswordRecovery } from '../admin/auth-actions';

type State = { error?: string } | null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: 12,
        border: 'none',
        background: '#17DB4E',
        color: '#fff',
        fontWeight: 700,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.72 : 1,
      }}
    >
      {pending ? 'Atualizando...' : 'Atualizar senha'}
    </button>
  );
}

export default function RecoveryClient({ slug }: { slug: string }) {
  const [state, formAction] = useActionState<State, FormData>(
    handleTenantPasswordRecovery,
    null,
  );
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #dbe3ee',
    fontSize: 14,
    outline: 'none',
    background: '#f8fafc',
    color: '#172033',
  };

  return (
    <form action={formAction} style={{ display: 'grid', gap: 12 }}>
      <input type="hidden" name="slug" value={slug} />
      <input
        name="recoveryEmail"
        type="email"
        placeholder="E-mail de recuperação"
        required
        style={inputStyle}
      />
      <input
        name="newPassword"
        type="password"
        placeholder="Nova senha"
        required
        style={inputStyle}
      />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirmar nova senha"
        required
        style={inputStyle}
      />
      {state?.error ? (
        <div
          style={{
            background: '#fff1f2',
            color: '#be123c',
            padding: '10px 12px',
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          {state.error}
        </div>
      ) : null}
      <SubmitButton />
    </form>
  );
}
