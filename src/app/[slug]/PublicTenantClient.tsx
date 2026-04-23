'use client';

import React, { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleTenantLogin } from './admin/auth-actions';

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

function WhatsAppIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.56 0 .28 5.28.28 11.79c0 2.08.54 4.11 1.57 5.91L0 24l6.48-1.7a11.8 11.8 0 0 0 5.59 1.42h.01c6.5 0 11.79-5.28 11.79-11.79 0-3.15-1.23-6.1-3.35-8.45Z"
        fill={color}
      />
      <path
        d="M17.03 13.93c-.27-.14-1.6-.79-1.85-.88-.25-.09-.44-.14-.62.14-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.15-1.35-.8-.71-1.33-1.58-1.49-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.46.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.47-.62-.48h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.11 2.84c.14.18 1.92 2.94 4.66 4.12.65.28 1.16.44 1.56.56.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.27.23-.61.23-1.13.16-1.24-.06-.11-.25-.18-.52-.32Z"
        fill={color === '#ffffff' ? '#050816' : '#ffffff'}
      />
    </svg>
  );
}

function LockIcon({ color = '#64748b' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="3"
        stroke={color}
        strokeWidth="1.8"
      />
      <circle cx="12" cy="15" r="1.4" fill={color} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18" stroke="#64748b" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M6 6L18 18" stroke="#64748b" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
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
        background: '#0f172a',
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
        color: '#0f172a',
        fontFamily: "'Inter', sans-serif",
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
              background: 'rgba(15, 23, 42, 0.08)',
              color: '#0f172a',
              border: '1px solid rgba(203, 213, 225, 0.95)',
              boxShadow: '0 6px 14px rgba(148, 163, 184, 0.08)',
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
                background: 'rgba(15, 23, 42, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon color="#0f172a" />
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
              color: '#64748b',
              border: '1px solid rgba(219, 227, 238, 0.9)',
              boxShadow: '0 6px 14px rgba(148, 163, 184, 0.08)',
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
              <LockIcon />
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
            width: 88,
            height: 88,
            borderRadius: '999px',
            background: '#050816',
            border: '2px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 32,
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.16)',
            marginBottom: 22,
          }}
        >
          {tenantName.charAt(0).toUpperCase()}
        </div>

        <header style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1
            style={{
              fontSize: 24,
              lineHeight: 1.15,
              fontWeight: 800,
              color: '#172033',
              margin: '0 0 10px',
            }}
          >
            Fale com um Especialista
          </h1>
          <p
            style={{
              color: '#64748b',
              maxWidth: 360,
              margin: '0 auto',
              fontSize: 15,
              lineHeight: 1.35,
            }}
          >
            Escolha um consultor disponivel e inicie sua conversa agora mesmo.
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
                background: '#ffffff',
                color: '#172033',
                borderRadius: 14,
                textDecoration: 'none',
                border: '1px solid #dbe3ee',
                boxShadow: '0 10px 24px rgba(148, 163, 184, 0.14)',
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
                  background: 'rgba(34,197,94,0.08)',
                  flexShrink: 0,
                }}
              >
                <WhatsAppIcon color="#22c55e" />
              </div>
            </a>
          ))}
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
                <div style={{ fontSize: 18, fontWeight: 800, color: '#172033', marginBottom: 4 }}>Entrar no painel</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Acesse a administracao da empresa sem sair da pagina publica.</div>
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
                <CloseIcon />
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
