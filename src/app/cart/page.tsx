import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import CartView from "@/components/shop/CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your KOKI selections and check out.",
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 mb-8">Your Cart</h1>
        <CartView />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
