import { NextResponse } from "next/server";
import { reconcileOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  // Reconciles via STK Query if the callback is late, so orders don't get stuck pending.
  const status = await reconcileOrderStatus(id);
  if (!status) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(status);
}
