import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get("sellerId");
  const source = searchParams.get("source") || "direct";
  const campaign = searchParams.get("campaign") || null;

  if (!sellerId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });

    if (!seller) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Incrementa cliques e registra evento com origem
    await prisma.$transaction([
      prisma.seller.update({
        where: { id: sellerId },
        data: { clicks: seller.clicks + 1 },
      }),
      prisma.sellerClickEvent.create({
        data: { sellerId: seller.id, source },
      }),
    ]);

    // Se veio de QR Code, registra o clique no QR também
    if (source === "qr" && campaign) {
      await prisma.qrCode.updateMany({
        where: { slug: campaign, active: true },
        data: { clicks: { increment: 1 } },
      });
    }

    const cleanNumber = seller.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent("Olá, vim através do link!");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;

    return NextResponse.redirect(whatsappUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
