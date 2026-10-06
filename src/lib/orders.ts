import "server-only";
import { Types } from "mongoose";
import { dbConnect } from "./db";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";
import { queryStkStatus } from "./mpesa";

export interface CheckoutItemInput {
  id: string;
  quantity: number;
}

export interface PendingOrderResult {
  orderId: string;
  total: number;
}

/**
 * Create a pending order. Prices and stock are taken from the DB — never from the
 * client — so the amount charged can't be tampered with.
 */
export async function createPendingOrder(
  itemsInput: CheckoutItemInput[],
  customer: { name: string; phone: string }
): Promise<PendingOrderResult> {
  await dbConnect();
  if (!Array.isArray(itemsInput) || itemsInput.length === 0) throw new Error("Your cart is empty.");

  const ids = itemsInput.filter((i) => Types.ObjectId.isValid(i.id)).map((i) => i.id);
  const products = await ProductModel.find({ _id: { $in: ids } }).lean<
    { _id: unknown; slug: string; name: string; price: number; stock: number }[]
  >();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items: { productId: string; slug: string; name: string; price: number; quantity: number }[] = [];
  let subtotal = 0;
  for (const it of itemsInput) {
    const p = byId.get(it.id);
    if (!p) throw new Error("A product in your cart is no longer available.");
    const qty = Math.max(1, Math.floor(it.quantity));
    if (p.stock < qty) throw new Error(`${p.name} only has ${p.stock} left in stock.`);
    subtotal += p.price * qty;
    items.push({ productId: String(p._id), slug: p.slug, name: p.name, price: p.price, quantity: qty });
  }

  const order = await OrderModel.create({
    items,
    subtotal,
    total: subtotal,
    customerName: customer.name,
    customerPhone: customer.phone,
    status: "pending",
    channel: "mpesa",
  });
  return { orderId: String(order._id), total: subtotal };
}

export async function attachCheckout(
  orderId: string,
  data: { merchantRequestId: string; checkoutRequestId: string }
): Promise<void> {
  await OrderModel.findByIdAndUpdate(orderId, data);
}

export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  await OrderModel.updateOne({ _id: orderId, status: "pending" }, { $set: { status: "cancelled", resultDesc: reason } });
}

/** Mark paid and decrement stock. Idempotent: only acts on a still-pending order. */
export async function markOrderPaidByCheckoutId(checkoutRequestId: string, receipt: string | null): Promise<void> {
  await dbConnect();
  const order = await OrderModel.findOne({ checkoutRequestId });
  if (!order || order.status !== "pending") return;
  order.status = "paid";
  order.mpesaReceipt = receipt;
  await order.save();
  for (const it of order.items) {
    await ProductModel.updateOne(
      { _id: it.productId, stock: { $gte: it.quantity } },
      { $inc: { stock: -it.quantity } }
    );
  }
}

export async function markOrderFailedByCheckoutId(checkoutRequestId: string, reason: string): Promise<void> {
  await dbConnect();
  await OrderModel.updateOne({ checkoutRequestId, status: "pending" }, { $set: { status: "cancelled", resultDesc: reason } });
}

export interface OrderStatus {
  status: string;
  receipt: string | null;
  resultDesc: string | null;
}

export async function getOrderStatus(id: string): Promise<OrderStatus | null> {
  await dbConnect();
  if (!Types.ObjectId.isValid(id)) return null;
  const o = await OrderModel.findById(id).lean<{ status: string; mpesaReceipt: string | null; resultDesc: string | null }>();
  return o ? { status: o.status, receipt: o.mpesaReceipt ?? null, resultDesc: o.resultDesc ?? null } : null;
}

/**
 * Return an order's status, but if it's still pending (callback missed/late) ask
 * Safaricom directly via STK Query — throttled to ~once per 8s and only after the
 * push has had ~10s to resolve. Best-effort: failures leave it pending.
 */
export async function reconcileOrderStatus(id: string): Promise<OrderStatus | null> {
  await dbConnect();
  if (!Types.ObjectId.isValid(id)) return null;
  const order = await OrderModel.findById(id);
  if (!order) return null;

  if (order.status === "pending" && order.checkoutRequestId) {
    const now = Date.now();
    const createdAt = (order.get("createdAt") as Date | undefined)?.getTime() ?? 0;
    const lastQuery = order.lastQueryAt ? new Date(order.lastQueryAt).getTime() : 0;
    if (now - createdAt > 10_000 && now - lastQuery > 8_000) {
      order.lastQueryAt = new Date();
      await order.save();
      try {
        const q = await queryStkStatus(order.checkoutRequestId);
        if (q.resultCode === "0") {
          await markOrderPaidByCheckoutId(order.checkoutRequestId, order.mpesaReceipt ?? null);
        } else if (q.resultCode !== "PENDING" && q.resultCode !== "1037") {
          await markOrderFailedByCheckoutId(order.checkoutRequestId, q.resultDesc);
        }
      } catch {
        /* leave pending; the callback or a later poll may still resolve it */
      }
    }
  }

  const fresh = await OrderModel.findById(id).lean<{ status: string; mpesaReceipt: string | null; resultDesc: string | null }>();
  return fresh ? { status: fresh.status, receipt: fresh.mpesaReceipt ?? null, resultDesc: fresh.resultDesc ?? null } : null;
}
