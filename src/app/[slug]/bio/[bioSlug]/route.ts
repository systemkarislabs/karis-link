import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; bioSlug: string }> }
) {
  const { slug, bioSlug } = await params;

  try {
    const bioCampaign = await prisma.qrCode.findFirst({
      where: {
        slug: bioSlug,
        tenant: { slug },
      },
    });

    if (!bioCampaign) {
      return NextResponse.json({ error: 'Link da bio nao encontrado' }, { status: 404 });
    }

    const targetUrl = new URL(`/${slug}`, request.url);
    targetUrl.searchParams.set('source', 'bio');
    targetUrl.searchParams.set('campaign', bioSlug);

    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error('Bio Redirect Error:', error);
    return NextResponse.json({ error: 'Erro ao redirecionar' }, { status: 500 });
  }
}
