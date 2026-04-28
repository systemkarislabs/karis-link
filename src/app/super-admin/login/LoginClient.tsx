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
      style={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1fr)',
        fontFamily: 'var(--font-body)',
        background: '#fff',
      }}
    >
      <aside
        className="auth-brand-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: 48,
          background: 'var(--brand-navy)',
          color: '#fff',
        }}
      >
        <Image
          src="/karis-link-logo-full.png"
          alt="Karis Link"
          width={240}
          height={92}
          priority
          style={{ width: 190, height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Gerencie seus leads com inteligencia
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,.58)', lineHeight: 1.65 }}>
            Controle empresas, campanhas e metricas em uma plataforma Karis Link.
          </p>
        </div>
        <Image
          src="/karis-negocios-logo.png"
          alt="Karis Negocios"
          width={180}
          height={76}
          style={{ marginTop: 'auto', width: 126, height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.46 }}
        />
      </aside>

      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#fafafa',
        }}
      >
      <section
        className="kl-page-enter"
        style={{
          width: '100%',
          maxWidth: 380,
          borderRadius: 10,
          background: 'transparent',
          padding: 0,
          border: 0,
          boxShadow: 'none',
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
            Super Admin
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

      </section>
      </div>

      <style jsx>{`
        @media (max-width: 820px) {
          main {
            grid-template-columns: 1fr !important;
          }

          .auth-brand-panel {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
