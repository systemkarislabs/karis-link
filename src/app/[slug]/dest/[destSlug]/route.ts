import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDestinationLinksSupport } from '@/lib/db-compat';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function markNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; destSlug: string }> }
) {
  const { slug, destSlug } = await params;
  const safeSlug = slug.trim().toLowerCase();
  const safeDestSlug = destSlug.trim().toLowerCase();

  if (!/^[a-z0-9]{3,50}$/.test(safeSlug) || !/^[a-z0-9]{6,32}$/.test(safeDestSlug)) {
    return markNoStore(NextResponse.json({ error: 'Link nao encontrado' }, { status: 404 }));
  }

  try {
    await ensureDestinationLinksSupport();

    const link = await prisma.destinationLink.findFirst({
      where: {
        slug: safeDestSlug,
        tenant: { slug: safeSlug },
      },
      select: {
        id: true,
        destination: true,
      },
    });

    if (!link) {
      return markNoStore(NextResponse.json({ error: 'Link nao encontrado' }, { status: 404 }));
    }

    // Log the click asynchronously — don't let a logging failure block the redirect
    prisma.destinationClickEvent
      .create({ data: { linkId: link.id } })
      .catch((err) => console.error('[dest-route] Failed to log click:', err));

    return markNoStore(NextResponse.redirect(link.destination));
  } catch (error) {
    console.error('[dest-route] Redirect error:', error);
    return markNoStore(NextResponse.json({ error: 'Erro ao redirecionar' }, { status: 500 }));
  }
}
