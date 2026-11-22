import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "primary" | "outline" | "ghost" | "danger" | "gold";
type Size = "default" | "sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: Props) {
  const styles: Record<Variant, string> = {
    default:
      "border border-[#C5A059] bg-[#C5A059] text-[#1A1A1A] font-semibold hover:bg-[#b58e45] shadow-[0_8px_22px_-10px_rgba(92,72,48,.3)]",
    primary:
      "bg-[#C5A059] text-[#1A1A1A] font-semibold hover:bg-[#b58e45] shadow-[0_8px_22px_-10px_rgba(92,72,48,.3)]",
    outline:
      "border border-[#2C2C2C]/25 bg-[#FCFAF5] text-[#1A1A1A] hover:border-[#C5A059] hover:bg-[#C5A059]/12",
    ghost:
      "text-[#2C2C2C]/80 hover:bg-[#2C2C2C]/[0.06] hover:text-[#1A1A1A]",
    danger:
      "border border-red-600/35 bg-red-600/10 text-red-800 hover:bg-red-600/18",
    gold:
      "bg-[#C5A059] text-[#1A1A1A] font-semibold shadow-[0_10px_28px_-14px_rgba(92,72,48,.38)] hover:bg-[#b58e45]",
  };
  const sizes: Record<Size, string> = {
    default: "h-10 px-4 text-sm",
    sm: "h-9 px-3 text-sm",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-2 focus-visible:outline-[#9E7B2F] disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
