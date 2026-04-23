'use server';

import {
  clearSuperSession,
  hashPassword,
  requireSuperAuth,
  setSuperSession,
  verifyPassword,
} from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function handleSuperLogin(_: unknown, formData: FormData) {
  const user = String(formData.get('username') || '').trim();
  const pass = String(formData.get('password') || '');
  const configuredUser = process.env.SUPER_ADMIN_USER || process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.SUPER_ADMIN_PASS || process.env.ADMIN_PASSWORD;
  const configuredHash = process.env.SUPER_ADMIN_PASS_HASH;

  if (!configuredUser || (!configuredPassword && !configuredHash)) {
    return { error: 'Super-admin não configurado no ambiente.' };
  }

  const passwordMatches = await verifyPassword(pass, configuredHash || configuredPassword);
  if (user !== configuredUser || !passwordMatches) {
    return { error: 'Credenciais inválidas' };
  }

  await setSuperSession();
  redirect('/super-admin');
}

export async function execLogout() {
  await clearSuperSession();
  redirect('/super-admin/login');
}

export async function createTenant(formData: FormData) {
  await requireSuperAuth();

  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase().replace(/\s+/g, '-');
  const adminUser = String(formData.get('adminUser') || '').trim();
  const adminPass = String(formData.get('adminPass') || '');

  if (!name || !slug || !adminUser || !adminPass) {
    throw new Error('Todos os campos do tenant são obrigatórios.');
  }

  await prisma.tenant.create({
    data: {
      name,
      slug,
      adminUser,
      adminPass: await hashPassword(adminPass),
    },
  });

  redirect('/super-admin');
}

export async function toggleTenant(id: string, active: boolean) {
  await requireSuperAuth();
  await prisma.tenant.update({ where: { id }, data: { active: !active } });
  redirect('/super-admin');
}
