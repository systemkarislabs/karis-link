import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { attachTrackingCookie } from '@/lib/tracking';
import { buildTenantPublicUrl } from '@/lib/public-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; qrSlug: string }> }
) {
  const { slug, qrSlug } = await params;
  const safeSlug = slug.trim().toLowerCase();
  const safeQrSlug = qrSlug.trim().toLowerCase();

  if (!/^[a-z0-9]{3,50}$/.test(safeSlug) || !/^[a-z0-9]{6,32}$/.test(safeQrSlug)) {
    return NextResponse.json({ error: 'QR Code nao encontrado' }, { status: 404 });
  }

  try {
    let qrCode = await prisma.qrCode.findFirst({
      where: {
        slug: safeQrSlug,
        tenant: { slug: safeSlug },
      },
      select: {
        tenantId: true,
        tenant: { select: { slug: true } },
      },
    });

    if (!qrCode) {
      const matches = await prisma.qrCode.findMany({
        where: { slug: safeQrSlug },
        select: {
          tenantId: true,
          tenant: { select: { slug: true } },
        },
        take: 2,
      });

      if (matches.length === 1) {
        qrCode = matches[0];
      }
    }

    if (!qrCode) {
      return NextResponse.json({ error: 'QR Code nao encontrado' }, { status: 404 });
    }

    const pageClickEvent = await prisma.pageClickEvent.create({
      data: {
        tenantId: qrCode.tenantId,
        source: 'qr',
        campaign: safeQrSlug,
      },
      select: {
        id: true,
      },
    });

    const redirectUrl = new URL(buildTenantPublicUrl(qrCode.tenant.slug));
    redirectUrl.searchParams.set('kl_track', '1');
    const response = NextResponse.redirect(redirectUrl);
    await attachTrackingCookie(response, pageClickEvent.id, qrCode.tenantId);

    return response;
  } catch (error) {
    console.error('QR Redirect Error:', error);
    return NextResponse.json({ error: 'Erro ao redirecionar' }, { status: 500 });
  }
}
