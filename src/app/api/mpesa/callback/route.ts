import { NextResponse } from "next/server";
import { markOrderPaidByCheckoutId, markOrderFailedByCheckoutId } from "@/lib/orders";

export const runtime = "nodejs";

interface CallbackItem {
  Name: string;
  Value?: string | number;
}

/** Safaricom posts the STK result here. Always answer 200 so it doesn't retry. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const cb = body?.Body?.stkCallback;
    if (cb?.CheckoutRequestID) {
      if (cb.ResultCode === 0) {
        const items: CallbackItem[] = cb.CallbackMetadata?.Item ?? [];
        const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
        await markOrderPaidByCheckoutId(cb.CheckoutRequestID, receipt != null ? String(receipt) : null);
      } else {
        await markOrderFailedByCheckoutId(cb.CheckoutRequestID, String(cb.ResultDesc ?? "Payment failed"));
      }
    }
  } catch {
    // swallow — we still acknowledge below
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
