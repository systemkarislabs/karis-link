'use server';

import { createHash, randomBytes } from 'crypto';
import { hashPassword, isPasswordLengthAllowed } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { ensureTenantCitySupport } from '@/lib/db-compat';
import { sendPasswordRecoveryEmail } from '@/lib/email';
import prisma from '@/lib/prisma';
import { buildTenantPublicUrl } from '@/lib/public-url';
import { assertRateLimit, getRequestIp } from '@/lib/rate-limit';

type RecoveryState = { success?: string; error?: string } | null;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function isValidSlug(value: string) {
  return /^[a-z0-9]{3,50}$/.test(value);
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function genericRecoveryMessage() {
  return 'Se este e-mail estiver cadastrado, enviaremos as instrucoes de recuperacao.';
}

export async function requestTenantPasswordRecovery(_: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const slug = String(formData.get('slug') || '').trim();
  const email = normalizeEmail(String(formData.get('email') || ''));
  const ip = await getRequestIp();

  if (!isValidSlug(slug)) {
    return { error: 'Link da empresa invalido.' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Informe um e-mail valido.' };
  }

  try {
    await assertRateLimit({
      scope: 'tenant-password-recovery',
      key: `${slug}:${email}:${ip}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
      message: 'Muitas solicitacoes. Aguarde alguns minutos e tente novamente.',
    });

    await ensureTenantCitySupport();

    const tenant = await prisma.tenant.findFirst({
      where: { slug, active: true },
      select: { id: true, name: true, slug: true, adminUser: true, adminEmail: true },
    });

    if (!tenant || normalizeEmail(tenant.adminEmail || '') !== email) {
      return { success: genericRecoveryMessage() };
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: {
          tenantId: tenant.id,
          OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
        },
      }),
      prisma.passwordResetToken.create({
        data: { tenantId: tenant.id, tokenHash, expiresAt },
      }),
    ]);

    await sendPasswordRecoveryEmail({
      to: email,
      tenantName: tenant.name,
      username: tenant.adminUser,
      resetUrl: `${buildTenantPublicUrl(tenant.slug)}/recuperar-senha/${encodeURIComponent(token)}`,
    });

    await logAuditEvent({
      event: 'tenant_password_recovery_request',
      tenantId: tenant.id,
      actor: tenant.adminUser,
      metadata: { email },
    });

    return { success: genericRecoveryMessage() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nao foi possivel processar a solicitacao agora.';
    return { error: message };
  }
}

export async function resetTenantPassword(_: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const slug = String(formData.get('slug') || '').trim();
  const token = String(formData.get('token') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!isValidSlug(slug) || token.length < 20) {
    return { error: 'Link de recuperacao invalido.' };
  }

  if (password.length < 8) {
    return { error: 'A nova senha deve ter pelo menos 8 caracteres.' };
  }

  if (!isPasswordLengthAllowed(password)) {
    return { error: 'A nova senha deve ter no maximo 72 bytes.' };
  }

  if (password !== confirmPassword) {
    return { error: 'A confirmacao da senha nao confere.' };
  }

  try {
    await ensureTenantCitySupport();

    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        tenant: { select: { id: true, slug: true, adminUser: true, active: true } },
      },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date() ||
      !resetToken.tenant.active ||
      resetToken.tenant.slug !== slug
    ) {
      return { error: 'Link expirado ou invalido. Solicite uma nova recuperacao.' };
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.tenant.update({
        where: { id: resetToken.tenantId },
        data: { adminPass: passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          tenantId: resetToken.tenantId,
          id: { not: resetToken.id },
        },
      }),
    ]);

    await logAuditEvent({
      event: 'tenant_password_reset_success',
      tenantId: resetToken.tenantId,
      actor: resetToken.tenant.adminUser,
    });

    return { success: 'Senha atualizada com sucesso. Voce ja pode entrar no painel.' };
  } catch {
    return { error: 'Nao foi possivel atualizar a senha agora. Tente novamente.' };
  }
}
