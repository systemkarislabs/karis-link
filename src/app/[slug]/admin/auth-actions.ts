'use server';

import {
  clearTenantSession,
  hashPassword,
  isPasswordHash,
  isPasswordLengthAllowed,
  setTenantSession,
  verifyPassword,
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { assertRateLimit, getRequestIp } from '@/lib/rate-limit';
import { redirect } from 'next/navigation';

export async function handleTenantLogin(_: unknown, formData: FormData) {
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const user = String(formData.get('username') || '').trim().toLowerCase();
  const pass = String(formData.get('password') || '');
  const ip = await getRequestIp();

  await assertRateLimit({
    scope: 'tenant-login',
    key: `${slug}:${user}:${ip}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
    message: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  });

  const hasSafeInput =
    /^[a-z0-9]{3,50}$/.test(slug) &&
    user.length >= 3 &&
    user.length <= 50 &&
    pass.length > 0 &&
    isPasswordLengthAllowed(pass);

  if (!hasSafeInput) {
    await logAuditEvent({
      event: 'tenant_login_failure',
      actor: user || null,
      metadata: { slug },
    });
    return { error: 'Usuario ou senha invalidos.' };
  }

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

  if (!tenant || tenant.adminUser.trim().toLowerCase() !== user || !passwordMatches) {
    await logAuditEvent({
      event: 'tenant_login_failure',
      actor: user,
      tenantId: tenant?.id,
      metadata: { slug },
    });
    return { error: 'Usuario ou senha invalidos.' };
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
