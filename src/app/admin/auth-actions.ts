"use server";

import { login, logout } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function handleLogout() {
  await logout();
  redirect("/");
}

export async function handleLogin(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username === "admin" && password === "admin") {
    await login(username);
    redirect("/admin");
  } else {
    return { error: "Credenciais inválidas" };
  }
}
