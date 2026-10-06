"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPrice } from "@/types";
import { wa } from "@/lib/whatsapp";

export default function CartView() {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());

  // Cart lives in localStorage; render only after hydration to avoid a mismatch.
  const mounted = useHydrated();

  if (!mounted) {
    return <div className="py-24 text-center text-stone-400">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Your cart is empty</h2>
        <p className="mt-2 text-stone-500">Discover something you&apos;ll love.</p>
        <Button variant="brand" size="lg" asChild className="mt-6">
          <Link href="/shop">Browse the collection <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  const waHref = wa.cart(
    items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
    total
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-xl border border-stone-200 p-3 sm:p-4">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-stone-300">K</div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/product/${item.slug}`} className="font-serif text-[15px] font-medium text-stone-900 hover:text-amber-700">
                    {item.name}
                  </Link>
                  <p className="text-sm text-stone-500">{formatPrice(item.price)}</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => removeItem(item.id)}
                  className="text-stone-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-lg border border-stone-300">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="h-8 w-8 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="h-8 w-8 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="font-semibold text-sm text-stone-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={clear} className="text-xs text-stone-400 hover:text-red-600 transition-colors">
          Clear cart
        </button>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-1">
        <div className="rounded-xl border border-stone-200 p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-serif text-lg font-semibold text-stone-900">Order summary</h2>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-xs text-stone-400">Delivery calculated at checkout.</p>

          <div className="mt-6 space-y-3">
            <Button variant="brand" size="lg" asChild className="w-full">
              <Link href="/checkout">Checkout with M-Pesa <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="whatsapp" size="lg" className="w-full">
                <MessageCircle className="h-4 w-4" /> Order via WhatsApp
              </Button>
            </a>
          </div>

          <Link href="/shop" className="mt-4 block text-center text-xs text-stone-500 hover:text-stone-900">
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
