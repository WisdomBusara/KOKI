import Link from "next/link";
import { Sparkles, LayoutDashboard, Package, ShoppingCart, LogOut, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-stone-100 md:flex">
      {/* Sidebar */}
      <aside className="md:w-60 md:shrink-0 bg-stone-900 text-stone-300 md:min-h-screen md:sticky md:top-0 md:h-screen flex md:flex-col">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-stone-800 shrink-0">
          <Sparkles className="h-4 w-4" style={{ color: "var(--gold)" }} />
          <span className="font-serif font-semibold text-lg text-white">
            KO<span style={{ color: "var(--gold)" }}>KI</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-stone-500 ml-1">Admin</span>
        </div>

        <nav className="flex md:flex-col gap-1 p-3 flex-1 overflow-x-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-stone-800 hover:text-white transition-colors whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block p-3 border-t border-stone-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> View store
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
          {session?.email && <p className="px-3 pt-2 text-[11px] text-stone-600 truncate">{session.email}</p>}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
