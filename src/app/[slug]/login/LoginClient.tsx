'use client';
import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleTenantLogin } from '../admin/auth-actions';

type LoginState = { error?: string } | null;

const Btn = () => {
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
};

export default function LoginClient({ slug }: { slug: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(handleTenantLogin, null);
  const inp: React.CSSProperties = {
    padding: '11px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 14,
    outline: 'none',
    background: 'var(--bg-main)',
    color: 'var(--text-main)',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-body)',
        padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: 16,
          padding: 40,
          width: '100%',
          maxWidth: 380,
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#17DB4E',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#fff',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            K
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Painel Admin</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 13, marginTop: 4 }}>/{slug}</p>
        </div>

        {state?.error ? (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
              border: '1px solid #fecaca',
            }}
          >
            {state.error}
          </div>
        ) : null}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="hidden" name="slug" value={slug} />
          <input name="username" placeholder="Usuário" required style={inp} />
          <input name="password" type="password" placeholder="Senha" required style={inp} />
          <Btn />
        </form>

        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <a
            href={`/${slug}/recuperar-senha`}
            style={{ color: '#17DB4E', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            Esqueci minha senha
          </a>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a
            href={`/${slug}`}
            style={{ color: 'var(--text-soft)', fontSize: 12, textDecoration: 'none' }}
          >
            Voltar para a página pública
          </a>
        </div>
      </div>
    </div>
  );
}
