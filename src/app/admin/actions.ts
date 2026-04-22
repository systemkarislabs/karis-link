"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSeller(formData: FormData) {
  const name = formData.get("name") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const photoUrl = formData.get("photoUrl") as string;
  const active = formData.get("active") === "true";

  if (!name || !whatsapp) {
    throw new Error("Nome e WhatsApp são obrigatórios");
  }

  await prisma.seller.create({
    data: {
      name,
      whatsapp,
      photoUrl: photoUrl || null,
      active
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateSeller(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const photoUrl = formData.get("photoUrl") as string;
  const active = formData.get("active") === "true";

  if (!id || !name || !whatsapp) {
    throw new Error("ID, Nome e WhatsApp são obrigatórios");
  }

  await prisma.seller.update({
    where: { id },
    data: {
      name,
      whatsapp,
      photoUrl: photoUrl || null,
      active
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteSeller(id: string) {
  await prisma.seller.delete({
    where: { id },
  });

  revalidatePath("/admin");
  revalidatePath("/");
}
