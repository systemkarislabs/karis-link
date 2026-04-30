import { getTenantSession } from '@/lib/auth';
import { ensureTenantCitySupport, ensureTenantLogoColumn } from '@/lib/db-compat';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicTenantClient from './PublicTenantClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PublicTenantPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ kl_track?: string }>;
};

export async function generateMetadata({ params }: Pick<PublicTenantPageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true },
  });

  return {
    title: tenant ? `${tenant.name} - Especialistas` : 'Karis Link',
  };
}

export default async function PublicTenantPage({ params, searchParams }: PublicTenantPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const isTrackedCampaignVisit = resolvedSearchParams?.kl_track === '1';

  await ensureTenantLogoColumn();
  await ensureTenantCitySupport();

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      cityGroupingEnabled: true,
    },
  });
  if (!tenant) notFound();

  const [sellers, session] = await Promise.all([
    prisma.seller.findMany({
      where: tenant.cityGroupingEnabled ? { tenantId: tenant.id, city: { active: true } } : { tenantId: tenant.id },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        image: true,
        city: { select: { name: true } },
      },
    }),
    getTenantSession(),
  ]);

  return (
    <PublicTenantClient
      slug={slug}
      tenantName={tenant.name}
      tenantLogo={tenant.logo}
      hasTrackingContext={isTrackedCampaignVisit}
      sellers={sellers.map((seller) => ({
        id: seller.id,
        name: seller.name,
        image: seller.image,
        cityName: seller.city?.name ?? null,
      }))}
      cityGroupingEnabled={tenant.cityGroupingEnabled}
      isAdminLogged={session?.slug === slug}
    />
  );
}
