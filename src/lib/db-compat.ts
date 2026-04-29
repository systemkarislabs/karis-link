import prisma from './prisma';

let tenantLogoColumnReady = false;
let tenantCitySupportReady = false;

export async function ensureTenantLogoColumn() {
  if (tenantLogoColumnReady) return;

  await prisma.$executeRaw`ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "logo" TEXT`;
  tenantLogoColumnReady = true;
}

export async function ensureTenantCitySupport() {
  if (tenantCitySupportReady) return;

  await prisma.$executeRaw`ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "cityGroupingEnabled" BOOLEAN NOT NULL DEFAULT false`;
  await prisma.$executeRaw`ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "adminEmail" TEXT`;
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "TenantCity" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "tenantId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TenantCity_pkey" PRIMARY KEY ("id")
    )
  `;
  await prisma.$executeRaw`ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "cityId" TEXT`;
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
      "id" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "tenantId" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
    )
  `;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "TenantCity_tenantId_active_idx" ON "TenantCity"("tenantId", "active")`;
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "TenantCity_tenantId_name_key" ON "TenantCity"("tenantId", "name")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Seller_cityId_idx" ON "Seller"("cityId")`;
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash")`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "PasswordResetToken_tenantId_expiresAt_idx" ON "PasswordResetToken"("tenantId", "expiresAt")`;
  await prisma.$executeRaw`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TenantCity_tenantId_fkey'
      ) THEN
        ALTER TABLE "TenantCity"
        ADD CONSTRAINT "TenantCity_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Seller_cityId_fkey'
      ) THEN
        ALTER TABLE "Seller"
        ADD CONSTRAINT "Seller_cityId_fkey"
        FOREIGN KEY ("cityId") REFERENCES "TenantCity"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PasswordResetToken_tenantId_fkey'
      ) THEN
        ALTER TABLE "PasswordResetToken"
        ADD CONSTRAINT "PasswordResetToken_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$;
  `;

  tenantCitySupportReady = true;
}
