'use server';
import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createSeller(slug: string, formData: FormData) {
  const { tenantId } = await requireTenantAuth(slug);
  const name = formData.get('name') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const role = formData.get('role') as string;

  await prisma.seller.create({
    data: { name, whatsapp, role, tenantId }
  });
  revalidatePath(`/${slug}/admin/vendedores`);
}

export async function deleteSeller(slug: string, id: string) {
  const { tenantId } = await requireTenantAuth(slug);
  await prisma.seller.deleteMany({ where: { id, tenantId } });
  revalidatePath(`/${slug}/admin/vendedores`);
}
