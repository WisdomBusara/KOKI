import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import CheckoutView from "@/components/shop/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Pay securely with M-Pesa.",
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 mb-8">Checkout</h1>
        <CheckoutView />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
