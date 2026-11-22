"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { useCartStore } from "../../../stores/cart";
import { STORE_WHATSAPP } from "../constants";
import { formatPrice } from "../utils";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const setOpen = useCartStore((state) => state.setOpen);
  const addToCart = useCartStore((state) => state.addToCart);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const currency = item.currency ?? "MXN";
      map.set(currency, (map.get(currency) ?? 0) + item.price * item.quantity);
    }
    return [...map.entries()];
  }, [items]);

  const whatsappNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? STORE_WHATSAPP;
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");
  const whatsappReady = whatsappDigits.length >= 10;

  const whatsappCheckoutUrl = useMemo(() => {
    if (!whatsappReady || items.length === 0) return "";
    const lines = items.map(
      (item) =>
        `• ${item.quantity}× ${item.name} (#${item.id}) — ${formatPrice(
          item.price * item.quantity,
          item.currency ?? "MXN",
        )}`,
    );
    const totalSummary = totals
      .map(([currency, amount]) => formatPrice(amount, currency))
      .join(" + ");
    const message =
      `Hola, me gustaría completar mi pedido en Holistic Store:\n` +
      `${lines.join("\n")}\n\n` +
      `Total estimado: ${totalSummary}`;
    return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
  }, [items, totals, whatsappDigits, whatsappReady]);

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setOpen}>
      <DrawerContent closeLabel="Cerrar carrito">
        <DrawerHeader>
          <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-[#C5A059]/80">
            Holistic Store
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <DrawerTitle className="font-display text-3xl leading-none text-[#C5A059]">
              Tu Carrito
            </DrawerTitle>
            <span className="rounded-full border border-[#C5A059]/35 bg-[#C5A059]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#e8cf92]">
              {count} {count === 1 ? "pieza" : "piezas"}
            </span>
          </div>
          <DrawerDescription className="mt-2 text-xs leading-6 text-[#F7F3EA]/55">
            Piezas elegidas con intención listas para acompañarte.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {items.length === 0 ? (
            <div className="grid h-full min-h-[240px] place-items-center text-center">
              <div className="max-w-xs">
                <span className="mx-auto grid size-14 place-items-center rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059]">
                  <Sparkles size={22} />
                </span>
                <p className="mt-5 font-display text-2xl text-[#F7F3EA]">Tu carrito está vacío</p>
                <p className="mt-2 text-xs leading-6 text-[#F7F3EA]/55">
                  Explora la tienda holística y agrega tus piezas favoritas para continuar.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const currency = item.currency ?? "MXN";
                return (
                  <li
                    key={item.id}
                    className="cart-item-in flex gap-4 rounded-2xl border border-[#C5A059]/20 bg-white/[0.03] p-3.5"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[#C5A059]/25 bg-[#1b1b1b]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-display text-2xl text-[#C5A059]/60">
                          {item.emoji || "✧"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#C5A059]/80">
                            {item.category}
                          </p>
                          <h3 className="truncate font-display text-base text-[#F7F3EA]">
                            {item.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={`Quitar ${item.name} del carrito`}
                          className="rounded-lg p-1.5 text-[#F7F3EA]/45 transition hover:bg-white/[0.06] hover:text-[#D96538]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-lg border border-[#C5A059]/30 bg-[#121212]">
                          <button
                            type="button"
                            onClick={() => decrement(item.id)}
                            aria-label={`Disminuir cantidad de ${item.name}`}
                            className="grid size-7 place-items-center text-[#F7F3EA]/75 transition hover:text-[#C5A059]"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="min-w-[1.75rem] text-center text-xs font-semibold text-[#F7F3EA]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            aria-label={`Aumentar cantidad de ${item.name}`}
                            className="grid size-7 place-items-center text-[#F7F3EA]/75 transition hover:text-[#C5A059]"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <p className="text-xs font-bold text-[#C5A059]">
                          {formatPrice(item.price * item.quantity, currency)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#C5A059]/20 bg-[#151515] px-6 py-5 sm:px-8">
            <div className="space-y-1.5">
              {totals.map(([currency, amount]) => (
                <div key={currency} className="flex items-center justify-between text-sm">
                  <span className="text-xs uppercase tracking-[.2em] text-[#F7F3EA]/55">
                    Subtotal ({currency})
                  </span>
                  <span className="font-bold text-[#C5A059]">{formatPrice(amount, currency)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {whatsappReady ? (
                <a
                  href={whatsappCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-4 py-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#121212] transition hover:bg-[#d4b26a]"
                >
                  <MessageCircle size={15} />
                  <span>Finalizar pedido por WhatsApp</span>
                </a>
              ) : (
                <Link
                  href="/mi-cuenta"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-4 py-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#121212] transition hover:bg-[#d4b26a]"
                >
                  <ShoppingBag size={15} />
                  <span>Ir a Mi Cuenta</span>
                </Link>
              )}

              <button
                type="button"
                onClick={clear}
                className="inline-flex w-full items-center justify-center rounded-xl border border-[#C5A059]/30 bg-transparent px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.2em] text-[#F7F3EA]/65 transition hover:border-[#C5A059]/60 hover:text-[#F7F3EA]"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
