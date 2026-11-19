import { create } from "zustand";

export type Product = { id: string; name: string; category: string; price: number; emoji: string; description: string; currency?: "MXN" | "USD"; imageUrl?: string };
type CartItem = Product & { quantity: number };
type CartState = { items: CartItem[]; add: (product: Product) => void; decrement: (id: string) => void; remove: (id: string) => void; clear: () => void };

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (product) => set((state) => ({ items: state.items.some((item) => item.id === product.id) ? state.items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...state.items, { ...product, quantity: 1 }] })),
  decrement: (id) => set((state) => ({ items: state.items.flatMap((item) => item.id === id ? item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [] : [item]) })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clear: () => set({ items: [] }),
}));
