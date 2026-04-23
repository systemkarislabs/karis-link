'use client';
import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleSuperLogin } from '../actions';

type S = { error?: string } | null;
const Btn = () => { const { pending } = useFormStatus(); return <button type="submit" disabled={pending} style={{ padding: '12px', borderRadius: 8, background: '#111', color: '#17DB4E', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{pending ? 'Entrando…' : 'Entrar'}</button>; };

export default function SuperLoginClient() {
  const [state, formAction] = useFormState<S, FormData>(handleSuperLogin as any, null);
  const inp: React.CSSProperties = { padding: '11px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 40, width: '100%', maxWidth: 360, border: '1px solid #27272a' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#17DB4E', marginBottom: 4 }}>Karis Link</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>Super Admin</div>
        </div>
        {state?.error && <div style={{ background: '#450a0a', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{state.error}</div>}
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input name="username" placeholder="Usuário" required style={{ ...inp, background: '#111', color: '#fff', borderColor: '#374151' }} />
          <input name="password" type="password" placeholder="Senha" required style={{ ...inp, background: '#111', color: '#fff', borderColor: '#374151' }} />
          <Btn />
        </form>
      </div>
    </div>
  );
}
