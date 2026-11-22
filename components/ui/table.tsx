import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

/** Tabla editorial sobre superficie Papiro (#FCFAF5) con cabeceras doradas oscuras. */
export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full caption-bottom text-sm text-[#1A1A1A] ${className}`} {...props} />
    </div>
  );
}
export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="border-b border-[#C5A059]/35" {...props} />;
}
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}
export function TableRow({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-[#C5A059]/20 transition-colors hover:bg-[#F4EFE6]/70 ${className}`}
      {...props}
    />
  );
}
export function TableHead({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-11 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-[.18em] text-[#8B6914] ${className}`}
      {...props}
    />
  );
}
export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 align-middle text-[#2C2C2C] ${className}`} {...props} />;
}
