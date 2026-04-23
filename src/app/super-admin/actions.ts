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

  const storedAccount = await prisma.superAdminAccount.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (storedAccount) {
    const passwordMatches = await verifyPassword(pass, storedAccount.passwordHash);
    if (user !== storedAccount.username || !passwordMatches) {
      return { error: 'Credenciais invalidas' };
    }

    await setSuperSession();
    redirect('/super-admin');
  }

  const configuredUser = process.env.SUPER_ADMIN_USER || process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.SUPER_ADMIN_PASS || process.env.ADMIN_PASSWORD;
  const configuredHash = process.env.SUPER_ADMIN_PASS_HASH;

  if (!configuredUser || (!configuredPassword && !configuredHash)) {
    return { error: 'Super-admin nao configurado no ambiente.' };
  }

  const passwordMatches = await verifyPassword(pass, configuredHash || configuredPassword);
  if (user !== configuredUser || !passwordMatches) {
    return { error: 'Credenciais invalidas' };
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
    throw new Error('Todos os campos do tenant sao obrigatorios.');
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

export async function updateSuperAdminCredentials(formData: FormData) {
  await requireSuperAuth();

  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!username || !password || !confirmPassword) {
    throw new Error('Preencha usuario, nova senha e confirmacao.');
  }

  if (password.length < 6) {
    throw new Error('A senha precisa ter pelo menos 6 caracteres.');
  }

  if (password !== confirmPassword) {
    throw new Error('A confirmacao da senha nao confere.');
  }

  const existingAccount = await prisma.superAdminAccount.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  const passwordHash = await hashPassword(password);

  if (existingAccount) {
    await prisma.superAdminAccount.update({
      where: { id: existingAccount.id },
      data: { username, passwordHash },
    });
  } else {
    await prisma.superAdminAccount.create({
      data: { username, passwordHash },
    });
  }

  redirect('/super-admin/configuracoes');
}

export async function deleteTenant(formData: FormData) {
  await requireSuperAuth();

  const id = String(formData.get('id') || '').trim();
  if (!id) {
    throw new Error('Empresa invalida para exclusao.');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { sellers: { select: { id: true } } },
  });

  if (!tenant) {
    throw new Error('Empresa nao encontrada.');
  }

  const sellerIds = tenant.sellers.map((seller) => seller.id);

  await prisma.$transaction(async (tx) => {
    if (sellerIds.length > 0) {
      await tx.sellerClickEvent.deleteMany({
        where: { sellerId: { in: sellerIds } },
      });
    }

    await tx.pageClickEvent.deleteMany({
      where: { tenantId: tenant.id },
    });

    await tx.qrCode.deleteMany({
      where: { tenantId: tenant.id },
    });

    await tx.seller.deleteMany({
      where: { tenantId: tenant.id },
    });

    await tx.tenant.delete({
      where: { id: tenant.id },
    });
  });

  redirect('/super-admin');
}
