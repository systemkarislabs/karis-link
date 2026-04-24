import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicTenantClient from './PublicTenantClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PublicTenantPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string; campaign?: string }>;
};

export default async function PublicTenantPage({ params, searchParams }: PublicTenantPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams.slug;
  const source = resolvedSearchParams.source || 'direct';
  const campaign = resolvedSearchParams.campaign || 'none';

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  await prisma.pageClickEvent.create({
    data: {
      tenantId: tenant.id,
      source,
      campaign,
    },
  });

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
      sellers={sellers.map((seller) => ({
        id: seller.id,
        name: seller.name,
        image: seller.image,
      }))}
      source={source}
      campaign={campaign}
      isAdminLogged={session?.slug === slug}
      recoveryEnabled={true}
    />
  );
}
