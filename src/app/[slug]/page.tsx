import prisma from '@/lib/prisma';
import { PublicPageClient } from '@/app/PublicPageClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TenantPage(props: any) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const { slug } = params;
  const source   = searchParams?.source   || 'direct';
  const campaign = searchParams?.campaign || null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug, active: true },
    include: { sellers: { where: { active: true }, orderBy: { clicks: 'desc' } } },
  });
  
  if (!tenant) notFound();

  try {
    await prisma.pageClickEvent.create({ data: { tenantId: tenant.id, source } });
    if (source === 'qr' && campaign) {
      await prisma.qrCode.updateMany({
        where: { slug: campaign, tenantId: tenant.id, active: true },
        data: { visits: { increment: 1 } },
      });
    }
  } catch (e) { console.error(e); }

  return (
    <PublicPageClient
      sellers={tenant.sellers}
      sourceProp={source}
      campaignProp={campaign || ''}
      tenantSlug={slug}
      tenantName={tenant.name}
    />
  );
}
