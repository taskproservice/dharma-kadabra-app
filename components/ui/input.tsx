import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`h-10 w-full rounded-xl border border-[#3E2723]/15 bg-white/70 px-3 text-sm outline-none placeholder:text-[#3E2723]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 ${className}`} {...props} />;
}
