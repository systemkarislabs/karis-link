import prisma from '@/lib/prisma';
import { clearTrackingCookieFromResponse, getTrackingCookie } from '@/lib/tracking';
import { NextResponse } from 'next/server';

export async function handleSellerRedirect(sellerId: string) {
  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
  }

  try {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        phone: true,
        tenantId: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const sanitizedPhone = seller.phone.replace(/[^\d]/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 20) {
      return NextResponse.json({ error: 'Seller phone is invalid' }, { status: 400 });
    }

    const tracking = await getTrackingCookie();
    let source = 'direct';
    let campaign: string | null = null;

    if (tracking?.tenantId === seller.tenantId) {
      const pageClickEvent = await prisma.pageClickEvent.findFirst({
        where: {
          id: tracking.pageClickId,
          tenantId: seller.tenantId,
        },
        select: {
          source: true,
          campaign: true,
        },
      });

      if (pageClickEvent) {
        source = pageClickEvent.source || 'direct';
        campaign = pageClickEvent.campaign || null;
      }
    }

    await prisma.$transaction([
      prisma.seller.update({
        where: { id: sellerId },
        data: { clicks: { increment: 1 } },
      }),
      prisma.sellerClickEvent.create({
        data: {
          sellerId,
          source,
          campaign,
        },
      }),
    ]);

    const message = encodeURIComponent(`Olá ${seller.name}, vim pelo link da plataforma!`);
    const waUrl = `https://wa.me/${sanitizedPhone}?text=${message}`;
    const response = NextResponse.redirect(waUrl);

    clearTrackingCookieFromResponse(response);

    return response;
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
