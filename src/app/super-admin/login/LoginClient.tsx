'use client';

import React, { useActionState } from 'react';
import Image from 'next/image';
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
          borderRadius: 24,
          background: '#ffffff',
          padding: '38px 40px 34px',
          border: '1px solid rgba(230, 232, 235, 0.92)',
          boxShadow: '0 22px 70px rgba(17, 24, 39, 0.075)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/karis-link-logo.png"
            alt="Karis Link"
            width={156}
            height={56}
            priority
            style={{ width: 104, maxWidth: '64%', height: 'auto', objectFit: 'contain', marginBottom: 22 }}
          />
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: 21, fontWeight: 900, letterSpacing: '-0.055em', textTransform: 'uppercase' }}>
            Acesso Administrativo
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-soft)', fontSize: 13 }}>
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
              <span className="kl-field-icon"><Icon name="user" size={16} color="#a1a1aa" /></span>
              <input name="username" placeholder="Digite seu usuário" required className="kl-soft-field kl-field-with-icon" />
            </span>
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#a1a1aa', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Senha
            </span>
            <span style={{ position: 'relative', display: 'block' }}>
              <span className="kl-field-icon"><Icon name="lock" size={16} color="#a1a1aa" /></span>
              <input name="password" type="password" placeholder="••••••••" required className="kl-soft-field kl-field-with-icon" />
            </span>
          </label>

          <SubmitButton />
        </form>

        <div style={{ margin: '30px 0 0', display: 'flex', justifyContent: 'center' }}>
          <Image
            src="/karis-labs-logo.png"
            alt="Karis Labs"
            width={128}
            height={62}
            style={{ width: 92, height: 'auto', objectFit: 'contain', opacity: 0.82 }}
          />
        </div>
      </section>
    </main>
  );
}
