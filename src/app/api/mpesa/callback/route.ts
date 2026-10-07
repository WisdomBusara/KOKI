import { NextResponse } from "next/server";
import { markOrderPaidByCheckoutId, markOrderFailedByCheckoutId } from "@/lib/orders";

export const runtime = "nodejs";

interface CallbackItem {
  Name: string;
  Value?: string | number;
}

/** Safaricom posts the STK result here. Always answer 200 so it doesn't retry. */
export async function POST(req: Request) {
  // Only Safaricom knows the registered callback URL. Requiring a secret token on
  // it stops forged "paid" callbacks from marking orders paid without payment.
  // Register the callback as .../api/mpesa/callback?token=<MPESA_CALLBACK_SECRET>.
  const secret = process.env.MPESA_CALLBACK_SECRET;
  if (secret && new URL(req.url).searchParams.get("token") !== secret) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

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
