import { getTenantSession } from '@/lib/auth';
import { ensureTenantLogoColumn } from '@/lib/db-compat';
import prisma from '@/lib/prisma';
import { getTrackingCookie } from '@/lib/tracking';
import { notFound } from 'next/navigation';
import PublicTenantClient from './PublicTenantClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PublicTenantPageProps = {
  params: Promise<{ slug: string }>;
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

export default async function PublicTenantPage({ params }: PublicTenantPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  await ensureTenantLogoColumn();

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
    },
  });
  if (!tenant) notFound();

  const activeTracking = await getTrackingCookie();

  if (!activeTracking || activeTracking.tenantId !== tenant.id) {
    await prisma.pageClickEvent.create({
      data: {
        tenantId: tenant.id,
        source: 'direct',
        campaign: null,
      },
    });
  }

  const [sellers, session] = await Promise.all([
    prisma.seller.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' },
    }),
    getTenantSession(),
  ]);

  return (
    <PublicTenantClient
      slug={slug}
      tenantName={tenant.name}
      tenantLogo={tenant.logo}
      sellers={sellers.map((seller) => ({
        id: seller.id,
        name: seller.name,
        image: seller.image,
      }))}
      isAdminLogged={session?.slug === slug}
    />
  );
}
