"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Smartphone, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPrice } from "@/types";

type Stage = "form" | "waiting" | "paid" | "error";

export default function CheckoutView() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const hydrated = useHydrated();

  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  if (!hydrated) return <div className="py-24 text-center text-stone-400">Loading…</div>;

  if (items.length === 0 && stage !== "paid") {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Your cart is empty</h2>
        <Button variant="brand" size="lg" asChild className="mt-6">
          <Link href="/shop">Browse the collection <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  function startPolling(orderId: string) {
    const started = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - started > 120_000) {
        if (pollRef.current) clearInterval(pollRef.current);
        setError("We didn't get a confirmation in time. If you paid, your order is safe — contact us on WhatsApp.");
        setStage("error");
        return;
      }
      try {
        const res = await fetch(`/api/orders/status?id=${orderId}`, { cache: "no-store" });
        const data = await res.json();
        if (data.status === "paid") {
          if (pollRef.current) clearInterval(pollRef.current);
          setReceipt(data.receipt ?? null);
          setStage("paid");
          clear();
        } else if (data.status === "cancelled") {
          if (pollRef.current) clearInterval(pollRef.current);
          setError(data.resultDesc || "The payment was cancelled or failed. Please try again.");
          setStage("error");
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStage("waiting");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        setStage("error");
        return;
      }
      setMessage(data.message || "Check your phone and enter your M-Pesa PIN.");
      startPolling(data.orderId);
    } catch {
      setError("Network error. Please try again.");
      setStage("error");
    }
  }

  if (stage === "paid") {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Payment received</h2>
        <p className="mt-2 text-stone-600">
          Thank you{name ? `, ${name.split(" ")[0]}` : ""}! Your order is confirmed
          {receipt ? <> — M-Pesa receipt <span className="font-semibold">{receipt}</span></> : null}. We&apos;ll be in touch about delivery.
        </p>
        <Button variant="brand" size="lg" asChild className="mt-6">
          <Link href="/shop">Continue shopping <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  if (stage === "waiting") {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <Loader2 className="h-10 w-10 text-amber-500 mx-auto mb-4 animate-spin" />
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Check your phone</h2>
        <p className="mt-2 text-stone-600">{message}</p>
        <p className="mt-4 text-sm text-stone-400">Enter your M-Pesa PIN to pay {formatPrice(total)}. This can take a few seconds…</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        {stage === "error" && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">M-Pesa phone number</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="0712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-xs text-stone-400">You&apos;ll get an STK prompt on this number to approve payment.</p>
          </div>
          <Button type="submit" variant="brand" size="lg" className="w-full">
            <Smartphone className="h-4 w-4" /> Pay {formatPrice(total)} with M-Pesa
          </Button>
        </form>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-1">
        <div className="rounded-xl border border-stone-200 p-5 sm:p-6">
          <h2 className="font-serif text-lg font-semibold text-stone-900">Order summary</h2>
          <Separator className="my-4" />
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 text-stone-600">
                <span className="truncate">{i.quantity}× {i.name}</span>
                <span className="shrink-0 text-stone-900">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex items-center justify-between font-semibold text-stone-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
