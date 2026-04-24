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

  const tenant = await prisma.tenant.findUnique({ where: { slug, active: true } });
  const passwordMatches = tenant ? await verifyPassword(pass, tenant.adminPass) : false;

  if (!tenant || tenant.adminUser !== user || !passwordMatches) {
    return { error: 'Usuário ou senha inválidos' };
  }

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
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!slug || !recoveryEmail || !newPassword || !confirmPassword) {
    return { error: 'Preencha todos os campos para recuperar a senha.' };
  }

  if (newPassword.length < 6) {
    return { error: 'A nova senha precisa ter pelo menos 6 caracteres.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'A confirmacao da nova senha nao confere.' };
  }

  try {
    const tenant = await (prisma.tenant as any).findUnique({
      where: { slug },
      select: {
        id: true,
        active: true,
        recoveryEmail: true,
      },
    });

    if (!tenant || !tenant.active) {
      return { error: 'Empresa nao encontrada ou inativa.' };
    }

    if (!tenant.recoveryEmail || tenant.recoveryEmail.toLowerCase() !== recoveryEmail) {
      return { error: 'O email informado nao confere com o cadastro da empresa.' };
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { adminPass: await hashPassword(newPassword) },
    });

    redirect(`/${slug}/login`);
  } catch (error) {
    const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: string }).message) : '';

    if (message.toLowerCase().includes('recoveryemail')) {
      return { error: 'A recuperacao de senha ainda nao foi habilitada neste ambiente.' };
    }

    throw error;
  }
}
