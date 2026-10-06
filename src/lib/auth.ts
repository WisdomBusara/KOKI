import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import { UserModel } from "@/models/User";
import { COOKIE_NAME, signSession, verifySession, SESSION_MAX_AGE, type SessionPayload } from "./session";

export interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
}

export async function verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
  await dbConnect();
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
    .lean<{ _id: unknown; email: string; name?: string | null; passwordHash: string }>();
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: String(user._id), email: user.email, name: user.name };
}

export async function createSession(user: AdminUser): Promise<void> {
  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return token ? verifySession(token) : null;
}
