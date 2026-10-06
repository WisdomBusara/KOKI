import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", weight: ["400","500","600","700","800"] });

export const metadata: Metadata = {
  title: { default: "KOKI | Luxury Cosmetics & Designer Perfumes", template: "%s | KOKI" },
  description: "Premium cosmetics and designer fragrances. Order via WhatsApp.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://koki.wisdombusara.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
