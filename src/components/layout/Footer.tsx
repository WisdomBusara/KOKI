import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { wa } from "@/lib/whatsapp";

const SHOP_LINKS: [string, string][] = [
  ["All Products", "/shop"],
  ["Perfumes", "/shop?group=perfumes"],
  ["Skincare", "/shop?category=SKINCARE"],
  ["Makeup", "/shop?category=MAKEUP"],
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <div className="font-serif text-2xl font-semibold text-white mb-3">
              KO<span style={{ color: "var(--gold)" }}>KI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Luxury cosmetics and designer perfumes. Curated for the discerning, delivered across Kenya.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500 mb-3 font-medium">Shop</p>
              <ul className="space-y-2 text-sm">
                {SHOP_LINKS.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500 mb-3 font-medium">Order</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href={wa.inquiry()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WhatsApp Order
                  </a>
                </li>
                <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <Separator className="bg-stone-800 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between gap-3 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} KOKI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Accepting WhatsApp orders · Nairobi, Kenya</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
