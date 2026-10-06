import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/session";

// Next 16 renamed the `middleware` convention to `proxy`. Gates /admin/*.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page itself must stay public.
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
