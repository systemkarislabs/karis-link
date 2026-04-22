"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQrCode(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  const url = `${baseUrl}/?source=qr&campaign=${slug}`;

  await prisma.qrCode.create({
    data: { name, slug, url },
  });
  revalidatePath("/admin/qrcodes");
}

export async function deleteQrCode(id: string) {
  await prisma.qrCode.delete({ where: { id } });
  revalidatePath("/admin/qrcodes");
}

export async function toggleQrCode(id: string, active: boolean) {
  await prisma.qrCode.update({ where: { id }, data: { active } });
  revalidatePath("/admin/qrcodes");
}

export async function getQrCodes() {
  return prisma.qrCode.findMany({ orderBy: { createdAt: "desc" } });
}
