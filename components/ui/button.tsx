import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "danger"; size?: "default" | "sm" };
export function Button({ className = "", variant = "default", size = "default", ...props }: Props) {
  const styles = {
    default: "bg-[#3E2723] text-[#F4ECD8] hover:bg-[#55362f]",
    outline: "border border-[#3E2723]/20 bg-white/50 hover:bg-white",
    ghost: "hover:bg-[#3E2723]/5",
    danger: "bg-red-700 text-white hover:bg-red-800",
  };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:pointer-events-none disabled:opacity-50 ${size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm"} ${styles[variant]} ${className}`} {...props} />;
}
