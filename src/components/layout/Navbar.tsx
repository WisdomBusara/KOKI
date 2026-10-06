"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "All Products",  href: "/shop" },
  { label: "Perfumes",      href: "/shop?group=perfumes" },
  { label: "Skincare",      href: "/shop?category=SKINCARE" },
  { label: "Makeup",        href: "/shop?category=MAKEUP" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const hydrated = useHydrated();
  const cartCount = useCart((s) => s.count());
  const count = hydrated ? cartCount : 0; // cart is client-only (localStorage); avoid SSR mismatch

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm"
          : "bg-white/80 backdrop-blur-sm border-b border-stone-100"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-4 w-4 text-gold-500" style={{ color: "var(--gold)" }} />
            <span className="font-serif font-semibold text-xl tracking-wide text-stone-900">
              KO<span style={{ color: "var(--gold)" }}>KI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors duration-150"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
              </Button>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu — inline dropdown (no Sheet to avoid portal issues) */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 pb-4">
            <nav className="max-w-7xl mx-auto px-4 pt-2 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Separator className="my-2" />
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Cart {count > 0 && <Badge variant="brand">{count}</Badge>}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
