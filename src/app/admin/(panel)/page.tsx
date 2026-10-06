import Link from "next/link";
import { Package, Boxes, Wallet, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { getAdminStats } from "@/lib/admin";
import { formatPrice } from "@/types";

export const dynamic = "force-dynamic";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-wide">
        <Icon className={`h-4 w-4 ${accent ?? "text-stone-400"}`} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-stone-900">{value}</div>
    </div>
  );
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Total sales" value={formatPrice(stats.totalSales)} accent="text-emerald-500" />
        <StatCard icon={Wallet} label="Inventory value" value={formatPrice(stats.inventoryValue)} accent="text-amber-500" />
        <StatCard icon={Clock} label="Pending orders" value={String(stats.pendingOrderCount)} accent="text-sky-500" />
        <StatCard icon={Package} label="Products" value={String(stats.productCount)} />
        <StatCard icon={Boxes} label="Units in stock" value={String(stats.inventoryUnits)} />
        <StatCard icon={AlertTriangle} label="Out of stock" value={String(stats.outOfStock)} accent="text-red-500" />
      </div>

      {/* Low stock */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-stone-900 mb-3">Low stock (under 5 left)</h2>
        <div className="rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
          {stats.lowStock.length === 0 ? (
            <p className="p-5 text-sm text-stone-500">Nothing running low. 🎉</p>
          ) : (
            stats.lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
              >
                <span className="text-sm text-stone-800">{p.name}</span>
                <span className="text-sm font-semibold text-orange-600">{p.stock} left</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
