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

export default function PublicTenantClient({
  slug,
  tenantName,
  tenantLogo,
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
    background: 'var(--bg-main)',
    color: 'var(--text-main)',
  };

  return (
    <div
      className="public-shell"
      style={{
        minHeight: '100dvh',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-body)',
        padding: 'max(14px, env(safe-area-inset-top)) 20px 56px',
      }}
    >
      {/* Botão de acesso admin */}
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          margin: '0 auto 8px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        {isAdminLogged ? (
          <a
            href={`/${slug}/admin`}
            className="kl-action kl-action-soft kl-press"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 15px',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '999px',
                background: 'rgba(2, 5, 21, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="lock" size={14} color="var(--brand-dark)" />
            </span>
            Ir para o painel
          </a>
        ) : (
            <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="kl-action kl-action-soft kl-press"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 15px',
              color: 'var(--text-soft)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '999px',
                background: 'rgba(226, 232, 240, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="lock" size={14} color="var(--text-soft)" />
            </span>
            Acesso da empresa
          </button>
        )}
      </div>

      {/* Conteúdo principal */}
      <div
        className="kl-page-enter"
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <header style={{ textAlign: 'center', marginBottom: 30 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              width: '100%',
            }}
          >
            {tenantLogo ? (
              <span
                style={{
                  width: 92,
                  height: 92,
                  display: 'inline-grid',
                  placeItems: 'center',
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                  background: '#ffffff',
                  boxShadow: '0 18px 46px rgba(9, 9, 11, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={tenantLogo}
                  alt={`Logo ${tenantName}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </span>
            ) : (
              <Image
                src="/karis-link-logo.png"
                alt="Karis Link"
                width={168}
                height={60}
                priority
                style={{ width: 96, maxWidth: '60%', height: 'auto', objectFit: 'contain' }}
              />
            )}
          </div>

          <div
            style={{
              marginBottom: 18,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/karis-labs-logo.png"
              alt="Karis Labs"
              width={132}
              height={64}
              style={{ width: 74, maxWidth: '42%', height: 'auto', objectFit: 'contain', opacity: 0.88 }}
            />
          </div>

          <p
            style={{
              color: 'var(--text-soft)',
              maxWidth: 340,
              margin: '0 auto',
              fontSize: 14,
              lineHeight: 1.35,
            }}
          >
            Conecte seus leads ao especialista certo com a experiência Karis Link.
          </p>
        </header>

        {/* Lista de vendedores */}
        <div className="kl-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          {sellers.map((seller) => (
            <a
              key={seller.id}
              href={`/api/redirect/${seller.id}`}
              className="seller-public-card kl-card kl-card-hover kl-press"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 18,
                padding: '14px 18px',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                borderRadius: 18,
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '999px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: 13,
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
                className="seller-whatsapp-bubble"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(23, 219, 78, 0.1)',
                  color: 'var(--brand-accent)',
                  flexShrink: 0,
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
              background: '#ffffff',
              borderRadius: 24,
              padding: 28,
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
                    marginBottom: 10,
                  }}
                >
                  <Image
                    src="/karis-link-logo.png"
                    alt="Karis Link"
                    width={34}
                    height={12}
                    style={{ width: 34, height: 'auto', objectFit: 'contain' }}
                  />
                  <div id="tenant-login-title" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                    Entrar no painel
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
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
                  border: '1px solid #e2e8f0',
                  background: '#fff',
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
