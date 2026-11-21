import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`field-dark h-10 rounded-xl px-3 ${className}`} {...props} />;
}
