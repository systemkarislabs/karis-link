'use server';
import { setTenantSession, clearTenantSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export async function handleTenantLogin(_: any, formData: FormData) {
  const slug = formData.get('slug') as string;
  const user = formData.get('username') as string;
  const pass = formData.get('password') as string;

  const tenant = await prisma.tenant.findUnique({ where: { slug, active: true } });
  if (!tenant || tenant.adminUser !== user || tenant.adminPass !== pass) {
    return { error: 'Usuário ou senha inválidos' };
  }
  await setTenantSession(slug, tenant.id);
  redirect(`/${slug}/admin`);
}

export async function handleTenantLogout(slug: string) {
  await clearTenantSession();
  redirect(`/${slug}`);
}
