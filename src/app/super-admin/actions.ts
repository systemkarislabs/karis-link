'use server';
import { setSuperSession, clearSuperSession, requireSuperAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export async function handleSuperLogin(_: any, formData: FormData) {
  const user = formData.get('username') as string;
  const pass = formData.get('password') as string;
  if (user !== (process.env.SUPER_ADMIN_USER || 'superadmin') || pass !== (process.env.SUPER_ADMIN_PASS || 'super123')) {
    return { error: 'Credenciais inválidas' };
  }
  await setSuperSession();
  redirect('/super-admin');
}

export async function handleSuperLogout() {
  await clearSuperSession();
  redirect('/super-admin/login');
}

export async function createTenant(formData: FormData) {
  await requireSuperAuth();
  const name      = formData.get('name')      as string;
  const slug      = formData.get('slug')      as string;
  const adminUser = formData.get('adminUser') as string;
  const adminPass = formData.get('adminPass') as string;
  await prisma.tenant.create({ data: { name, slug: slug.toLowerCase().replace(/\s+/g, '-'), adminUser, adminPass } });
  redirect('/super-admin');
}

export async function toggleTenant(id: string, active: boolean) {
  await requireSuperAuth();
  await prisma.tenant.update({ where: { id }, data: { active: !active } });
  redirect('/super-admin');
}
