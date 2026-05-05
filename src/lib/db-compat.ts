import prisma from './prisma';

let tenantLogoColumnReady = false;
let tenantCitySupportReady = false;
let destinationLinksReady = false;

/** Executes a raw DDL statement, ignoring errors caused by objects that already exist. */
async function tryDDL(sql: string) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch (err) {
    // Log for visibility in server logs (Netlify / Vercel) without crashing the page.
    const msg = err instanceof Error ? err.message : String(err);
    // Suppress known-safe "already exists" class of errors; rethrow anything unexpected.
    const isSafeToIgnore =
      /already exists/i.test(msg) ||
      /column .* of relation .* already exists/i.test(msg) ||
      /duplicate column/i.test(msg) ||
      /relation .* already exists/i.test(msg) ||
      /index .* already exists/i.test(msg) ||
      /constraint .* of relation .* already exists/i.test(msg) ||
      /IF NOT EXISTS/.test(sql); // DDL with IF NOT EXISTS should never throw — if it does, treat as safe

    if (isSafeToIgnore) {
      console.warn('[db-compat] DDL skipped (already exists):', msg.slice(0, 120));
    } else {
      console.error('[db-compat] Unexpected DDL error:', msg.slice(0, 300));
      throw err;
    }
  }
}

export async function ensureTenantLogoColumn() {
  if (tenantLogoColumnReady) return;

  await tryDDL(`ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "logo" TEXT`);
  tenantLogoColumnReady = true;
}

export async function ensureTenantCitySupport() {
  if (tenantCitySupportReady) return;

  await tryDDL(`ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "cityGroupingEnabled" BOOLEAN NOT NULL DEFAULT false`);
  await tryDDL(`ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "adminEmail" TEXT`);

  await tryDDL(`
    CREATE TABLE IF NOT EXISTS "TenantCity" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "tenantId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TenantCity_pkey" PRIMARY KEY ("id")
    )
  `);

  await tryDDL(`ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "cityId" TEXT`);

  await tryDDL(`
    CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
      "id" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "tenantId" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
    )
  `);

  await tryDDL(`CREATE INDEX IF NOT EXISTS "TenantCity_tenantId_active_idx" ON "TenantCity"("tenantId", "active")`);
  await tryDDL(`CREATE UNIQUE INDEX IF NOT EXISTS "TenantCity_tenantId_name_key" ON "TenantCity"("tenantId", "name")`);
  await tryDDL(`CREATE INDEX IF NOT EXISTS "Seller_cityId_idx" ON "Seller"("cityId")`);
  await tryDDL(`ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0`);
  await tryDDL(`CREATE INDEX IF NOT EXISTS "Seller_tenantId_sortOrder_idx" ON "Seller"("tenantId", "sortOrder")`);
  await tryDDL(`CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash")`);
  await tryDDL(`CREATE INDEX IF NOT EXISTS "PasswordResetToken_tenantId_expiresAt_idx" ON "PasswordResetToken"("tenantId", "expiresAt")`);

  // Foreign keys — safe to skip if constraint already exists under any name.
  await tryDDL(`
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
  `);

  await tryDDL(`ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "schedule" TEXT`);

  tenantCitySupportReady = true;
}

export async function ensureDestinationLinksSupport() {
  if (destinationLinksReady) return;

  await tryDDL(`
    CREATE TABLE IF NOT EXISTS "DestinationLink" (
      "id"          TEXT NOT NULL,
      "name"        TEXT NOT NULL,
      "slug"        TEXT NOT NULL,
      "destination" TEXT NOT NULL,
      "tenantId"    TEXT NOT NULL,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DestinationLink_pkey" PRIMARY KEY ("id")
    )
  `);

  await tryDDL(`
    CREATE TABLE IF NOT EXISTS "DestinationClickEvent" (
      "id"        TEXT NOT NULL,
      "linkId"    TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DestinationClickEvent_pkey" PRIMARY KEY ("id")
    )
  `);

  await tryDDL(`CREATE UNIQUE INDEX IF NOT EXISTS "DestinationLink_tenantId_slug_key" ON "DestinationLink"("tenantId", "slug")`);
  await tryDDL(`CREATE INDEX IF NOT EXISTS "DestinationLink_tenantId_createdAt_idx" ON "DestinationLink"("tenantId", "createdAt" DESC)`);
  await tryDDL(`CREATE INDEX IF NOT EXISTS "DestinationClickEvent_linkId_createdAt_idx" ON "DestinationClickEvent"("linkId", "createdAt")`);

  await tryDDL(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DestinationLink_tenantId_fkey'
      ) THEN
        ALTER TABLE "DestinationLink"
        ADD CONSTRAINT "DestinationLink_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DestinationClickEvent_linkId_fkey'
      ) THEN
        ALTER TABLE "DestinationClickEvent"
        ADD CONSTRAINT "DestinationClickEvent_linkId_fkey"
        FOREIGN KEY ("linkId") REFERENCES "DestinationLink"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  destinationLinksReady = true;
}
