'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Icon } from '@/components/Icon';
import { handleSuperLogin } from '../actions';

type S = { error?: string } | null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="kl-green-button" style={{ width: '100%', marginTop: 8 }}>
      {pending ? 'Autenticando...' : 'Entrar no Sistema'}
    </button>
  );
}

export default function SuperLoginClient() {
  const [state, formAction] = useActionState<S, FormData>(handleSuperLogin, null);

  return (
    <main
      className="kl-login-grid-bg"
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        fontFamily: 'var(--font-body)',
      }}
    >
      <section
        className="kl-page-enter"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 28,
          background: '#ffffff',
          padding: '40px 40px 36px',
          border: '1px solid rgba(228, 228, 231, 0.84)',
          boxShadow: '0 22px 70px rgba(9, 9, 11, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div className="kl-brand-mark" style={{ width: 52, height: 52, borderRadius: 14, fontSize: 25, margin: '0 auto 20px' }}>
            K
          </div>
          <h1 style={{ margin: 0, color: '#050505', fontSize: 21, fontWeight: 900, letterSpacing: '-0.07em', textTransform: 'uppercase' }}>
            Acesso Administrativo
          </h1>
          <p style={{ margin: '6px 0 0', color: '#71717a', fontSize: 13 }}>
            Entre com suas credenciais de super-admin.
          </p>
        </div>

        {state?.error ? (
          <div
            style={{
              background: '#fff1f2',
              color: '#e11d48',
              padding: '12px 14px',
              borderRadius: 12,
              marginBottom: 18,
              fontSize: 13,
              fontWeight: 700,
              border: '1px solid #fecdd3',
            }}
          >
            {state.error}
          </div>
        ) : null}

        <form action={formAction} style={{ display: 'grid', gap: 18 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#a1a1aa', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Usuário
            </span>
            <span style={{ position: 'relative', display: 'block' }}>
              <Icon name="user" size={16} color="#a1a1aa" style={{ position: 'absolute', left: 15, top: 14 }} />
              <input name="username" placeholder="Digite seu usuário" required className="kl-soft-field" style={{ paddingLeft: 44 }} />
            </span>
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#a1a1aa', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Senha
            </span>
            <span style={{ position: 'relative', display: 'block' }}>
              <Icon name="lock" size={16} color="#a1a1aa" style={{ position: 'absolute', left: 15, top: 14 }} />
              <input name="password" type="password" placeholder="••••••••" required className="kl-soft-field" style={{ paddingLeft: 44 }} />
            </span>
          </label>

          <SubmitButton />
        </form>

        <p
          style={{
            margin: '32px 0 0',
            color: '#a1a1aa',
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.11em',
            textTransform: 'uppercase',
          }}
        >
          Karis Labs © 2026 · Todos os direitos reservados
        </p>
      </section>
    </main>
  );
}
