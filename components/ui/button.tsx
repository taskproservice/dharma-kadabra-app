import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "danger" | "gold"; size?: "default" | "sm" };
export function Button({ className = "", variant = "default", size = "default", ...props }: Props) {
  const styles = {
    default: "border border-gold/45 bg-gold/10 text-papyrus hover:border-gold/80 hover:bg-gold/20",
    outline: "border border-gold/30 bg-transparent text-papyrus hover:border-gold/70 hover:bg-gold/10",
    ghost: "text-papyrus/80 hover:bg-papyrus/[0.06] hover:text-papyrus",
    danger: "border border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25",
    gold: "bg-gradient-to-r from-gold-light via-gold to-gold-bright text-obsidian shadow-[0_10px_30px_-14px_rgba(197,160,89,.7)] hover:brightness-110 font-semibold",
  };
  const sizes = { default: "h-10 px-4 text-sm", sm: "h-9 px-3 text-sm" };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${styles[variant]} ${className}`} {...props} />;
}
