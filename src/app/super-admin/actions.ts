'use server';

import {
  clearSuperSession,
  hashPassword,
  isPasswordLengthAllowed,
  requireSuperAuth,
  setSuperSession,
  verifyPassword,
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { ensureTenantLogoColumn } from '@/lib/db-compat';
import prisma from '@/lib/prisma';
import { assertRateLimit, getRequestIp } from '@/lib/rate-limit';
import { ensureSuperAdminTableAvailable, findStoredSuperAdminAccount } from '@/lib/super-admin';
import { validateImageBuffer, validateImageDataUrl, validateImageFile } from '@/lib/image-validation';
import { redirect } from 'next/navigation';

function normalizeTenantSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+$/.test(value);
}

function assertPasswordPolicy(password: string, fieldLabel = 'A senha') {
  if (password.length < 8) {
    throw new Error(`${fieldLabel} deve ter pelo menos 8 caracteres.`);
  }

  if (!isPasswordLengthAllowed(password)) {
    throw new Error(`${fieldLabel} deve ter no maximo 72 bytes para manter seguranca com bcrypt.`);
  }
}

async function resolveTenantLogo(logoDataUrl: string, logoFile: File | null | undefined) {
  if (logoDataUrl) {
    validateImageDataUrl(logoDataUrl);
    return logoDataUrl;
  }

  if (logoFile && logoFile.size > 0) {
    validateImageFile(logoFile);
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    validateImageBuffer(buffer, logoFile.type);
    return `data:${logoFile.type};base64,${buffer.toString('base64')}`;
  }

  return null;
}

