"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { verifyCredentials, createSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return { error: "Too many attempts. Please wait a few minutes." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await verifyCredentials(email, password);
  if (!user) return { error: "Invalid email or password." };

  await createSession(user);
  redirect("/admin");
}
