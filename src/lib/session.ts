import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Edge-safe (no next/headers, no server-only): shared by proxy.ts and lib/auth.ts.
export const COOKIE_NAME = "koki_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export interface SessionPayload extends JWTPayload {
  email: string;
  name?: string;
}

export async function signSession(user: { sub: string; email: string; name?: string | null }): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name ?? undefined })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE;
