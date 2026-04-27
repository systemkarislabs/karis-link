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
          borderRadius: 28,
          background: '#ffffff',
          padding: '40px 40px 36px',
          border: '1px solid rgba(228, 228, 231, 0.84)',
          boxShadow: '0 22px 70px rgba(9, 9, 11, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <Image
            src="/karis-link-logo.png"
            alt="Karis Link"
            width={156}
            height={56}
            priority
            style={{ width: 156, maxWidth: '72%', height: 'auto', objectFit: 'contain', marginBottom: 22 }}
          />
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
              <span className="kl-field-icon"><Icon name="user" size={16} color="#a1a1aa" /></span>
              <input name="username" placeholder="Digite seu usuário" required className="kl-soft-field" style={{ paddingLeft: 46 }} />
            </span>
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#a1a1aa', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Senha
            </span>
            <span style={{ position: 'relative', display: 'block' }}>
              <span className="kl-field-icon"><Icon name="lock" size={16} color="#a1a1aa" /></span>
              <input name="password" type="password" placeholder="••••••••" required className="kl-soft-field" style={{ paddingLeft: 46 }} />
            </span>
          </label>

          <SubmitButton />
        </form>

        <div style={{ margin: '32px 0 0', display: 'flex', justifyContent: 'center' }}>
          <Image
            src="/karis-labs-logo.png"
            alt="Karis Labs"
            width={128}
            height={62}
            style={{ width: 128, height: 'auto', objectFit: 'contain', opacity: 0.86 }}
          />
        </div>
      </section>
    </main>
  );
}
