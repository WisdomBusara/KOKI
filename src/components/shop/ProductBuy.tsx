"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product, getStockStatus } from "@/types";
import { wa } from "@/lib/whatsapp";
import { useCart } from "@/hooks/useCart";

export default function ProductBuy({ product }: { product: Product }) {
  const status = getStockStatus(product.stock);
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = status === "out_of_stock";
  const max = Math.max(1, product.stock);

  function handleAdd() {
    addItem({ id: product.id, slug: product.slug, name: product.name, price: product.price, imageUrl: product.imageUrl }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (soldOut) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This item is currently sold out.
        </div>
        <a href={wa.single(product.name, product.price)} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" size="lg" className="w-full">
            <MessageCircle className="h-4 w-4" /> Ask about restock on WhatsApp
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-stone-600">Quantity</span>
        <div className="flex items-center rounded-lg border border-stone-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            disabled={qty <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="h-10 w-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            disabled={qty >= max}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {status === "low_stock" && (
          <span className="text-xs text-orange-600">Only {product.stock} left</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="brand"
          size="lg"
          className="flex-1"
          onClick={handleAdd}
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {added ? "Added to cart" : "Add to cart"}
        </Button>
        <a
          href={wa.single(product.name, product.price)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="whatsapp" size="lg" className="w-full">
            <MessageCircle className="h-4 w-4" /> Order via WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
