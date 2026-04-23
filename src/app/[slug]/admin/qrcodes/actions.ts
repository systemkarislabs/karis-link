'use server';
import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createQrCode(slug: string, formData: FormData) {
  const { tenantId } = await requireTenantAuth(slug);
  const name = formData.get('name') as string;
  const qrSlug = formData.get('slug') as string;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const finalUrl = `${baseUrl}/${slug}?source=qr&campaign=${qrSlug}`;

  await prisma.qrCode.create({
    data: { name, slug: qrSlug, url: finalUrl, tenantId }
  });
  revalidatePath(`/${slug}/admin/qrcodes`);
}

export async function deleteQrCode(slug: string, id: string) {
  const { tenantId } = await requireTenantAuth(slug);
  await prisma.qrCode.deleteMany({ where: { id, tenantId } });
  revalidatePath(`/${slug}/admin/qrcodes`);
}
