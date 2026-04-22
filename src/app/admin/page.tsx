import { redirect } from "next/navigation";
import { getSession, logout } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DashboardView from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch data
  const sellers = await prisma.seller.findMany({
    include: {
      _count: {
        select: { events: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const pageViewsCount = await prisma.pageClickEvent.count();
  const sellerClicksCount = await prisma.sellerClickEvent.count();

  // For charts, we'll aggregate by date in the client or server.
  // Let's get all events to aggregate. In a real app, you'd group by in Prisma.
  // SQLite doesn't have great date grouping functions natively in Prisma yet, 
  // so we'll fetch recent events and group in JS.
  
  const recentDays = new Date();
  recentDays.setDate(recentDays.getDate() - 7);

  const rawPageEvents = await prisma.pageClickEvent.findMany({
    where: { createdAt: { gte: recentDays } },
    select: { createdAt: true }
  });

  const rawSellerEvents = await prisma.sellerClickEvent.findMany({
    where: { createdAt: { gte: recentDays } },
    select: { createdAt: true, seller: { select: { name: true } } }
  });

  // Prepare data for the client component
  const data = {
    sellers: sellers.map(s => ({
      id: s.id,
      name: s.name,
      whatsapp: s.whatsapp,
      photoUrl: s.photoUrl,
      active: s.active,
      clicks: s._count && typeof s._count.events === 'number' ? s._count.events : s.clicks,
    })),
    pageViewsCount,
    sellerClicksCount,
    rawPageEvents,
    rawSellerEvents,
  };

  return <DashboardView data={data} />;
}
