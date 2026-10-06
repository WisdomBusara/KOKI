"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((s) => {
          const qty = Math.max(1, Math.floor(quantity));
          const ex = s.items.find((i) => i.id === item.id);
          if (ex) return { items: s.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i) };
          return { items: [...s.items, { ...item, quantity: qty }] };
        }),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) => {
        if (qty < 1) { get().removeItem(id); return; }
        set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, quantity: qty } : i) }));
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "koki-cart" }
  )
);
