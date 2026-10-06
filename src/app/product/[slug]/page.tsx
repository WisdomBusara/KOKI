import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Shield, Truck, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import ProductBuy from "@/components/shop/ProductBuy";
import ProductCard from "@/components/shop/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import {
  formatPrice,
  categoryLabel,
  field1Label,
  field2Label,
  field3Label,
  getStockStatus,
} from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description ?? `${product.name} — available at KOKI.`,
    openGraph: product.imageUrl
      ? { images: [{ url: product.imageUrl }], title: product.name }
      : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const status = getStockStatus(product.stock);
  const related = await getRelatedProducts(product.category, product.slug);

  const fields = [
    { label: field1Label(product.category), value: product.field1 },
    { label: field2Label(product.category), value: product.field2 },
    { label: field3Label(product.category), value: product.field3 },
  ].filter((f) => f.value);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                <span className="font-serif text-6xl text-stone-300">K</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Badge variant="secondary" className="self-start mb-3">{categoryLabel(product.category)}</Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight">
              {product.name}
            </h1>
            <div className="mt-3 text-2xl font-semibold text-stone-900">{formatPrice(product.price)}</div>

            {product.description && (
              <p className="mt-5 text-stone-600 leading-relaxed">{product.description}</p>
            )}

            <div className="mt-6">
              <ProductBuy product={product} />
            </div>

            {fields.length > 0 && (
              <>
                <Separator className="my-7" />
                <dl className="space-y-4">
                  {fields.map((f) => (
                    <div key={f.label}>
                      <dt className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-1">{f.label}</dt>
                      <dd className="text-sm text-stone-700 leading-relaxed">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            <Separator className="my-7" />
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                { icon: Shield, label: "100% Authentic" },
                { icon: Truck, label: "48h Nairobi Delivery" },
                { icon: Sparkles, label: "Premium Curated" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-stone-500 text-xs">
                  <Icon className="h-3.5 w-3.5 text-amber-500" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {status === "in_stock" && (
              <p className="mt-4 text-xs text-emerald-600">In stock · ready to ship</p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-6">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
