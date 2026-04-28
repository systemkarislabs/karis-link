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
          maxWidth: 418,
          borderRadius: 22,
          background: 'rgba(255, 255, 255, 0.86)',
          backdropFilter: 'blur(10px)',
          padding: '42px 40px 36px',
          border: '1px solid rgba(55, 50, 47, 0.12)',
          boxShadow: '0 0 0 4px rgba(255,255,255,.72), 0 28px 80px rgba(55, 50, 47, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <span
            aria-hidden="true"
            style={{
              width: 54,
              height: 54,
              display: 'inline-grid',
              placeItems: 'center',
              borderRadius: 14,
              background: 'var(--brand-dark)',
              color: '#ffffff',
              fontSize: 25,
              fontWeight: 900,
              letterSpacing: '-0.08em',
              boxShadow: '0 0 0 4px rgba(55, 50, 47, 0.05), 0 18px 34px rgba(55, 50, 47, 0.18)',
              marginBottom: 22,
            }}
          >
            K
          </span>
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

        <div
          style={{
            margin: '32px 0 0',
            paddingTop: 24,
            borderTop: '1px solid rgba(55,50,47,.09)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/karis-labs-logo.png"
            alt="Karis Negocios"
            width={128}
            height={62}
            style={{ width: 76, height: 'auto', objectFit: 'contain', opacity: 0.76 }}
          />
        </div>
      </section>
    </main>
  );
}
