import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "danger" | "gold"; size?: "default" | "sm" };
export function Button({ className = "", variant = "default", size = "default", ...props }: Props) {
  const styles = {
    default: "border border-[#c7a45a]/45 bg-[#c7a45a]/10 text-[#e9e2d2] hover:border-[#c7a45a]/80 hover:bg-[#c7a45a]/20",
    outline: "border border-[#c7a45a]/30 bg-transparent text-[#e9e2d2] hover:border-[#c7a45a]/70 hover:bg-[#c7a45a]/10",
    ghost: "text-[#e9e2d2]/80 hover:bg-white/[0.06] hover:text-[#f7f2e7]",
    danger: "border border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25",
    gold: "bg-gradient-to-r from-[#d8bc7f] via-[#c7a45a] to-[#e3c57c] text-[#11182b] shadow-[0_10px_30px_-14px_rgba(199,164,90,.7)] hover:brightness-110 font-semibold",
  };
  const sizes = { default: "h-10 px-4 text-sm", sm: "h-9 px-3 text-sm" };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${styles[variant]} ${className}`} {...props} />;
}
