"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, MessageCircle, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Product, getStockStatus, formatPrice, categoryLabel } from "@/types";
import { wa } from "@/lib/whatsapp";
import { useCart } from "@/hooks/useCart";

function stockBadgeVariant(status: ReturnType<typeof getStockStatus>) {
  if (status === "out_of_stock") return "out" as const;
  if (status === "low_stock") return "low" as const;
  return "in" as const;
}
function stockLabel(status: ReturnType<typeof getStockStatus>, stock: number) {
  if (status === "out_of_stock") return "Sold Out";
  if (status === "low_stock") return `${stock} left`;
  return "In Stock";
}

function categoryBadgeVariant(category: Product["category"]) {
  if (!category.startsWith("PERFUME")) return "secondary" as const;
  if (category === "PERFUME_MEN") return "men" as const;
  if (category === "PERFUME_WOMEN") return "women" as const;
  return "unisex" as const;
}

export default function ProductCard({ product }: { product: Product }) {
  const status = getStockStatus(product.stock);
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ id: product.id, slug: product.slug, name: product.name, price: product.price, imageUrl: product.imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Card className="group relative h-full overflow-hidden border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-300">
      {/* Stretched link covers the card for navigation; interactive controls sit above it (z-20). */}
      <Link
        href={`/product/${product.slug}`}
        aria-label={product.name}
        className="absolute inset-0 z-10"
      />

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 product-card-img">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <span className="font-serif text-4xl text-stone-300">K</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          <Badge variant={categoryBadgeVariant(product.category)} className="text-[9px]">
            {categoryLabel(product.category)}
          </Badge>
          {product.featured && <Badge variant="featured" className="text-[9px]">Featured</Badge>}
        </div>

        {/* Stock badge */}
        {status !== "in_stock" && (
          <div className="absolute top-3 right-3 z-20">
            <Badge variant={stockBadgeVariant(status)} className="text-[9px]">
              {stockLabel(status, product.stock)}
            </Badge>
          </div>
        )}

        {/* Quick WhatsApp — slides up on hover */}
        {status !== "out_of_stock" && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-20 p-3 translate-y-full group-hover:translate-y-0",
              "transition-transform duration-300 ease-out",
              "bg-gradient-to-t from-stone-900/90 to-stone-900/0 backdrop-blur-[2px]"
            )}
          >
            <a
              href={wa.single(product.name, product.price)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button variant="whatsapp" size="sm" className="w-full text-[11px]">
                <MessageCircle className="h-3.5 w-3.5" />
                Order via WhatsApp
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-serif text-[15px] font-medium text-stone-900 leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
          {product.field1 && (
            <p className="text-xs text-stone-400 mt-1 truncate">
              {product.field1.split(",").slice(0, 2).join(" · ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-stone-100">
          <span className="font-semibold text-sm text-stone-900">{formatPrice(product.price)}</span>

          {status !== "out_of_stock" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "relative z-20 h-7 px-2 text-[11px] gap-1",
                added ? "text-emerald-600 hover:text-emerald-600" : "text-stone-400 hover:text-stone-700"
              )}
              onClick={handleAdd}
            >
              {added ? <Check className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
              {added ? "Added" : "Add"}
            </Button>
          ) : (
            <span className="text-[11px] text-stone-300 uppercase tracking-wide">Unavailable</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
