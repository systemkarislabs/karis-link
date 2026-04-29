import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { attachTrackingCookie } from '@/lib/tracking';
import { buildTenantPublicUrl } from '@/lib/public-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; bioSlug: string }> }
) {
  const { slug, bioSlug } = await params;
  const safeSlug = slug.trim().toLowerCase();
  const safeBioSlug = bioSlug.trim().toLowerCase();

  if (!/^[a-z0-9]{3,50}$/.test(safeSlug) || !/^[a-z0-9]{6,32}$/.test(safeBioSlug)) {
    return NextResponse.json({ error: 'Link da bio nao encontrado' }, { status: 404 });
  }

  try {
    let bioCampaign = await prisma.qrCode.findFirst({
      where: {
        slug: safeBioSlug,
        tenant: { slug: safeSlug },
      },
      select: {
        tenantId: true,
        tenant: { select: { slug: true } },
      },
    });

    if (!bioCampaign) {
      const matches = await prisma.qrCode.findMany({
        where: { slug: safeBioSlug },
        select: {
          tenantId: true,
          tenant: { select: { slug: true } },
        },
        take: 2,
      });

      if (matches.length === 1) {
        bioCampaign = matches[0];
      }
    }

    if (!bioCampaign) {
      return NextResponse.json({ error: 'Link da bio nao encontrado' }, { status: 404 });
    }

    const pageClickEvent = await prisma.pageClickEvent.create({
      data: {
        tenantId: bioCampaign.tenantId,
        source: 'bio',
        campaign: safeBioSlug,
      },
      select: {
        id: true,
      },
    });

    const redirectUrl = new URL(buildTenantPublicUrl(bioCampaign.tenant.slug));
    redirectUrl.searchParams.set('kl_track', '1');
    const response = NextResponse.redirect(redirectUrl);
    await attachTrackingCookie(response, pageClickEvent.id, bioCampaign.tenantId);

    return response;
  } catch (error) {
    console.error('Bio Redirect Error:', error);
    return NextResponse.json({ error: 'Erro ao redirecionar' }, { status: 500 });
  }
}
