'use client';
import React, { useActionState } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { handleSuperLogin } from '../actions';

type S = { error?: string } | null;

const Btn = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: '14px',
        borderRadius: 12,
        background: '#17DB4E',
        color: '#fff',
        border: 'none',
        fontWeight: 700,
        fontSize: 15,
        cursor: pending ? 'not-allowed' : 'pointer',
        marginTop: 8,
        opacity: pending ? 0.72 : 1,
        boxShadow: '0 8px 20px rgba(23, 219, 78, 0.22)',
      }}
    >
      {pending ? 'Autenticando…' : 'Entrar no Sistema'}
    </button>
  );
};

export default function SuperLoginClient() {
  const [state, formAction] = useActionState<S, FormData>(handleSuperLogin, null);
  const inp: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    fontSize: 14,
    outline: 'none',
    background: '#ffffff',
    color: '#0f172a',
    WebkitTextFillColor: '#0f172a',
    caretColor: '#0f172a',
    boxShadow: '0 0 0 1000px #ffffff inset',
    appearance: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 48,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/karis-labs-logo.png"
            alt="Karis Labs"
            width={140}
            height={40}
            priority
            style={{ width: '140px', height: 'auto', marginBottom: 16 }}
          />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Acesso Administrativo
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Entre com suas credenciais de super-admin.
          </p>
        </div>

        {state?.error && (
          <div
            style={{
              background: '#fff1f2',
              color: '#e11d48',
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 20,
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid #fecdd3',
            }}
          >
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 6,
                display: 'block',
                letterSpacing: '0.5px',
              }}
            >
              Usuário
            </label>
            <input
              name="username"
              placeholder="Digite seu usuário"
              required
              style={{ ...inp, width: '100%' }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 6,
                display: 'block',
                letterSpacing: '0.5px',
              }}
            >
              Senha
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              style={{ ...inp, width: '100%' }}
            />
          </div>
          <Btn />
        </form>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            Karis Labs &copy; 2026 · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
