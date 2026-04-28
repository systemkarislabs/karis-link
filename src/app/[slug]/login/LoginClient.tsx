'use client';
import React, { useActionState } from 'react';
import Image from 'next/image';
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
      className="tenant-login-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1fr)',
        background: '#fff',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <aside
        className="auth-brand-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
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
          style={{ width: 184, height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
        <div style={{ textAlign: 'center', maxWidth: 330 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Painel da empresa
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,.58)', lineHeight: 1.65 }}>
            Acompanhe vendedores, campanhas e conversoes rastreaveis.
          </p>
        </div>
        <Image
          src="/karis-negocios-logo.png"
          alt="Karis Negocios"
          width={180}
          height={76}
          style={{ marginTop: 'auto', width: 124, height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.46 }}
        />
      </aside>

      <div style={{ display: 'grid', placeItems: 'center', padding: 24, background: '#fafafa' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 380,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'var(--brand-navy)',
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

      <style jsx>{`
        @media (max-width: 820px) {
          .tenant-login-shell {
            grid-template-columns: 1fr !important;
          }

          .auth-brand-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
