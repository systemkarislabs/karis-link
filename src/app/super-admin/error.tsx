'use client';

import { useEffect } from 'react';

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorText = error.message || error.digest || '';
  const isStaleServerActionError =
    errorText.includes('Server Action') && errorText.includes('was not found on the server');

  useEffect(() => {
    if (!isStaleServerActionError) return;

    const target = `${window.location.pathname}${window.location.search}`;
    window.location.replace(target);
  }, [isStaleServerActionError]);

  function handleRetry() {
    if (isStaleServerActionError) {
      window.location.replace(`${window.location.pathname}${window.location.search}`);
      return;
    }

    reset();
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 20,
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
          boxShadow: 'var(--shadow-soft)',
          padding: 28,
        }}
      >
        <h1 style={{ margin: '0 0 10px', fontSize: 22, color: '#e11d48' }}>
          Erro tecnico detectado
        </h1>
        <p style={{ margin: '0 0 18px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
          Nao foi possivel carregar o painel gerencial agora. Tente novamente ou envie o codigo abaixo ao suporte.
        </p>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'var(--bg-main)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            padding: 14,
            fontSize: 12,
            color: 'var(--text-main)',
          }}
        >
          {error.digest || error.message || 'Erro desconhecido'}
        </pre>
        <button
          type="button"
          onClick={handleRetry}
          style={{
            marginTop: 18,
            padding: '11px 16px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--sidebar-active-text)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