export async function handleSuperLogin(_: unknown, formData: FormData) {
  // Normaliza usuário para lowercase para evitar erros de case-sensitivity.
  const user = String(formData.get('username') || '').trim().toLowerCase();
  const pass = String(formData.get('password') || '');
  const ip = await getRequestIp();

  await assertRateLimit({
    scope: 'super-login',
    key: `${user}:${ip}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
    message: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  });

  if (user.length < 3 || user.length > 50 || !pass || !isPasswordLengthAllowed(pass)) {
    await logAuditEvent({ event: 'super_login_failure', actor: user || null });
    return { error: 'Credenciais invalidas.' };
  }

  const storedAccount = await findStoredSuperAdminAccount();

  if (storedAccount) {
    const passwordMatches = await verifyPassword(pass, storedAccount.passwordHash);
    if (user !== storedAccount.username.toLowerCase() || !passwordMatches) {
      await logAuditEvent({ event: 'super_login_failure', actor: user });
      return { error: 'Credenciais inválidas.' };
    }

    await setSuperSession();
    await logAuditEvent({ event: 'super_login_success', actor: user });
    redirect('/super-admin');
  }

  const configuredUser = process.env.SUPER_ADMIN_USER || process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.SUPER_ADMIN_PASS || process.env.ADMIN_PASSWORD;
  const configuredHash = process.env.SUPER_ADMIN_PASS_HASH;

  if (!configuredUser || (!configuredPassword && !configuredHash)) {
    return { error: 'Super-admin não configurado no ambiente.' };
  }

  const passwordMatches = await verifyPassword(pass, configuredHash || configuredPassword);
  if (user !== configuredUser.trim().toLowerCase() || !passwordMatches) {
    await logAuditEvent({ event: 'super_login_failure', actor: user });
    return { error: 'Credenciais invalidas.' };
  }

  await setSuperSession();
  await logAuditEvent({ event: 'super_login_success', actor: user });
  redirect('/super-admin');
}

export async function execLogout() {
  await clearSuperSession();
  await logAuditEvent({ event: 'super_logout' });
  redirect('/super-admin/login');
}

export async function createTenant(formData: FormData) {
  await requireSuperAuth();
  await ensureTenantLogoColumn();

  const name = String(formData.get('name') || '').trim();
  const slug = normalizeTenantSlug(name);
  const adminUser = String(formData.get('adminUser') || '').trim().toLowerCase();
  const adminPass = String(formData.get('adminPass') || '');
  const logoDataUrl = String(formData.get('logoDataUrl') || '').trim();
  const logoFile = formData.get('logo') as File | null;

  if (!name || !slug || !adminUser || !adminPass) {
    throw new Error('Todos os campos da empresa são obrigatórios.');
  }

  if (name.length > 80) {
    throw new Error('O nome da empresa deve ter no máximo 80 caracteres.');
  }

  if (!isValidSlug(slug) || slug.length < 3 || slug.length > 50) {
    throw new Error('O nome da empresa precisa gerar um link com 3 a 50 letras ou numeros.');
  }

  const existingSlug = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingSlug) {
    throw new Error(`Ja existe uma empresa usando o link "${slug}". Ajuste o nome da empresa para diferenciar.`);
  }

  if (adminUser.length < 3 || adminUser.length > 50) {
    throw new Error('O usuário administrador deve ter entre 3 e 50 caracteres.');
  }

  assertPasswordPolicy(adminPass, 'A senha inicial');

  const created = await prisma.tenant.create({
    data: {
      name,
      slug,
      adminUser,
      adminPass: await hashPassword(adminPass),
      logo: await resolveTenantLogo(logoDataUrl, logoFile),
    },
    select: { id: true },
  });

  await logAuditEvent({
    event: 'tenant_create',
    tenantId: created.id,
    metadata: { name, slug, adminUser },
  });

  redirect('/super-admin');
}

export async function updateTenantLogo(formData: FormData) {
  await requireSuperAuth();
  await ensureTenantLogoColumn();

  const id = String(formData.get('id') || '').trim();
  const logoDataUrl = String(formData.get('logoDataUrl') || '').trim();
  const logoFile = formData.get('logo') as File | null;

  if (!id) {
    throw new Error('Empresa inválida para atualizar logo.');
  }

  const logo = await resolveTenantLogo(logoDataUrl, logoFile);
  if (!logo) {
    throw new Error('Selecione uma imagem para atualizar a logo.');
  }

  await prisma.tenant.update({
    where: { id },
    data: { logo },
  });

  await logAuditEvent({
    event: 'tenant_logo_update',
    tenantId: id,
    metadata: { logoUpdatedBySuper: true },
  });

  redirect('/super-admin');
}

export async function toggleTenant(id: string, active: boolean) {
  await requireSuperAuth();
  await prisma.tenant.update({ where: { id }, data: { active: !active } });
  await logAuditEvent({
    event: 'tenant_toggle',
    tenantId: id,
    metadata: { newActive: !active },
  });
  redirect('/super-admin');
}

export async function updateTenantAdminPassword(formData: FormData) {
  await requireSuperAuth();

  const id = String(formData.get('id') || '').trim();
  const adminPass = String(formData.get('adminPass') || '');

  if (!id) {
    throw new Error('Empresa invalida para atualizar senha.');
  }

  assertPasswordPolicy(adminPass, 'A nova senha da empresa');

  await prisma.tenant.update({
    where: { id },
    data: { adminPass: await hashPassword(adminPass) },
  });

  await logAuditEvent({
    event: 'tenant_password_update_by_super',
    tenantId: id,
    metadata: { passwordUpdatedBySuper: true },
  });

  redirect('/super-admin');
}

export async function updateSuperAdminCredentials(formData: FormData) {
  await requireSuperAuth();

  const username = String(formData.get('username') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!username || !password || !confirmPassword) {
    throw new Error('Preencha usuário, nova senha e confirmação.');
  }

  if (username.length < 3 || username.length > 50) {
    throw new Error('O usuário deve ter entre 3 e 50 caracteres.');
  }

  assertPasswordPolicy(password, 'A senha');

  if (password !== confirmPassword) {
    throw new Error('A confirmação da senha não confere.');
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

  await logAuditEvent({ event: 'super_credentials_update', actor: username });
  redirect('/super-admin/configuracoes');
}

export async function deleteTenant(formData: FormData) {
  await requireSuperAuth();

  const id = String(formData.get('id') || '').trim();
  if (!id) {
    throw new Error('Empresa inválida para exclusão.');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    select: {
      id: true,
      sellers: { select: { id: true } },
    },
  });

  if (!tenant) {
    throw new Error('Empresa não encontrada.');
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

  await logAuditEvent({
    event: 'tenant_delete',
    tenantId: tenant.id,
    metadata: { sellersRemoved: sellerIds.length },
  });

  redirect('/super-admin');
}
