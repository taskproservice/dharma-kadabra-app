import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
  currency?: "MXN" | "USD";
  imageUrl?: string;
};

export type CartItem = Product & { quantity: number };

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product) => void;
  addToCart: (product: Product) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
};

const addItemToList = (items: CartItem[], product: Product): CartItem[] =>
  items.some((item) => item.id === product.id)
    ? items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      )
    : [...items, { ...product, quantity: 1 }];

const createCartSlice: StateCreator<CartState> = (set) => ({
  items: [],
  isOpen: false,
  add: (product) => set((state) => ({ items: addItemToList(state.items, product) })),
  addToCart: (product) => set((state) => ({ items: addItemToList(state.items, product) })),
  decrement: (id) =>
    set((state) => ({
      items: state.items.flatMap((item) =>
        item.id === id
          ? item.quantity > 1
            ? [{ ...item, quantity: item.quantity - 1 }]
            : []
          : [item],
      ),
    })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clear: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setOpen: (open) => set({ isOpen: open }),
});

/**
 * Carrito público de Holistic Store (`/tienda` y `PublicHeader`).
 * Persiste únicamente `items` en `localStorage` para conservar la selección
 * del visitante entre recargas y navegación, sin abrir el drawer al hidratar.
 */
export const useCartStore = create<CartState>()(
  persist(createCartSlice, {
    name: "dk-holistic-cart-v1",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ items: state.items }),
  }),
);

/**
 * Carrito interno exclusivo del Punto de Venta (`/dashboard/pos` e Inventario).
 * Aislado del carrito público para que las operaciones de caja del equipo
 * jamás contaminen la bolsa de compras de la tienda web.
 */
export const usePosCartStore = create<CartState>()(createCartSlice);
