"use client";
import React, { useState } from 'react';
import { Icon } from '@/components/Icon';
import { handleLogin } from "../auth-actions";
import { useFormState, useFormStatus } from 'react-dom';

type LoginState = { error?: string } | null;

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{
      width: '100%', padding: '13px',
      borderRadius: 10, border: 'none',
      background: pending ? '#9ca3af' : '#020515',
      color: '#fff', fontWeight: 600, fontSize: 14,
      fontFamily: "'Poppins', sans-serif",
      cursor: pending ? 'default' : 'pointer',
      transition: 'all 0.2s', marginTop: 4,
    }}>
      {pending ? 'Entrando...' : 'Entrar no Painel'}
    </button>
  );
};

const navItems = [
  { icon: 'link',     label: 'Árvore de Links' },
  { icon: 'chart',    label: 'Dashboard' },
  { icon: 'users',    label: 'Vendedores' },
  { icon: 'settings', label: 'Configurações' },
  { icon: 'info',     label: 'Ajuda' },
];

export const LoginClient = () => {
  const [focused, setFocused] = useState('');
  const [state, formAction] = useFormState<LoginState, FormData>(handleLogin as any, null);

  const inpStyle = (field: string): React.CSSProperties => ({
    width: '100%', background: '#FFFFFF',
    border: `1px solid ${focused === field ? '#17DB4E' : '#E5E7EB'}`,
    borderRadius: 8, padding: '12px 14px 12px 40px',
    color: '#2B2B2B', fontSize: 14,
    WebkitTextFillColor: '#2B2B2B',
    caretColor: '#2B2B2B',
    fontFamily: "'Open Sans', sans-serif",
    outline: 'none',
    boxShadow: focused === field
      ? '0 0 0 3px rgba(23,219,78,0.10), 0 0 0 1000px #FFFFFF inset'
      : '0 0 0 1000px #FFFFFF inset',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    appearance: 'none',
  });

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: '100vh', display: 'flex',
        fontFamily: "'Open Sans', sans-serif",
        background: '#FAFBFC',
      }}>

        {/* ── Sidebar esquerda minimalista ── */}
        <aside style={{
          width: 240, flexShrink: 0,
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          display: 'flex', flexDirection: 'column',
          padding: 0,
        }}>
          {/* Logo */}
          <div style={{
            padding: '28px 24px 20px',
            borderBottom: '1px solid #E5E7EB',
          }}>
            <img src="/karis-link-logo.png" alt="Karis Link" style={{ height: 40, objectFit: 'contain' }} />
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map((item, i) => {
              const isFirst = i === 0;
              return (
                <div key={item.icon} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, cursor: 'default',
                  background: isFirst ? 'rgba(23,219,78,0.08)' : 'transparent',
                  color: isFirst ? '#15803d' : '#6B7280',
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: isFirst ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s',
                }}>
                  <Icon name={item.icon} size={17} color={isFirst ? '#17DB4E' : '#9CA3AF'} />
                  {item.label}
                </div>
              );
            })}
          </nav>

          {/* Rodapé sidebar */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
          }}>
            <p style={{ fontSize: 11, color: '#D1D5DB', margin: 0, fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Karis Link · v1.0
            </p>
          </div>
        </aside>

        {/* ── Área do formulário ── */}
        <div style={{
          flex: 1, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: 40,
        }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            {/* Título */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontSize: 24, fontWeight: 700, color: '#2B2B2B',
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: '-0.01em', marginBottom: 6,
              }}>
                Área Administrativa
              </h1>
              <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>
                Acesse o painel com suas credenciais
              </p>
            </div>

            {/* Card form */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              borderRadius: 14, padding: 28,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            }}>
              <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {state?.error && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: '#FEF2F2', color: '#B91C1C',
                    fontSize: 13, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                    border: '1px solid #FECACA',
                  }}>
                    <Icon name="info" size={14} /> {state.error}
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block', fontSize: 13, fontWeight: 600,
                    color: '#2B2B2B', fontFamily: "'Poppins', sans-serif", marginBottom: 7,
                  }}>Usuário</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focused === 'user' ? '#17DB4E' : '#9CA3AF', transition: 'color 0.2s' }}>
                      <Icon name="user" size={15} />
                    </div>
                    <input type="text" name="username"
                      onFocus={() => setFocused('user')} onBlur={() => setFocused('')}
                      placeholder="admin" style={inpStyle('user')} required />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block', fontSize: 13, fontWeight: 600,
                    color: '#2B2B2B', fontFamily: "'Poppins', sans-serif", marginBottom: 7,
                  }}>Senha</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focused === 'pass' ? '#17DB4E' : '#9CA3AF', transition: 'color 0.2s' }}>
                      <Icon name="lock" size={15} />
                    </div>
                    <input type="password" name="password"
                      onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                      placeholder="••••••••" style={inpStyle('pass')} required />
                  </div>
                </div>

                <SubmitButton />
              </form>
            </div>

            {/* Voltar */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <a href="/" style={{
                color: '#9CA3AF', fontSize: 13, textDecoration: 'none',
                fontFamily: "'Open Sans', sans-serif",
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                ← Voltar à página principal
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
