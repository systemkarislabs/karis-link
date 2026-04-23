'use client';

import React, { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleTenantLogin } from './admin/auth-actions';
import { Icon } from '@/components/Icon';

type SellerCard = {
  id: string;
  name: string;
  image: string | null;
};

type Props = {
  slug: string;
  tenantName: string;
  sellers: SellerCard[];
  source: string;
  campaign: string;
  isAdminLogged: boolean;
};

type LoginState = { error?: string } | null;

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%',
        marginTop: 4,
        padding: '12px 16px',
        borderRadius: 12,
        background: 'var(--brand-dark)',
        color: '#fff',
        border: 'none',
        fontWeight: 700,
        fontSize: 14,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.72 : 1,
      }}
    >
      {pending ? 'Entrando...' : 'Entrar no painel'}
    </button>
  );
}

export default function PublicTenantClient({ slug, tenantName, sellers, source, campaign, isAdminLogged }: Props) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [state, formAction] = useFormState<LoginState, FormData>(handleTenantLogin as never, null);
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
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(255,255,255,0.98) 0%, rgba(247,249,252,1) 38%, rgba(242,245,249,1) 100%)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-body)',
        padding: '36px 20px 72px',
      }}
    >
      <title>{`${tenantName} - Especialistas`}</title>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto 10px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        {isAdminLogged ? (
          <a
            href={`/${slug}/admin`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 11px',
              borderRadius: '999px',
              textDecoration: 'none',
              background: 'rgba(2, 5, 21, 0.08)',
              color: 'var(--brand-dark)',
              border: '1px solid rgba(203, 213, 225, 0.95)',
              boxShadow: 'var(--shadow-soft)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.01em',
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '999px',
                background: 'rgba(2, 5, 21, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="lock" size={13} color="var(--brand-dark)" />
            </span>
            Ir para o painel
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 11px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.55)',
              color: 'var(--text-soft)',
              border: '1px solid rgba(219, 227, 238, 0.9)',
              boxShadow: 'var(--shadow-soft)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.01em',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '999px',
                background: 'rgba(226, 232, 240, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="lock" size={13} color="var(--text-soft)" />
            </span>
            Acesso da empresa
          </button>
        )}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 124,
            minHeight: 124,
            borderRadius: 28,
            background: '#fff',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-soft)',
            marginBottom: 22,
            padding: 18,
          }}
        >
          <img src="/karis-link-logo.png" alt="Karis Link" style={{ width: '100%', maxWidth: 84, objectFit: 'contain' }} />
        </div>

        <header style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1
            style={{
              fontSize: 24,
              lineHeight: 1.15,
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '0 0 10px',
            }}
          >
            {tenantName}
          </h1>
          <p
            style={{
              color: 'var(--text-soft)',
              maxWidth: 360,
              margin: '0 auto',
              fontSize: 15,
              lineHeight: 1.35,
            }}
          >
            Conecte seus leads ao especialista certo com a experiencia Karis Link.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          {sellers.map((seller) => (
            <a
              key={seller.id}
              href={`/api/redirect?sellerId=${seller.id}&source=${source}&campaign=${campaign}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 18,
                padding: '14px 18px',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                borderRadius: 14,
                textDecoration: 'none',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-soft)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '999px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {seller.image ? (
                    <img
                      src={seller.image}
                      alt={seller.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(seller.name)
                  )}
                </div>

                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {seller.name}
                </span>
              </div>

              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(23, 219, 78, 0.08)',
                  flexShrink: 0,
                }}
              >
                <Icon name="whatsapp" size={18} color="var(--brand-accent)" />
              </div>
            </a>
          ))}
        </div>

        <div
          style={{
            marginTop: 26,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-soft)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span>Powered by</span>
          <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ height: 16, objectFit: 'contain' }} />
        </div>
      </div>

      {isLoginOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.36)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 40,
          }}
          onClick={() => setIsLoginOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 380,
              background: '#ffffff',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.2)',
              border: '1px solid rgba(226, 232, 240, 0.95)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <img src="/karis-link-logo.png" alt="Karis Link" style={{ width: 34, objectFit: 'contain' }} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>Entrar no painel</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>Acesse a administracao da empresa sem sair da pagina publica.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '999px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Icon name="x" size={16} color="var(--text-soft)" />
              </button>
            </div>

            {state?.error ? (
              <div
                style={{
                  background: '#fff1f2',
                  color: '#be123c',
                  padding: '10px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 14,
                }}
              >
                {state.error}
              </div>
            ) : null}

            <form action={formAction} style={{ display: 'grid', gap: 12 }}>
              <input type="hidden" name="slug" value={slug} />
              <input name="username" placeholder="Usuario" required style={inputStyle} />
              <input name="password" type="password" placeholder="Senha" required style={inputStyle} />
              <SubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
