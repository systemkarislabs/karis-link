import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId   = searchParams.get('sellerId');
  const tenantSlug = searchParams.get('tenantSlug') || '';
  const source     = searchParams.get('source')     || 'direct';
  const campaign   = searchParams.get('campaign')   || null;

  if (!sellerId) return NextResponse.redirect(new URL('/', request.url));

  try {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) return NextResponse.redirect(new URL('/', request.url));

    await prisma.$transaction([
      prisma.seller.update({ where: { id: sellerId }, data: { clicks: { increment: 1 } } }),
      prisma.sellerClickEvent.create({ data: { sellerId, source } }),
    ]);

    if (source === 'qr' && campaign && seller.tenantId) {
      await prisma.qrCode.updateMany({
        where: { slug: campaign, tenantId: seller.tenantId, active: true },
        data: { clicks: { increment: 1 } },
      });
    }

    const num = seller.whatsapp.replace(/\D/g, '');
    const msg = encodeURIComponent('Olá, vim através do link!');
    return NextResponse.redirect(`https://wa.me/${num}?text=${msg}`);
  } catch (e) {
    console.error(e);
    const fallback = tenantSlug ? `/${tenantSlug}` : '/';
    return NextResponse.redirect(new URL(fallback, request.url));
  }
}
