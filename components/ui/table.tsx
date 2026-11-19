import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) { return <div className="w-full overflow-x-auto"><table className={`w-full caption-bottom text-sm ${className}`} {...props} /></div>; }
export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead {...props} />; }
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TableRow({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={`border-b border-[#3E2723]/10 transition-colors hover:bg-white/40 ${className}`} {...props} />; }
export function TableHead({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={`h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-[#3E2723]/55 ${className}`} {...props} />; }
export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={`px-4 py-3 align-middle ${className}`} {...props} />; }
