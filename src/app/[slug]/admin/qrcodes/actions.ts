'use server';

import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { requireTenantAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { ensureDestinationLinksSupport } from '@/lib/db-compat';
import prisma from '@/lib/prisma';
import { buildCampaignUrl, buildDestUrl } from '@/lib/public-url';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateCampaignCode(length = 8) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

function assertValidTenantSlug(slug: string) {
  if (!/^[a-z0-9]{3,50}$/.test(slug)) {
    throw new Error('Empresa invalida.');
  }
}

export async function createQrCode(formData: FormData) {
  const slug = String(formData.get('tenantSlug') || '').trim().toLowerCase();
  const name = String(formData.get('name') || '').trim();
  const channel = String(formData.get('channel') || 'qr').trim().toLowerCase();
  assertValidTenantSlug(slug);
  const { tenantId } = await requireTenantAuth(slug);
  const normalizedChannel = channel === 'bio' ? 'bio' : 'qr';

  if (!name) {
    throw new Error('Nome da campanha e obrigatorio.');
  }

  if (name.length > 80) {
    throw new Error('O nome da campanha deve ter no maximo 80 caracteres.');
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const campaignCode = generateCampaignCode();
    const finalUrl = buildCampaignUrl(slug, normalizedChannel, campaignCode);

    try {
      await prisma.qrCode.create({
        data: {
          name,
          slug: campaignCode,
          url: finalUrl,
          tenantId,
        },
      });

      await logAuditEvent({
        event: 'qrcode_create',
        tenantId,
        metadata: { channel: normalizedChannel, campaignCode },
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
  assertValidTenantSlug(slug);
  const { tenantId } = await requireTenantAuth(slug);

  if (!id || id.length > 128) {
    throw new Error('Campanha invalida.');
  }

  try {
    await prisma.qrCode.deleteMany({ where: { id, tenantId } });
    await logAuditEvent({
      event: 'qrcode_delete',
      tenantId,
      metadata: { id },
    });
    revalidatePath(`/${slug}/admin/qrcodes`);
  } catch (error) {
    console.error('Delete error:', error);
  }
}

// ─── Destination Links ────────────────────────────────────────────────────────

function assertValidDestination(url: string) {
  if (!url) throw new Error('Informe a URL de destino.');
  if (url.length > 2048) throw new Error('URL de destino muito longa (max 2048 caracteres).');
  if (!/^https?:\/\/.+/i.test(url)) throw new Error('A URL de destino deve começar com http:// ou https://');
}

export async function createDestinationLink(formData: FormData) {
  const slug = String(formData.get('tenantSlug') || '').trim().toLowerCase();
  const name = String(formData.get('name') || '').trim();
  const destination = String(formData.get('destination') || '').trim();

  assertValidTenantSlug(slug);
  const { tenantId } = await requireTenantAuth(slug);

  if (!name) throw new Error('Nome do link é obrigatorio.');
  if (name.length > 80) throw new Error('O nome deve ter no maximo 80 caracteres.');
  assertValidDestination(destination);

  await ensureDestinationLinksSupport();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const destSlug = generateCampaignCode();
    const shortUrl = buildDestUrl(slug, destSlug);

    try {
      await prisma.destinationLink.create({
        data: { name, slug: destSlug, destination, tenantId },
      });

      await logAuditEvent({
        event: 'destination_link_create',
        tenantId,
        metadata: { destSlug, shortUrl },
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

  throw new Error('Nao foi possivel gerar um link unico. Tente novamente.');
}

export async function deleteDestinationLink(formData: FormData) {
  const id = String(formData.get('id') || '');
  const slug = String(formData.get('slug') || '').trim().toLowerCase();

  assertValidTenantSlug(slug);
  const { tenantId } = await requireTenantAuth(slug);

  if (!id || id.length > 128) throw new Error('Link invalido.');

  await ensureDestinationLinksSupport();

  try {
    await prisma.destinationLink.deleteMany({ where: { id, tenantId } });
    await logAuditEvent({
      event: 'destination_link_delete',
      tenantId,
      metadata: { id },
    });
    revalidatePath(`/${slug}/admin/qrcodes`);
  } catch (error) {
    console.error('Delete destination link error:', error);
  }
}
