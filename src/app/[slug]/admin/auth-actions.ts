'use server';

import {
  clearTenantSession,
  hashPassword,
  isPasswordHash,
  setTenantSession,
  verifyPassword,
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { assertRateLimit, getRequestIp } from '@/lib/rate-limit';
import { createHash, randomBytes } from 'crypto';
import { redirect } from 'next/navigation';

const PASSWORD_RESET_MINUTES = 30;

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

async function sendPasswordResetEmail(to: string, tenantName: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Karis Link <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured.');
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Recuperacao de senha - ${tenantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
          <h2>Recuperacao de senha</h2>
          <p>Recebemos uma solicitacao para redefinir a senha do painel da empresa <strong>${tenantName}</strong>.</p>
          <p>Use o link abaixo para criar uma nova senha. Ele expira em ${PASSWORD_RESET_MINUTES} minutos.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#17DB4E;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;">Redefinir senha</a></p>
          <p>Se voce nao solicitou isso, ignore este e-mail.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    console.error('Resend password reset email failed', await response.text());
    return false;
  }

  return true;
}

export async function handleTenantLogin(_: unknown, formData: FormData) {
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const user = String(formData.get('username') || '').trim();
  const pass = String(formData.get('password') || '');
  const ip = await getRequestIp();

  await assertRateLimit({
    scope: 'tenant-login',
    key: `${slug}:${user}:${ip}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
    message: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  });

  const tenant = await prisma.tenant.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      slug: true,
      adminUser: true,
      adminPass: true,
      active: true,
    },
  });
  const passwordMatches = tenant ? await verifyPassword(pass, tenant.adminPass) : false;

  if (!tenant || tenant.adminUser !== user || !passwordMatches) {
    await logAuditEvent({
      event: 'tenant_login_failure',
      actor: user,
      tenantId: tenant?.id,
      metadata: { slug },
    });
    return { error: 'Usuário ou senha inválidos.' };
  }

  if (!isPasswordHash(tenant.adminPass)) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { adminPass: await hashPassword(pass) },
    });
  }

  await setTenantSession(slug, tenant.id);
  await logAuditEvent({
    event: 'tenant_login_success',
    actor: user,
    tenantId: tenant.id,
    metadata: { slug },
  });
  redirect(`/${slug}/admin`);
}

export async function handleTenantLogout(slug: string) {
  await clearTenantSession();
  redirect(`/${slug}`);
}

export async function handleTenantPasswordRecovery(_: unknown, formData: FormData) {
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const recoveryEmail = String(formData.get('recoveryEmail') || '').trim().toLowerCase();
  const ip = await getRequestIp();

  if (!slug || !recoveryEmail) {
    return { error: 'Informe o e-mail de recuperação cadastrado.' };
  }

  await assertRateLimit({
    scope: 'tenant-recovery',
    key: `${slug}:${recoveryEmail}:${ip}`,
    limit: 5,
    windowMs: 30 * 60 * 1000,
    message: 'Muitas solicitações de recuperação. Aguarde alguns minutos e tente novamente.',
  });

  const genericMessage =
    'Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes.';

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        active: true,
        recoveryEmail: true,
      },
    });

    if (tenant?.active && tenant.recoveryEmail?.toLowerCase() === recoveryEmail) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000);
      const resetUrl = `${getAppBaseUrl()}/${slug}/recuperar-senha/${token}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).passwordResetToken.create({
        data: {
          tokenHash,
          tenantId: tenant.id,
          expiresAt,
        },
      });

      await sendPasswordResetEmail(recoveryEmail, tenant.name, resetUrl);

      await logAuditEvent({
        event: 'tenant_password_recovery_request',
        tenantId: tenant.id,
        metadata: { slug },
      });
    }

    return { success: genericMessage };
  } catch (error) {
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: string }).message)
        : '';

    if (message.toLowerCase().includes('recoveryemail')) {
      return { success: genericMessage };
    }

    throw error;
  }
}

export async function handleTenantPasswordReset(_: unknown, formData: FormData) {
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const token = String(formData.get('token') || '').trim();
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!slug || !token || !newPassword || !confirmPassword) {
    return { error: 'Preencha todos os campos para redefinir a senha.' };
  }

  if (newPassword.length < 8) {
    return { error: 'A nova senha precisa ter pelo menos 8 caracteres.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'A confirmação da nova senha não confere.' };
  }

  const tokenHash = hashResetToken(token);

  const resetToken = await (prisma as any).passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
      tenant: {
        slug,
        active: true,
      },
    },
    select: {
      id: true,
      tenantId: true,
    },
  });

  if (!resetToken) {
    return { error: 'Link inválido ou expirado. Solicite uma nova recuperação de senha.' };
  }

  await prisma.$transaction([
    prisma.tenant.update({
      where: { id: resetToken.tenantId },
      data: { adminPass: await hashPassword(newPassword) },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).passwordResetToken.updateMany({
      where: {
        tenantId: resetToken.tenantId,
        usedAt: null,
        id: { not: resetToken.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);

  await logAuditEvent({
    event: 'tenant_password_reset_success',
    tenantId: resetToken.tenantId,
    metadata: { slug },
  });

  redirect(`/${slug}/login`);
}
