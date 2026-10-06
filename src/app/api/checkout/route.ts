import { NextResponse } from "next/server";
import { createPendingOrder, attachCheckout, cancelOrder, type CheckoutItemInput } from "@/lib/orders";
import { initiateStkPush, normalizePhone } from "@/lib/mpesa";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let orderId: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? "").trim();
    const phone = normalizePhone(String(body?.phone ?? ""));
    const items: CheckoutItemInput[] = Array.isArray(body?.items)
      ? body.items.map((i: { id: unknown; quantity: unknown }) => ({ id: String(i.id), quantity: Number(i.quantity) }))
      : [];

    if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Enter a valid Safaricom number, e.g. 0712 345 678." }, { status: 400 });

    const created = await createPendingOrder(items, { name, phone });
    orderId = created.orderId;

    const stk = await initiateStkPush({
      amount: created.total,
      phone,
      accountRef: "KOKI",
      description: "KOKI order",
    });
    await attachCheckout(created.orderId, stk);

    return NextResponse.json({ orderId: created.orderId, message: stk.customerMessage });
  } catch (err) {
    if (orderId) await cancelOrder(orderId, err instanceof Error ? err.message : "Checkout failed").catch(() => {});
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed. Please try again." },
      { status: 400 }
    );
  }
}
