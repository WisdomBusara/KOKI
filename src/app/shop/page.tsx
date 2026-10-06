import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import ProductCard from "@/components/shop/ProductCard";
import { getProducts, type ProductGroup } from "@/lib/products";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shop",
  description: "Browse KOKI's full collection of luxury fragrances and cosmetics.",
};

const CATEGORY_SET = new Set<string>(CATEGORIES.map((c) => c.value));

type Filter = { label: string; href: string; active: boolean };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; group?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category && CATEGORY_SET.has(sp.category) ? (sp.category as Category) : undefined;
  const group =
    sp.group === "perfumes" || sp.group === "cosmetics" ? (sp.group as ProductGroup) : undefined;

  const products = await getProducts({ category, group });

  const filters: Filter[] = [
    { label: "All", href: "/shop", active: !category && !group },
    { label: "Perfumes", href: "/shop?group=perfumes", active: group === "perfumes" },
    { label: "Cosmetics", href: "/shop?group=cosmetics", active: group === "cosmetics" },
    ...CATEGORIES.map((c) => ({
      label: c.label,
      href: `/shop?category=${c.value}`,
      active: category === c.value,
    })),
  ];

  const heading = category
    ? CATEGORIES.find((c) => c.value === category)?.label
    : group === "perfumes"
    ? "Perfumes"
    : group === "cosmetics"
    ? "Cosmetics"
    : "All Products";

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-2">The Collection</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">{heading}</h1>
          <p className="mt-2 text-sm text-stone-500">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-medium transition-colors",
                f.active
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-stone-500">No products in this category yet.</p>
            <Link href="/shop" className="mt-3 inline-block text-sm text-amber-700 hover:underline">
              View all products
            </Link>
          </div>
        )}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
