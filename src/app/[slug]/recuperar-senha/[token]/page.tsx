import { createHash } from 'crypto';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ResetPasswordClient from './ResetPasswordClient';

export const dynamic = 'force-dynamic';

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function isResetTokenValid(slug: string, token: string) {
  if (!slug || !token) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stored = await (prisma as any).passwordResetToken.findFirst({
      where: {
        tokenHash: hashResetToken(token),
        usedAt: null,
        expiresAt: { gt: new Date() },
        tenant: { slug, active: true },
      },
      select: { id: true },
    });

    return Boolean(stored);
  } catch {
    return false;
  }
}

function ShellCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 24,
          padding: 32,
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        }}
      >
        <img
          src="/karis-link-logo.png"
          alt="Karis Link"
          loading="lazy"
          style={{ width: 142, objectFit: 'contain', marginBottom: 18 }}
        />
        {children}
      </div>
    </div>
  );
}

export default async function TenantResetPasswordPage(props: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await props.params;

  const tokenValid = await isResetTokenValid(slug, token);

  if (!tokenValid) {
    return (
      <ShellCard>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
          Link inválido ou expirado
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
          Este link de recuperação não é válido ou já expirou. Solicite uma nova recuperação de senha
          para continuar.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link
            href={`/${slug}/recuperar-senha`}
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#17DB4E',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Solicitar nova recuperação
          </Link>
          <Link
            href={`/${slug}/login`}
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Voltar para o login
          </Link>
        </div>
      </ShellCard>
    );
  }

  return (
    <ShellCard>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
        Criar nova senha
      </h1>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
        Defina uma nova senha forte (mínimo 8 caracteres) para acessar o painel da empresa.
      </p>

      <ResetPasswordClient slug={slug} token={token} />

      <div style={{ marginTop: 18 }}>
        <Link
          href={`/${slug}/login`}
          style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}
        >
          Voltar para o login
        </Link>
      </div>
    </ShellCard>
  );
}
