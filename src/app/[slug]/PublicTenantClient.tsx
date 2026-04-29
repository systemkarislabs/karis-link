'use client';

import React, { useActionState, useEffect } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
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
  tenantLogo?: string | null;
  hasTrackingContext: boolean;
  sellers: SellerCard[];
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
        background: 'var(--brand-navy)',
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

export default function PublicTenantClient({
  slug,
  tenantName,
  tenantLogo,
  hasTrackingContext,
  sellers,
  isAdminLogged,
}: Props) {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [state, formAction] = useActionState<LoginState, FormData>(handleTenantLogin, null);

  useEffect(() => {
    if (!isLoginOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsLoginOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginOpen]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    fontSize: 14,
    outline: 'none',
    background: 'var(--surface-muted)',
    color: 'var(--text-main)',
  };

  return (
    <div
      className="public-shell"
      style={{
        minHeight: '100dvh',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-body)',
        padding: 'max(16px, env(safe-area-inset-top)) 18px 56px',
      }}
    >
      {/* Acesso administrativo discreto */}
      <header className="premium-public-header" style={{ position: 'relative', minHeight: 92 }}>
        {/* Botão de acesso admin — canto superior direito do header */}
        <div style={{ position: 'absolute', top: 16, right: 24 }}>
          {isAdminLogged ? (
            <a
              href={`/${slug}/admin`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Icon name="lock" size={13} color="currentColor" />
              Ir ao painel
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Icon name="lock" size={13} color="currentColor" />
              Acesso da empresa
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo principal */}
      <div
        className="kl-page-enter"
        style={{
          width: '100%',
          maxWidth: '424px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Identidade da empresa */}
        <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 0 }}>
          {tenantLogo ? (
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '999px',
                border: '3px solid #fff',
                background: '#ffffff',
                boxShadow: '0 4px 20px rgba(15,28,63,0.14)',
                overflow: 'hidden',
                display: 'inline-grid',
                placeItems: 'center',
                marginBottom: 14,
              }}
            >
              <img
                src={tenantLogo}
                alt={`Logo ${tenantName}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              className="kl-mini-avatar"
              style={{ width: 72, height: 72, fontSize: 28, display: 'inline-grid', marginBottom: 14 }}
            >
              {tenantName.charAt(0).toUpperCase()}
            </div>
          )}

          <h1
            style={{
              margin: '0 0 6px',
              color: 'var(--text-main)',
              fontSize: 22,
              fontWeight: 850,
              letterSpacing: '-0.04em',
            }}
          >
            {tenantName}
          </h1>

          <p
            style={{
              color: 'var(--text-soft)',
              maxWidth: 300,
              margin: '0 auto',
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            Conecte seus leads ao especialista certo com a experiência Karis Link.
          </p>
        </div>

        {/* Lista de vendedores */}
        <div className="kl-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          {sellers.map((seller) => (
            <a
              key={seller.id}
              href={`/api/redirect/${seller.id}${hasTrackingContext ? '?tracked=1' : ''}`}
              className="seller-public-card kl-card kl-card-hover kl-press"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '14px 17px',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                borderRadius: 16,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(55,50,47,.055), 0 8px 24px rgba(15,28,63,.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '999px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--brand-accent-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-accent-strong)',
                    fontWeight: 800,
                    fontSize: 14,
                    border: '1px solid rgba(22,163,74,0.18)',
                  }}
                >
                  {seller.image ? (
                    <img
                      src={seller.image}
                      alt={seller.name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(seller.name)
                  )}
                </div>

                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {seller.name}
                </span>
              </div>

              <div
                className="seller-whatsapp-bubble"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--brand-accent-soft)',
                  color: 'var(--brand-accent)',
                  border: '1px solid rgba(22,163,74,0.18)',
                  flexShrink: 0,
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
              >
                <Icon name="whatsapp" size={18} color="currentColor" />
              </div>
            </a>
          ))}

          {sellers.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '26px 20px',
                color: 'var(--text-soft)',
                fontSize: 14,
                background: 'var(--card-bg)',
                borderRadius: 14,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              Nenhum especialista disponível no momento.
            </div>
          )}
        </div>

        {/* Rodapé de marca */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: 0.42,
          }}
        >
          <Image
            src="/karis-link-logo.png"
            alt="Karis Link"
            width={72}
            height={26}
            style={{ width: 64, height: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-soft)' }}>
            Powered by Karis Link
          </span>
        </div>
      </div>

      {/* Modal de login */}
      {isLoginOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.42)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 40,
          }}
          onClick={() => setIsLoginOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tenant-login-title"
        >
          <div
            className="kl-surface kl-page-enter"
            style={{
              width: '100%',
              maxWidth: 380,
              background: 'var(--card-bg)',
              borderRadius: 20,
              padding: 26,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'var(--brand-accent-soft)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="lock" size={16} color="var(--brand-accent-strong)" />
                  </span>
                  <div id="tenant-login-title" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                    Entrar no painel
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.45 }}>
                  Acesse a administração da empresa sem sair da página pública.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                aria-label="Fechar"
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
                  border: '1px solid #fecdd3',
                }}
              >
                {state.error}
              </div>
            ) : null}

            <form action={formAction} style={{ display: 'grid', gap: 12 }}>
              <input type="hidden" name="slug" value={slug} />
              <input name="username" placeholder="Usuário" required style={inputStyle} />
              <input
                name="password"
                type="password"
                placeholder="Senha"
                required
                style={inputStyle}
              />
              <SubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
