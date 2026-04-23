'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSeller(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const slug = formData.get('slug') as string; // Agora pegamos o slug do formulário
  const imageFile = formData.get('image') as File;

  let imageBase64 = null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imageBase64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return;

  await prisma.seller.create({
    data: {
      name,
      phone,
      image: imageBase64,
      tenantId: tenant.id
    }
  });

  revalidatePath(`/${slug}/admin/vendedores`);
}

export async function deleteSeller(formData: FormData) {
  const id = formData.get('id') as string;
  const slug = formData.get('slug') as string;

  try {
    await prisma.seller.delete({ where: { id } });
    revalidatePath(`/${slug}/admin/vendedores`);
  } catch (error) {
    console.error('Delete error:', error);
  }
}
