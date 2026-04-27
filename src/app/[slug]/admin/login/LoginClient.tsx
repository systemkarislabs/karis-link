'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { handleTenantLogin } from '../auth-actions';

type LoginState = { error?: string } | null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        marginTop: 8,
        padding: '12px',
        borderRadius: 8,
        background: '#17DB4E',
        color: '#fff',
        border: 'none',
        fontWeight: 700,
        fontSize: 15,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  );
}

export default function LoginClient({ slug }: { slug: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(handleTenantLogin, null);
  const inputStyle: React.CSSProperties = {
    padding: '11px 14px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    outline: 'none',
    background: '#ffffff',
    color: '#0f172a',
    WebkitTextFillColor: '#0f172a',
    caretColor: '#0f172a',
    boxShadow: '0 0 0 1000px #ffffff inset',
    appearance: 'none',
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8', fontFamily: 'Poppins, sans-serif', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#17DB4E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700, marginBottom: 12 }}>K</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Painel Admin</h1>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>/{slug}</p>
        </div>

        {state?.error ? (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {state.error}
          </div>
        ) : null}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="hidden" name="slug" value={slug} />
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Usuario
            <input name="username" placeholder="Usuario" required autoComplete="username" style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Senha
            <input name="password" type="password" placeholder="Senha" required autoComplete="current-password" style={inputStyle} />
          </label>
          <SubmitButton />
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href={`/${slug}`} style={{ color: '#9ca3af', fontSize: 12, textDecoration: 'none' }}>
            Voltar para a pagina publica
          </Link>
        </div>
      </div>
    </div>
  );
}
