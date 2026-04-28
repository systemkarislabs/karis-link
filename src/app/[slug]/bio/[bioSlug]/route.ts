import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { attachTrackingCookie } from '@/lib/tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; bioSlug: string }> }
) {
  const { slug, bioSlug } = await params;

  try {
    let bioCampaign = await prisma.qrCode.findFirst({
      where: {
        slug: bioSlug,
        tenant: { slug },
      },
      select: {
        tenantId: true,
        tenant: { select: { slug: true } },
      },
    });

    if (!bioCampaign) {
      const matches = await prisma.qrCode.findMany({
        where: { slug: bioSlug },
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
        campaign: bioSlug,
      },
      select: {
        id: true,
      },
    });

    const redirectUrl = new URL(`/${bioCampaign.tenant.slug}`, request.url);
    redirectUrl.searchParams.set('kl_track', '1');
    const response = NextResponse.redirect(redirectUrl);
    await attachTrackingCookie(response, pageClickEvent.id, bioCampaign.tenantId);

    return response;
  } catch (error) {
    console.error('Bio Redirect Error:', error);
    return NextResponse.json({ error: 'Erro ao redirecionar' }, { status: 500 });
  }
}
