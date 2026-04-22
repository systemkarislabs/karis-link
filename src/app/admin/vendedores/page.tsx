import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import VendedoresClient from "./VendedoresClient";

export const dynamic = "force-dynamic";

export default async function AdminVendedores() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch data
  const sellers = await prisma.seller.findMany({
    include: {
      _count: {
        select: { events: true }
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const data = sellers.map(s => ({
    id: s.id,
    name: s.name,
    whatsapp: s.whatsapp,
    photoUrl: s.photoUrl,
    active: s.active,
    clicks: s._count && typeof s._count.events === 'number' ? s._count.events : s.clicks,
    lastClickAt: s.events && s.events.length > 0 ? s.events[0].createdAt : null,
  }));

  return <VendedoresClient sellers={data} />;
}
