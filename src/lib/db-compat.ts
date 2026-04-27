import prisma from './prisma';

let tenantLogoColumnReady = false;

export async function ensureTenantLogoColumn() {
  if (tenantLogoColumnReady) return;

  await prisma.$executeRawUnsafe('ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "logo" TEXT');
  tenantLogoColumnReady = true;
}
