import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
/** Tabla nocturna con cabeceras doradas. */
export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) { return <div className="w-full overflow-x-auto"><table className={`w-full caption-bottom text-sm ${className}`} {...props} /></div>; }
export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead className="border-b border-[#c7a45a]/20" {...props} />; }
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TableRow({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={`border-b border-[#c7a45a]/10 transition-colors hover:bg-white/[0.04] ${className}`} {...props} />; }
export function TableHead({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={`h-11 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-[.18em] text-[#c7a45a]/75 ${className}`} {...props} />; }
export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={`px-4 py-3 align-middle text-[#efe9dc]/85 ${className}`} {...props} />; }
