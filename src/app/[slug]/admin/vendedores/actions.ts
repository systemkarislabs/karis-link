'use server';

import { requireTenantAuth } from '@/lib/auth';
import { validateImageDataUrl, validateImageFile } from '@/lib/image-validation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function validateSellerFields(name: string, phone: string) {
  if (!name || !phone) {
    throw new Error('Nome e telefone do vendedor sao obrigatorios.');
  }

  if (name.length > 80) {
    throw new Error('O nome do vendedor deve ter no maximo 80 caracteres.');
  }

  const normalizedPhone = phone.replace(/[^\d+]/g, '');
  if (normalizedPhone.length < 10 || normalizedPhone.length > 20) {
    throw new Error('Informe um WhatsApp valido para o vendedor.');
  }
}

async function resolveSellerImage(imageDataUrl: string, imageFile: File | null | undefined) {
  if (imageDataUrl) {
    validateImageDataUrl(imageDataUrl);
    return imageDataUrl;
  }

  if (imageFile && imageFile.size > 0) {
    validateImageFile(imageFile);
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    return `data:${imageFile.type};base64,${buffer.toString('base64')}`;
  }

  return null;
}

export async function createSeller(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const imageFile = formData.get('image') as File | null;
  const imageDataUrl = String(formData.get('imageDataUrl') || '').trim();
  const { tenantId } = await requireTenantAuth(slug);

  validateSellerFields(name, phone);
  const imageBase64 = await resolveSellerImage(imageDataUrl, imageFile);

  await prisma.seller.create({
    data: {
      name,
      phone,
      image: imageBase64,
      tenantId,
    },
  });

  revalidatePath(`/${slug}/admin/vendedores`);
  revalidatePath(`/${slug}`);
  redirect(`/${slug}/admin/vendedores`);
}

export async function deleteSeller(formData: FormData) {
  const id = String(formData.get('id') || '');
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const { tenantId } = await requireTenantAuth(slug);

  try {
    await prisma.seller.deleteMany({ where: { id, tenantId } });
    revalidatePath(`/${slug}/admin/vendedores`);
    revalidatePath(`/${slug}`);
  } catch (error) {
    console.error('Delete error:', error);
  }
}

export async function updateSeller(formData: FormData) {
  const id = String(formData.get('id') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const imageFile = formData.get('image') as File | null;
  const imageDataUrl = String(formData.get('imageDataUrl') || '').trim();
  const removeImage = String(formData.get('removeImage') || '') === 'on';
  const { tenantId } = await requireTenantAuth(slug);

  if (!id) {
    throw new Error('Vendedor invalido.');
  }

  validateSellerFields(name, phone);

  const seller = await prisma.seller.findFirst({
    where: { id, tenantId },
    select: { image: true },
  });

  if (!seller) {
    throw new Error('Vendedor nao encontrado.');
  }

  let imageValue = seller.image;

  if (removeImage) {
    imageValue = null;
  }

  const newImage = await resolveSellerImage(imageDataUrl, imageFile);
  if (newImage) {
    imageValue = newImage;
  }

  await prisma.seller.updateMany({
    where: { id, tenantId },
    data: {
      name,
      phone,
      image: imageValue,
    },
  });

  revalidatePath(`/${slug}/admin/vendedores`);
  revalidatePath(`/${slug}`);
  redirect(`/${slug}/admin/vendedores`);
}
