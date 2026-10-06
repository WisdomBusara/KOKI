import { getRecentOrders } from "@/lib/admin";
import { formatPrice } from "@/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fulfilled: "bg-sky-50 text-sky-700 border-sky-200",
  cancelled: "bg-stone-100 text-stone-500 border-stone-200",
};

export default async function AdminOrdersPage() {
  const orders = await getRecentOrders();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-10 text-center">
          <p className="text-stone-500">No orders yet.</p>
          <p className="text-sm text-stone-400 mt-1">
            Orders will appear here once checkout (M-Pesa) is live.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-500 border-b border-stone-200">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium text-right">Total</th>
                <th className="p-4 font-medium">Channel</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50 align-top">
                  <td className="p-4 text-stone-600 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("en-KE")}
                  </td>
                  <td className="p-4 text-stone-800">
                    {o.customerName ?? "—"}
                    {o.customerPhone && <div className="text-xs text-stone-400">{o.customerPhone}</div>}
                  </td>
                  <td className="p-4 text-stone-600">
                    {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                  </td>
                  <td className="p-4 text-right font-semibold text-stone-900">{formatPrice(o.total)}</td>
                  <td className="p-4 text-stone-600 capitalize">{o.channel}</td>
                  <td className="p-4">
                    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[11px] capitalize", STATUS_STYLES[o.status] ?? "")}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
