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
        background: 'var(--brand-accent)',
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
    border: '1px solid var(--border)',
    fontSize: 14,
    outline: 'none',
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    WebkitTextFillColor: 'var(--text-main)',
    caretColor: 'var(--text-main)',
    appearance: 'none',
  };

  return (
    <div className="kl-login-grid-bg" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="kl-card" style={{ padding: 40, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="kl-icon-bubble" style={{ width: 52, height: 52, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--brand-accent)', fontWeight: 700, marginBottom: 12 }}>K</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Painel Admin</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 13, marginTop: 4 }}>/{slug}</p>
        </div>

        {state?.error ? (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {state.error}
          </div>
        ) : null}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="hidden" name="slug" value={slug} />
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
            Usuario
            <input name="username" placeholder="Usuario" required autoComplete="username" style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
            Senha
            <input name="password" type="password" placeholder="Senha" required autoComplete="current-password" style={inputStyle} />
          </label>
          <SubmitButton />
        </form>

        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <Link href={`/${slug}/recuperar-senha`} style={{ color: 'var(--brand-accent)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Esqueci minha senha
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href={`/${slug}`} style={{ color: 'var(--text-soft)', fontSize: 12, textDecoration: 'none' }}>
            Voltar para a pagina publica
          </Link>
        </div>
      </div>
    </div>
  );
}
