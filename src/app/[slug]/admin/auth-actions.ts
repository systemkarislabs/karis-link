'use server';

import {
  clearTenantSession,
  hashPassword,
  isPasswordHash,
  setTenantSession,
  verifyPassword,
} from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function handleTenantLogin(_: unknown, formData: FormData) {
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const user = String(formData.get('username') || '').trim();
  const pass = String(formData.get('password') || '');

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
    return { error: 'Usuário ou senha inválidos.' };
  }

  // Migração: se senha ainda não está em hash, atualiza automaticamente
  if (!isPasswordHash(tenant.adminPass)) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { adminPass: await hashPassword(pass) },
    });
  }

  await setTenantSession(slug, tenant.id);
  redirect(`/${slug}/admin`);
}

export async function handleTenantLogout(slug: string) {
  await clearTenantSession();
  redirect(`/${slug}`);
}

export async function handleTenantPasswordRecovery(_: unknown, formData: FormData) {
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const recoveryEmail = String(formData.get('recoveryEmail') || '').trim().toLowerCase();

  if (!slug || !recoveryEmail) {
    return { error: 'Informe o e-mail de recuperação cadastrado.' };
  }

  const genericMessage =
    'Se o e-mail estiver cadastrado, o suporte da Karis Labs poderá validar a solicitação e orientar a redefinição.';

  try {
    const tenant = await (prisma.tenant as any).findUnique({
      where: { slug },
      select: {
        id: true,
        active: true,
        recoveryEmail: true,
      },
    });

    if (tenant?.active && tenant.recoveryEmail?.toLowerCase() === recoveryEmail) {
      console.info('Tenant password recovery requested', {
        tenantId: tenant.id,
        slug,
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
