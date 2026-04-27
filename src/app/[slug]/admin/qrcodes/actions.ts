'use server';

import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { requireTenantAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateCampaignCode(length = 8) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

export async function createQrCode(formData: FormData) {
  const slug = String(formData.get('tenantSlug') || '').trim().toLowerCase();
  const name = String(formData.get('name') || '').trim();
  const channel = String(formData.get('channel') || 'qr').trim().toLowerCase();
  const { tenantId } = await requireTenantAuth(slug);
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const channelPath = channel === 'bio' ? 'bio' : 'go';

  if (!name) {
    throw new Error('Nome da campanha e obrigatorio.');
  }

  if (name.length > 80) {
    throw new Error('O nome da campanha deve ter no maximo 80 caracteres.');
  }

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL nao esta configurado para gerar os links publicos.');
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const campaignCode = generateCampaignCode();
    const finalUrl = `${baseUrl}/${slug}/${channelPath}/${campaignCode}`;

    try {
      await prisma.qrCode.create({
        data: {
          name,
          slug: campaignCode,
          url: finalUrl,
          tenantId,
        },
      });

      revalidatePath(`/${slug}/admin/qrcodes`);
      redirect(`/${slug}/admin/qrcodes`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        continue;
      }

      throw error;
    }
  }

  throw new Error('Nao foi possivel gerar um link unico para esta campanha. Tente novamente.');
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
