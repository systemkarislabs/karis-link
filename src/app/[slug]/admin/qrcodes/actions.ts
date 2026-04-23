'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createQrCode(formData: FormData, slug: string) {
  const name = formData.get('name') as string;
  const qrSlug = formData.get('slug') as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const finalUrl = `${baseUrl}/${slug}?source=qr&campaign=${qrSlug}`;

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return;

  await prisma.qrCode.create({
    data: {
      name,
      slug: qrSlug,
      url: finalUrl,
      tenantId: tenant.id
    }
  });

  revalidatePath(`/${slug}/admin/qrcodes`);
  redirect(`/${slug}/admin/qrcodes`);
}

export async function deleteQrCode(id: string, slug: string) {
  try {
    await prisma.qrCode.delete({ where: { id } });
    revalidatePath(`/${slug}/admin/qrcodes`);
  } catch (error) {
    console.error('Delete error:', error);
  }
}
