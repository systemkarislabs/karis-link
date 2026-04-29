'use server';

import { requireTenantAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { ensureTenantCitySupport } from '@/lib/db-compat';
import { validateImageBuffer, validateImageDataUrl, validateImageFile } from '@/lib/image-validation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function assertValidTenantSlug(slug: string) {
  if (!/^[a-z0-9]{3,50}$/.test(slug)) {
    throw new Error('Empresa invalida.');
  }
}

function assertValidRecordId(id: string, label: string) {
  if (!id || id.length > 128 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`${label} invalido.`);
  }
}

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
    validateImageBuffer(buffer, imageFile.type);
    return `data:${imageFile.type};base64,${buffer.toString('base64')}`;
  }

  return null;
}

async function resolveSellerCity(tenantId: string, cityId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { cityGroupingEnabled: true },
  });

  if (!tenant?.cityGroupingEnabled) {
    return null;
  }

  if (!cityId) {
    throw new Error('Selecione a cidade do vendedor.');
  }

  assertValidRecordId(cityId, 'Cidade');

  const city = await prisma.tenantCity.findFirst({
    where: { id: cityId, tenantId, active: true },
    select: { id: true },
  });

  if (!city) {
    throw new Error('Selecione uma cidade ativa da empresa.');
  }

  return city.id;
}

export async function createSeller(formData: FormData) {
  await ensureTenantCitySupport();

  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const cityId = String(formData.get('cityId') || '').trim();
  const imageFile = formData.get('image') as File | null;
  const imageDataUrl = String(formData.get('imageDataUrl') || '').trim();

  assertValidTenantSlug(slug);
  const { tenantId } = await requireTenantAuth(slug);

  validateSellerFields(name, phone);
  const imageBase64 = await resolveSellerImage(imageDataUrl, imageFile);
  const resolvedCityId = await resolveSellerCity(tenantId, cityId);

  const seller = await prisma.seller.create({
    data: {
      name,
      phone,
      image: imageBase64,
      tenantId,
      cityId: resolvedCityId,
    },
    select: { id: true },
  });

  await logAuditEvent({
    event: 'seller_create',
    actor: name,
    tenantId,
    metadata: { sellerId: seller.id },
  });

  revalidatePath(`/${slug}/admin/vendedores`);
  revalidatePath(`/${slug}`);
  redirect(`/${slug}/admin/vendedores`);
}

export async function deleteSeller(formData: FormData) {
  const id = String(formData.get('id') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();

  assertValidTenantSlug(slug);
  assertValidRecordId(id, 'Vendedor');
  const { tenantId } = await requireTenantAuth(slug);

  try {
    await prisma.seller.deleteMany({ where: { id, tenantId } });
    await logAuditEvent({
      event: 'seller_delete',
      tenantId,
      metadata: { sellerId: id },
    });
    revalidatePath(`/${slug}/admin/vendedores`);
    revalidatePath(`/${slug}`);
  } catch (error) {
    console.error('Delete error:', error);
  }
}

export async function updateSeller(formData: FormData) {
  await ensureTenantCitySupport();

  const id = String(formData.get('id') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const cityId = String(formData.get('cityId') || '').trim();
  const imageFile = formData.get('image') as File | null;
  const imageDataUrl = String(formData.get('imageDataUrl') || '').trim();
  const removeImage = String(formData.get('removeImage') || '') === 'on';

  assertValidTenantSlug(slug);
  assertValidRecordId(id, 'Vendedor');
  const { tenantId } = await requireTenantAuth(slug);

  validateSellerFields(name, phone);
  const resolvedCityId = await resolveSellerCity(tenantId, cityId);

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
      cityId: resolvedCityId,
    },
  });

  await logAuditEvent({
    event: 'seller_update',
    actor: name,
    tenantId,
    metadata: { sellerId: id },
  });

  revalidatePath(`/${slug}/admin/vendedores`);
  revalidatePath(`/${slug}`);
  redirect(`/${slug}/admin/vendedores`);
}
