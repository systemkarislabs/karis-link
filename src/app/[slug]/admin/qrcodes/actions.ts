'use server';

import { requireTenantAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createQrCode(formData: FormData, slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const name = String(formData.get('name') || '').trim();
  const qrSlug = String(formData.get('slug') || '').trim().toLowerCase();
  const { tenantId } = await requireTenantAuth(normalizedSlug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const finalUrl = `${baseUrl}/${normalizedSlug}?source=qr&campaign=${qrSlug}`;

  if (!name || !qrSlug) {
    throw new Error('Nome e identificador do QR Code são obrigatórios.');
  }

  await prisma.qrCode.create({
    data: {
      name,
      slug: qrSlug,
      url: finalUrl,
      tenantId,
    },
  });

  revalidatePath(`/${normalizedSlug}/admin/qrcodes`);
  redirect(`/${normalizedSlug}/admin/qrcodes`);
}

export async function deleteQrCode(formData: FormData) {
  const id = String(formData.get('id') || '');
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const { tenantId } = await requireTenantAuth(slug);

  try {
    await prisma.qrCode.deleteMany({ where: { id, tenantId } });
    revalidatePath(`/${slug}/admin/qrcodes`);
  } catch (error) {
    console.error('Delete error:', error);
  }
}
