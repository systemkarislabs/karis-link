'use server';
import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSeller(formData: FormData) {
  const slug = formData.get('slug') as string;
  const { tenantId } = await requireTenantAuth(slug);
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const photoFile = formData.get('photo') as File;
  
  let imageUrl = null;

  // Processar a imagem se ela existir
  if (photoFile && photoFile.size > 0) {
    const buffer = Buffer.from(await photoFile.arrayBuffer());
    const base64Image = buffer.toString('base64');
    imageUrl = `data:${photoFile.type};base64,${base64Image}`;
  }

  await prisma.seller.create({
    data: { name, phone, image: imageUrl, tenantId }
  });

  revalidatePath(`/${slug}/admin/vendedores`);
  redirect(`/${slug}/admin/vendedores`);
}

export async function deleteSeller(formData: FormData) {
  const slug = formData.get('slug') as string;
  const id = formData.get('id') as string;
  const { tenantId } = await requireTenantAuth(slug);
  
  await prisma.seller.deleteMany({ where: { id, tenantId } });
  
  revalidatePath(`/${slug}/admin/vendedores`);
  redirect(`/${slug}/admin/vendedores`);
}
