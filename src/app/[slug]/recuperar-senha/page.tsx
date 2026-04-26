import Link from 'next/link';
import RecoveryClient from './RecoveryClient';

type PageProps = { params: Promise<{ slug: string }> };

export default async function TenantRecoveryPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        color: 'var(--text-main)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--card-bg)',
          borderRadius: 24,
          padding: 32,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <img
          src="/karis-link-logo.png"
          alt="Karis Link"
          loading="lazy"
          style={{ width: 142, objectFit: 'contain', marginBottom: 18 }}
        />
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--text-main)' }}>
          Recuperar senha
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.5 }}>
          Informe o e-mail de recuperação cadastrado para sua empresa. A solicitação será validada antes
          de qualquer alteração de senha.
        </p>

        <RecoveryClient slug={slug} />

        <div style={{ marginTop: 18 }}>
          <Link href={`/${slug}/login`} style={{ fontSize: 13, color: 'var(--text-soft)', textDecoration: 'none' }}>
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
