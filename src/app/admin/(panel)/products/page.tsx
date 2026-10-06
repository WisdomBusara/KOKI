import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getAllProducts } from "@/lib/products";
import { formatPrice, categoryLabel } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function stockClass(stock: number) {
  if (stock === 0) return "text-red-600";
  if (stock < 5) return "text-orange-600";
  return "text-stone-700";
}

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Products</h1>
        <Button variant="brand" asChild>
          <Link href="/admin/products/new"><Plus className="h-4 w-4" /> New product</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-stone-500 border-b border-stone-200">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium text-right">Price</th>
              <th className="p-4 font-medium text-right">Stock</th>
              <th className="p-4 font-medium">Featured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="p-4">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 group">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-stone-100">
                      {p.imageUrl && (
                        <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </span>
                    <span className="font-medium text-stone-900 group-hover:text-amber-700">{p.name}</span>
                  </Link>
                </td>
                <td className="p-4 text-stone-600">{categoryLabel(p.category)}</td>
                <td className="p-4 text-right text-stone-900">{formatPrice(p.price)}</td>
                <td className={cn("p-4 text-right font-semibold", stockClass(p.stock))}>{p.stock}</td>
                <td className="p-4">{p.featured ? "★" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-stone-500">No products yet.</p>}
      </div>
    </div>
  );
}
