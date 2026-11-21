"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

/**
 * Acordeón estilo shadcn/ui (API `single` + `collapsible`), sin dependencias
 * nuevas: mismo contrato visual y de accesibilidad que el componente de
 * Radix (botón con `aria-expanded`, región con `aria-labelledby`).
 */

type AccordionContextValue = {
  value: string | null;
  toggle: (itemValue: string) => void;
  baseId: string;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("Accordion components must be used inside <Accordion>.");
  return context;
}

export function Accordion({
  children,
  className = "",
  defaultValue,
  value: controlledValue,
  onValueChange,
}: {
  children: ReactNode;
  className?: string;
  /** Valor inicial (modo no controlado). */
  defaultValue?: string | null;
  /** Valor controlado. */
  value?: string | null;
  onValueChange?: (value: string | null) => void;
}) {
  const baseId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
    defaultValue ?? null,
  );
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const toggle = useCallback(
    (itemValue: string) => {
      const next = value === itemValue ? null : itemValue;
      if (controlledValue === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange, value],
  );

  return (
    <AccordionContext.Provider value={{ value, toggle, baseId }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

type ItemContextValue = { itemValue: string; open: boolean; triggerId: string; contentId: string };

const ItemContext = createContext<ItemContextValue | null>(null);

export function AccordionItem({
  children,
  value,
  className = "",
}: {
  children: ReactNode;
  value: string;
  className?: string;
}) {
  const { value: openValue, baseId } = useAccordionContext();
  const open = openValue === value;
  return (
    <ItemContext.Provider
      value={{ itemValue: value, open, triggerId: `${baseId}-trigger-${value}`, contentId: `${baseId}-content-${value}` }}
    >
      <div data-state={open ? "open" : "closed"} className={className}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { toggle } = useAccordionContext();
  const item = useContext(ItemContext);
  if (!item) throw new Error("AccordionTrigger must be used inside <AccordionItem>.");
  return (
    <h3>
      <button
        type="button"
        id={item.triggerId}
        aria-expanded={item.open}
        aria-controls={item.contentId}
        data-state={item.open ? "open" : "closed"}
        onClick={() => toggle(item.itemValue)}
        className={`flex w-full items-center justify-between gap-4 text-left ${className}`}
      >
        <span>{children}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-300 ${item.open ? "rotate-180" : ""}`}
        />
      </button>
    </h3>
  );
}

export function AccordionContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const item = useContext(ItemContext);
  if (!item) throw new Error("AccordionContent must be used inside <AccordionItem>.");
  return (
    <div
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      data-state={item.open ? "open" : "closed"}
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        item.open ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}
