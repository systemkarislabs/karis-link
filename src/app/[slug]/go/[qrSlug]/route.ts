import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; qrSlug: string }> }
) {
  const { slug, qrSlug } = await params;

  try {
    // 1. Procuramos o QR Code no banco de dados
    const qrCode = await prisma.qrCode.findFirst({
      where: { 
        slug: qrSlug,
        tenant: { slug: slug }
      }
    });

    if (!qrCode) {
      return NextResponse.json({ error: 'QR Code não encontrado' }, { status: 404 });
    }

    // 2. Redirecionamos para a página principal da empresa com os parâmetros de rastreamento
    // Isso garante que o Scan seja contabilizado
    const targetUrl = new URL(`/${slug}`, request.url);
    targetUrl.searchParams.set('source', 'qr');
    targetUrl.searchParams.set('campaign', qrSlug);

    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error('QR Redirect Error:', error);
    return NextResponse.json({ error: 'Erro ao redirecionar' }, { status: 500 });
  }
}
