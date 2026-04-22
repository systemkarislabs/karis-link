import prisma from "@/lib/prisma";
import QrCodesClient from "./QrCodesClient";

export default async function QrCodesPage() {
  const qrCodes = await prisma.qrCode.findMany({ orderBy: { createdAt: "desc" } });
  return <QrCodesClient qrCodes={qrCodes} />;
}
