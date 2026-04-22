import prisma from "@/lib/prisma";
import { PublicPageClient } from "./PublicPageClient";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { source?: string; campaign?: string } }) {
  const source = searchParams?.source || "direct";
  const campaign = searchParams?.campaign || null;

  const sellers = await prisma.seller.findMany({
    where: { active: true },
    orderBy: { clicks: "desc" },
  });

  // Registra a visualização da página com a origem
  try {
    await prisma.pageClickEvent.create({ data: { source } });

    // Se veio de um QR Code, atualiza as visitas do QR
    if (source === "qr" && campaign) {
      await prisma.qrCode.updateMany({
        where: { slug: campaign, active: true },
        data: { visits: { increment: 1 } },
      });
    }
  } catch (e) {
    console.error("Erro ao registrar page view:", e);
  }

  return <PublicPageClient sellers={sellers} sourceProp={source} campaignProp={campaign || ""} />;
}
