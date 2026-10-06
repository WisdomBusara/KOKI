export type Category = "PERFUME_MEN" | "PERFUME_WOMEN" | "PERFUME_UNISEX" | "SKINCARE" | "MAKEUP" | "HAIRCARE";

export const CATEGORIES: { value: Category; label: string; group: "Perfumes" | "Cosmetics" }[] = [
  { value: "PERFUME_MEN",    label: "Perfumes — Men",    group: "Perfumes"  },
  { value: "PERFUME_WOMEN",  label: "Perfumes — Women",  group: "Perfumes"  },
  { value: "PERFUME_UNISEX", label: "Perfumes — Unisex", group: "Perfumes"  },
  { value: "SKINCARE",       label: "Skincare",           group: "Cosmetics" },
  { value: "MAKEUP",         label: "Makeup",             group: "Cosmetics" },
  { value: "HAIRCARE",       label: "Haircare",           group: "Cosmetics" },
];

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  description: string | null;
  imageUrl: string | null;
  thumbUrl: string | null;
  // Perfume: Top/Middle/Base notes. Cosmetics: Ingredients/Benefits/Usage
  field1: string | null;
  field2: string | null;
  field3: string | null;
  stock: number;
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out_of_stock";
  if (stock < 5)  return "low_stock";
  return "in_stock";
}

export function formatPrice(price: number, currency = "KES"): string {
  return `${currency} ${price.toLocaleString("en-KE")}`;
}

export function categoryLabel(cat: Category): string {
  return CATEGORIES.find(c => c.value === cat)?.label ?? cat;
}

export function field1Label(cat: Category): string {
  return cat.startsWith("PERFUME") ? "Top Notes" : "Key Ingredients";
}
export function field2Label(cat: Category): string {
  return cat.startsWith("PERFUME") ? "Heart Notes" : "Benefits";
}
export function field3Label(cat: Category): string {
  return cat.startsWith("PERFUME") ? "Base Notes" : "How to Use";
}
