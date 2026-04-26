import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { attachTrackingCookie } from '@/lib/tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; qrSlug: string }> }
) {
  const { slug, qrSlug } = await params;

  try {
    const qrCode = await prisma.qrCode.findFirst({
      where: {
        slug: qrSlug,
        tenant: { slug },
      },
      select: {
        tenantId: true,
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: 'QR Code nao encontrado' }, { status: 404 });
    }

    const pageClickEvent = await prisma.pageClickEvent.create({
      data: {
        tenantId: qrCode.tenantId,
        source: 'qr',
        campaign: qrSlug,
      },
      select: {
        id: true,
      },
    });

    const response = NextResponse.redirect(new URL(`/${slug}`, request.url));
    await attachTrackingCookie(response, pageClickEvent.id, qrCode.tenantId);

    return response;
  } catch (error) {
    console.error('QR Redirect Error:', error);
    return NextResponse.json({ error: 'Erro ao redirecionar' }, { status: 500 });
  }
}
