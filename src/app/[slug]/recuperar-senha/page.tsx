import Link from 'next/link';
import RecoveryClient from './RecoveryClient';

export default async function TenantRecoveryPage(props: any) {
  const params = await props.params;
  const { slug } = params;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
        <img src="/karis-link-logo.png" alt="Karis Link" style={{ width: 142, objectFit: 'contain', marginBottom: 18 }} />
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#0f172a' }}>Recuperar senha</h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
          Informe o email de recuperacao cadastrado para sua empresa e defina uma nova senha.
        </p>

        <RecoveryClient slug={slug} />

        <div style={{ marginTop: 18 }}>
          <Link href={`/${slug}/login`} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
