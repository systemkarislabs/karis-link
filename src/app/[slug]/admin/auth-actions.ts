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
