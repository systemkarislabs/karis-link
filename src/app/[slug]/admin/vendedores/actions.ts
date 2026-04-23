'use server';

import { requireTenantAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSeller(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const imageFile = formData.get('image') as File;
  const { tenantId } = await requireTenantAuth(slug);

  let imageBase64 = null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imageBase64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
  }

  if (!name || !phone) {
    throw new Error('Nome e telefone do vendedor são obrigatórios.');
  }

  await prisma.seller.create({
    data: {
      name,
      phone,
      image: imageBase64,
      tenantId,
    },
  });

  revalidatePath(`/${slug}/admin/vendedores`);
}

export async function deleteSeller(formData: FormData) {
  const id = String(formData.get('id') || '');
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const { tenantId } = await requireTenantAuth(slug);

  try {
    await prisma.seller.deleteMany({ where: { id, tenantId } });
    revalidatePath(`/${slug}/admin/vendedores`);
  } catch (error) {
    console.error('Delete error:', error);
  }
}
