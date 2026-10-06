import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { wa } from "@/lib/whatsapp";
import { formatPrice } from "@/types";
import { getAllProducts } from "@/lib/products";

// Stock changes often, so render per-request rather than at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getAllProducts();
  const FEATURED = products.filter((p) => p.featured);
  const GRID = products.filter((p) => !p.featured);
  const hero = FEATURED[0];

  return (
    <>
      <Navbar />
      <main>

        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-stone-200" style={{ backgroundColor: "#F7F4EF" }}>
          {/* Fine dotted texture */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(28,25,23,0.6) 1px, transparent 0)",
            backgroundSize: "26px 26px"
          }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Text */}
              <div className="space-y-7">
                <p className="eyebrow">Curated Luxury · Nairobi</p>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-stone-900 leading-[0.98] tracking-tight">
                  Fragrance that<br />
                  <span className="text-gold">lingers</span>, beauty<br />
                  that defines you
                </h1>

                <p className="text-stone-600 text-lg font-light leading-relaxed max-w-md">
                  Designer perfumes and premium cosmetics — authenticated, hand-picked, and delivered across Kenya. Ordered in a single tap.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button variant="brand" size="lg" asChild>
                    <Link href="/shop">
                      Explore the collection <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="whatsapp" size="lg" asChild>
                    <a href={wa.inquiry()} target="_blank" rel="noopener noreferrer">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Order via WhatsApp
                    </a>
                  </Button>
                </div>

                {/* Trust strip */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-6 border-t border-stone-200">
                  {[
                    { icon: Shield, label: "100% Authentic" },
                    { icon: Truck, label: "48h Nairobi Delivery" },
                    { icon: Sparkles, label: "Premium Curated" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-stone-500 text-xs">
                      <Icon className="h-3.5 w-3.5" style={{ color: "var(--gold-dark)" }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero product */}
              {hero && (
                <div className="relative lift">
                  <Link href={`/product/${hero.slug}`} aria-label={hero.name} className="absolute inset-0 z-10 rounded-2xl" />
                  <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_30px_60px_-30px_rgba(28,25,23,0.3)]">
                    <div className="aspect-[4/5] relative overflow-hidden bg-stone-100">
                      {hero.imageUrl && (
                        <Image
                          src={hero.imageUrl}
                          alt={hero.name}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge variant="featured">Featured</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <h2 className="font-serif text-lg font-semibold text-stone-900 leading-snug truncate">{hero.name}</h2>
                        <span className="font-semibold text-stone-900">{formatPrice(hero.price)}</span>
                      </div>
                      <Button variant="brand" size="sm" asChild className="relative z-20 shrink-0">
                        <a href={wa.single(hero.name, hero.price)} target="_blank" rel="noopener noreferrer">
                          Order
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── MARQUEE ─────────────────────────────────────────────────── */}
        <div className="border-y border-stone-200 bg-white py-3 overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {Array(6).fill("Oud · Rose · Vetiver · Saffron · Vitamin C · Hyaluronic Acid · Argan Oil · Jasmine · Amber · Keratin").map((t, i) => (
              <span key={i} className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-medium shrink-0">{t}</span>
            ))}
          </div>
        </div>

        {/* ─── FEATURED PRODUCTS ─────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-2">Hand-Picked</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">Featured Picks</h2>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/shop">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURED.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── CATEGORIES ─────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-stone-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-2">Everything You Need</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">Shop by Category</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Perfumes — Men",   href: "/shop?category=PERFUME_MEN",    emoji: "🖤" },
                { label: "Perfumes — Women", href: "/shop?category=PERFUME_WOMEN",  emoji: "🌹" },
                { label: "Unisex",           href: "/shop?category=PERFUME_UNISEX", emoji: "✨" },
                { label: "Skincare",         href: "/shop?category=SKINCARE",       emoji: "💧" },
                { label: "Makeup",           href: "/shop?category=MAKEUP",         emoji: "💄" },
                { label: "Haircare",         href: "/shop?category=HAIRCARE",       emoji: "🌿" },
              ].map(cat => (
                <Link key={cat.href} href={cat.href}
                  className="group lift rounded-xl border border-stone-200 bg-white p-5 text-center hover:border-[color:var(--gold)]">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-2xl transition-colors group-hover:bg-amber-50">
                    {cat.emoji}
                  </div>
                  <div className="text-xs font-medium leading-tight text-stone-700">{cat.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── REST OF PRODUCTS ───────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-2">The Collection</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">More Products</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {GRID.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        {/* ─── BRAND STORY ───────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-stone-900 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-xs uppercase tracking-widest text-amber-500 font-medium">Our Promise</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Beauty That Refuses<br />to Be <span className="text-gold">Ordinary</span>
            </h2>
            <p className="text-stone-400 text-lg font-light leading-relaxed max-w-2xl mx-auto">
              KOKI curates only what we&apos;d use ourselves — luxury fragrances and cosmetics sourced from the world&apos;s finest makers, available with a single WhatsApp message.
            </p>
            <Separator className="bg-stone-700/50 max-w-xs mx-auto my-8" />
            <div className="flex justify-center gap-12 text-center">
              {[
                { value: "30+", label: "Products" },
                { value: "100%", label: "Authentic" },
                { value: "48h", label: "Delivery" },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-serif text-3xl font-semibold" style={{ color: "var(--gold)" }}>{s.value}</div>
                  <div className="text-stone-500 text-xs uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ──────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-stone-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-2">Reviews</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">Worn &amp; Loved</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Amara N.", loc: "Westlands", text: "Midnight Oud Reserve is everything. More compliments in two weeks than the past two years combined.", product: "Midnight Oud Reserve" },
                { name: "Fatuma H.", loc: "Kilimani", text: "The Luminous Glow Serum actually works — my skin has never looked this clear. KOKI is my go-to now.", product: "Luminous Glow Serum" },
                { name: "David O.", loc: "Karen", text: "Ordering via WhatsApp was so easy. Delivery was next day. The quality rivals anything I've ordered from Dubai.", product: "Emerald Grove" },
              ].map(t => (
                <Card key={t.name} className="border-stone-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-0.5">
                      {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">{t.name}</p>
                        <p className="text-stone-400 text-xs">{t.loc}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{t.product}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHATSAPP CTA ──────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6" style={{ background: "linear-gradient(135deg, #046307 0%, #057a09 100%)" }}>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-emerald-200 text-xs uppercase tracking-widest font-medium">Simple · Fast · Trusted</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">Order in 3 Taps</h2>
            <p className="text-emerald-100/70 text-lg font-light">
              No checkout forms. Pick your product, tap the button, confirm via WhatsApp. Delivered to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="default" size="xl" className="bg-white text-emerald-800 hover:bg-stone-100" asChild>
                <a href={wa.inquiry()} target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="xl" className="border-emerald-300/40 text-white hover:bg-emerald-700/30 hover:border-emerald-300/60" asChild>
                <Link href="/shop">Browse Collection</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <FloatingWhatsApp />
    </>
  );
}
