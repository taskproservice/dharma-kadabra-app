"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CreditCard, MessageCircle, Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { useCartStore } from "../../../stores/cart";
import { useCozyStore } from "../../../stores/cozy";
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
  const openCozy = useCozyStore((state) => state.open);
  const sendCozyMessage = useCozyStore((state) => state.sendMessage);
  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({});

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
  const whatsappReady =
    whatsappDigits.length >= 10 &&
    !whatsappDigits.endsWith("1234567") &&
    !whatsappDigits.endsWith("12345678");

  const orderSummaryText = useMemo(() => {
    if (items.length === 0) return "";
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
    return (
      `Hola, me gustaría completar mi pedido en Holistic Store:\n` +
      `${lines.join("\n")}\n\n` +
      `Total estimado: ${totalSummary}`
    );
  }, [items, totals]);

  const whatsappCheckoutUrl = useMemo(() => {
    if (!whatsappReady || !orderSummaryText) return "";
    return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(orderSummaryText)}`;
  }, [orderSummaryText, whatsappDigits, whatsappReady]);

  const handleCozyOrder = () => {
    setOpen(false);
    openCozy();
    if (orderSummaryText) {
      void sendCozyMessage(orderSummaryText);
    }
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setOpen}>
      <DrawerContent closeLabel="Cerrar carrito">
        <DrawerHeader>
          <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-bronze/80">
            Holistic Store
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <DrawerTitle className="font-display text-3xl leading-none text-ink">
              Tu Carrito
            </DrawerTitle>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-bronze">
              {count} {count === 1 ? "pieza" : "piezas"}
            </span>
          </div>
          <DrawerDescription className="mt-2 text-xs leading-6 text-ink-muted">
            Piezas elegidas con intención listas para acompañarte.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {items.length === 0 ? (
            <div className="grid h-full min-h-[240px] place-items-center text-center">
              <div className="max-w-xs">
                <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/30 bg-gold/10 text-bronze">
                  <Sparkles size={22} />
                </span>
                <p className="mt-5 font-display text-2xl text-ink">Tu carrito está vacío</p>
                <p className="mt-2 text-xs leading-6 text-ink-muted">
                  Explora la tienda holística y agrega tus piezas favoritas para continuar.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const currency = item.currency ?? "MXN";
                const showImg = Boolean(item.imageUrl) && !failedImgs[item.id];
                return (
                  <li
                    key={item.id}
                    className="cart-item-in flex gap-4 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-papyrus">
                      {showImg && item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="64px"
                          onError={() =>
                            setFailedImgs((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-display text-2xl text-gold/60">
                          {item.emoji || "✧"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-bronze/80">
                            {item.category}
                          </p>
                          <h3 className="truncate font-display text-base text-ink">
                            {item.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={`Quitar ${item.name} del carrito`}
                          className="rounded-lg p-1.5 text-ink-muted/60 transition hover:bg-papyrus hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-lg border border-stone-200 bg-papyrus-light">
                          <button
                            type="button"
                            onClick={() => decrement(item.id)}
                            aria-label={`Disminuir cantidad de ${item.name}`}
                            className="grid size-7 place-items-center text-sanctuary-ink-soft transition hover:text-bronze"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="min-w-[1.75rem] text-center text-xs font-semibold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            aria-label={`Aumentar cantidad de ${item.name}`}
                            className="grid size-7 place-items-center text-sanctuary-ink-soft transition hover:text-bronze"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <p className="text-xs font-bold text-ink">
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
          <div className="border-t border-stone-200 bg-white px-6 py-5 sm:px-8">
            <div className="space-y-1.5">
              {totals.map(([currency, amount]) => (
                <div key={currency} className="flex items-center justify-between text-sm">
                  <span className="text-xs uppercase tracking-[.2em] text-ink-muted">
                    Subtotal ({currency})
                  </span>
                  <span className="font-bold text-ink">{formatPrice(amount, currency)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {whatsappReady ? (
                <a
                  href={whatsappCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-[11px] font-bold uppercase tracking-[.2em] text-ink transition hover:bg-gold-light"
                >
                  <MessageCircle size={15} />
                  <span>Finalizar pedido por WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleCozyOrder}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-[11px] font-bold uppercase tracking-[.2em] text-ink transition hover:bg-gold-light"
                >
                  <MessageCircle size={15} />
                  <span>Confirmar pedido con Cozy</span>
                </button>
              )}

              {/* Pasarela de pago en línea — función futura señalada sin frustración */}
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Próximamente: pasarela de pago en línea con tarjeta en integración"
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-stone-200 bg-papyrus-light px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.18em] text-ink-muted/60 opacity-75"
              >
                <CreditCard size={14} className="text-bronze/60" />
                <span>Pago con tarjeta · Próximamente</span>
              </button>

              <button
                type="button"
                onClick={clear}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-transparent px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.2em] text-ink-muted transition hover:border-gold/60 hover:text-bronze"
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
