'use server';
import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createQrCode(formData: FormData) {
  const slug = formData.get('slug') as string;
  const { tenantId } = await requireTenantAuth(slug);
  const name = formData.get('name') as string;
  const qrSlug = formData.get('qrSlug') as string;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const finalUrl = `${baseUrl}/${slug}?source=qr&campaign=${qrSlug}`;

  await prisma.qrCode.create({
    data: { name, slug: qrSlug, url: finalUrl, tenantId }
  });

  revalidatePath(`/${slug}/admin/qrcodes`);
  redirect(`/${slug}/admin/qrcodes`);
}

export async function deleteQrCode(formData: FormData) {
  const slug = formData.get('slug') as string;
  const id = formData.get('id') as string;
  const { tenantId } = await requireTenantAuth(slug);
  await prisma.qrCode.deleteMany({ where: { id, tenantId } });
  revalidatePath(`/${slug}/admin/qrcodes`);
  redirect(`/${slug}/admin/qrcodes`);
}
