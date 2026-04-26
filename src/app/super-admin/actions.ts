'use server';

import {
  clearSuperSession,
  hashPassword,
  requireSuperAuth,
  setSuperSession,
  verifyPassword,
} from '@/lib/auth';
import prisma from '@/lib/prisma';
import { assertRateLimit, getRequestIp } from '@/lib/rate-limit';
import { ensureSuperAdminTableAvailable, findStoredSuperAdminAccount } from '@/lib/super-admin';
import { redirect } from 'next/navigation';

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isValidRecoveryEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function handleSuperLogin(_: unknown, formData: FormData) {
  const user = String(formData.get('username') || '').trim();
  const pass = String(formData.get('password') || '');
  const ip = await getRequestIp();

  await assertRateLimit({
    scope: 'super-login',
    key: `${user}:${ip}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
    message: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  });

  const storedAccount = await findStoredSuperAdminAccount();

  if (storedAccount) {
    const passwordMatches = await verifyPassword(pass, storedAccount.passwordHash);
    if (user !== storedAccount.username || !passwordMatches) {
      return { error: 'Credenciais invalidas.' };
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
    return { error: 'Credenciais invalidas.' };
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
  const slug = String(formData.get('slug') || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  const adminUser = String(formData.get('adminUser') || '').trim();
  const adminPass = String(formData.get('adminPass') || '');
  const recoveryEmail = String(formData.get('recoveryEmail') || '').trim().toLowerCase();

  if (!name || !slug || !adminUser || !adminPass || !recoveryEmail) {
    throw new Error('Todos os campos da empresa sao obrigatorios.');
  }

  if (name.length > 80) {
    throw new Error('O nome da empresa deve ter no maximo 80 caracteres.');
  }

  if (!isValidSlug(slug) || slug.length < 3 || slug.length > 50) {
    throw new Error('O slug deve usar apenas letras minusculas, numeros e hifens.');
  }

  if (adminUser.length < 3 || adminUser.length > 50) {
    throw new Error('O usuario administrador deve ter entre 3 e 50 caracteres.');
  }

  if (adminPass.length < 8) {
    throw new Error('A senha inicial deve ter pelo menos 8 caracteres.');
  }

  if (!isValidRecoveryEmail(recoveryEmail)) {
    throw new Error('Informe um email de recuperacao valido.');
  }

  try {
    await (prisma.tenant as any).create({
      data: {
        name,
        slug,
        adminUser,
        adminPass: await hashPassword(adminPass),
        recoveryEmail,
      },
    });
  } catch (error) {
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: string }).message)
        : '';

    if (message.toLowerCase().includes('recoveryemail')) {
      await prisma.tenant.create({
        data: {
          name,
          slug,
          adminUser,
          adminPass: await hashPassword(adminPass),
        },
      });
    } else {
      throw error;
    }
  }

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

  if (username.length < 3 || username.length > 50) {
    throw new Error('O usuario deve ter entre 3 e 50 caracteres.');
  }

  if (password.length < 8) {
    throw new Error('A senha precisa ter pelo menos 8 caracteres.');
  }

  if (password !== confirmPassword) {
    throw new Error('A confirmacao da senha nao confere.');
  }

  const passwordHash = await hashPassword(password);

  try {
    const existingAccount = await findStoredSuperAdminAccount();

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
  } catch (error) {
    ensureSuperAdminTableAvailable(error);
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
    select: {
      id: true,
      sellers: { select: { id: true } },
    },
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
