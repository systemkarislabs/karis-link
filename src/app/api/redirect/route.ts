import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');
  const source = searchParams.get('source');
  const campaign = searchParams.get('campaign');

  if (!sellerId) return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });

  try {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });

    // Registra o evento de clique com a origem e campanha
    await prisma.$transaction([
      prisma.seller.update({ where: { id: sellerId }, data: { clicks: { increment: 1 } } }),
      prisma.sellerClickEvent.create({ 
        data: { 
          sellerId, 
          source: source || 'direct', 
          campaign: campaign || null 
        } 
      }),
    ]);

    // Redireciona para o WhatsApp
    const waUrl = `https://wa.me/${seller.phone}?text=Olá ${seller.name}, vim pelo link da plataforma!`;
    return NextResponse.redirect(waUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
