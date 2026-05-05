import prisma from '@/lib/prisma';
import { clearTrackingCookieFromResponse, getTrackingCookie } from '@/lib/tracking';
import { NextResponse } from 'next/server';

// ─── Notifica o Karis Atende sobre o clique (fire-and-forget) ───
async function notifyKarisAtende(
  sellerPhone: string,
  sellerId: string,
  sellerName: string,
  tenantSlug: string,
  source: string | null,
  campaign: string | null
) {
  const webhookUrl = process.env.KARIS_ATENDE_WEBHOOK_URL;
  const secret = process.env.KARIS_LINK_SECRET;
  if (!webhookUrl) return;

  try {
    await fetch(`${webhookUrl}/api/webhooks/link-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'seller_click',
        sellerPhone,
        sellerId,
        sellerName,
        tenantSlug,
        source,
        campaign,
        secret,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000), // timeout 5s
    });
  } catch {
    // Nunca deixa o redirect falhar por causa do webhook
  }
}

function markNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export async function handleSellerRedirect(sellerId: string, allowTracking = false) {
  if (!sellerId || sellerId.length > 128 || !/^[A-Za-z0-9_-]+$/.test(sellerId)) {
    return markNoStore(NextResponse.json({ error: 'Missing sellerId' }, { status: 400 }));
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
      return markNoStore(NextResponse.json({ error: 'Seller not found' }, { status: 404 }));
    }

    const sanitizedPhone = seller.phone.replace(/[^\d]/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 20) {
      return markNoStore(NextResponse.json({ error: 'Seller phone is invalid' }, { status: 400 }));
    }

    const tracking = allowTracking ? await getTrackingCookie() : null;
    let source: 'qr' | 'bio' | null = null;
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

      if (pageClickEvent?.source === 'qr' || pageClickEvent?.source === 'bio') {
        source = pageClickEvent.source;
        campaign = pageClickEvent.campaign || null;
      }
    }

    const message = encodeURIComponent(`Ola ${seller.name}, vim pelo link da plataforma!`);
    const waUrl = `https://wa.me/${sanitizedPhone}?text=${message}`;
    const response = markNoStore(NextResponse.redirect(waUrl));

    if (source) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: seller.tenantId },
        select: { slug: true },
      });

      await prisma.$transaction([
        prisma.seller.update({
          where: { id: sellerId },
          data: { clicks: { increment: 1 } },
        }),
        prisma.sellerClickEvent.create({
          data: { sellerId, source, campaign },
        }),
      ]);

      // Notifica Karis Atende para atribuição de campanha (fire-and-forget)
      void notifyKarisAtende(
        sanitizedPhone,
        seller.id,
        seller.name,
        tenant?.slug ?? '',
        source,
        campaign
      );

      clearTrackingCookieFromResponse(response);
    }

    return response;
  } catch (error) {
    console.error('Redirect error:', error);
    return markNoStore(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
  }
}
